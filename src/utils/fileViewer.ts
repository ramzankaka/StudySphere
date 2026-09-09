import { Material } from '../types';

/**
 * Derives accurate MIME type from filename extension
 */
export function getMimeTypeFromFilename(fileName: string, fallback = 'application/octet-stream'): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pps: 'application/vnd.ms-powerpoint',
    ppsx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    odp: 'application/vnd.oasis.opendocument.presentation',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    odt: 'application/vnd.oasis.opendocument.text',
    rtf: 'application/rtf',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    md: 'text/markdown',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    zip: 'application/zip',
    json: 'application/json',
    js: 'text/javascript',
    ts: 'text/typescript',
    py: 'text/x-python',
    java: 'text/x-java-source',
    cpp: 'text/x-c',
    c: 'text/x-c',
    html: 'text/html',
    css: 'text/css',
  };
  return map[ext] || fallback;
}

/**
 * Extracts a web URL if fileData contains or decodes to a valid http(s):// link
 * (e.g. CamScanner export link, Google Slides link, Google Drive, OneDrive)
 */
export function extractWebUrl(fileData?: string): string | null {
  if (!fileData) return null;
  const trimmed = fileData.trim();
  if (/^https?:\/\/[^\s]+$/i.test(trimmed)) {
    return trimmed;
  }
  if (fileData.startsWith('data:') && fileData.includes('base64,')) {
    try {
      const b64 = fileData.split('base64,')[1];
      const decoded = atob(b64.slice(0, 4000)).trim();
      if (/^https?:\/\/[^\s]+$/i.test(decoded)) {
        return decoded;
      }
    } catch {}
  }
  return null;
}

/**
 * Extracts clean printable text if fileData is plain text or base64 that decodes to text.
 * Returns null if it is binary (PDF, PPTX, image, etc.)
 */
export function extractDecodedText(fileData?: string): string | null {
  if (!fileData) return null;
  if (!fileData.startsWith('data:')) {
    return fileData; // Already plain text
  }
  if (fileData.includes('base64,')) {
    try {
      const b64 = fileData.split('base64,')[1];
      // Exclude binary headers like PDF or ZIP/Office
      if (b64.startsWith('JVBERi0') || b64.startsWith('UEsDB') || b64.startsWith('0M8R4')) {
        return null;
      }
      const decoded = atob(b64);
      // Check if printable ASCII/UTF8
      const isPrintable = /^[\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]*$/.test(decoded.slice(0, 2000));
      if (isPrintable && decoded.trim().length > 0) {
        return decoded;
      }
    } catch {}
  }
  return null;
}

/**
 * Checks if a material is a PDF document
 */
export function isPdfMaterial(material: Material): boolean {
  if (material.fileType === 'pdf') return true;
  if (material.fileName.toLowerCase().endsWith('.pdf')) return true;
  if (material.mimeType === 'application/pdf') return true;
  if (material.fileData) {
    if (material.fileData.startsWith('data:application/pdf')) return true;
    if (material.fileData.includes('JVBERi0')) return true;
  }
  return false;
}

/**
 * Checks if a material is a Presentation / Slide Deck
 */
export function isSlidesMaterial(material: Material): boolean {
  if (material.fileType === 'slides') return true;
  const name = material.fileName.toLowerCase();
  const mime = (material.mimeType || '').toLowerCase();
  if (
    name.endsWith('.ppt') ||
    name.endsWith('.pptx') ||
    name.endsWith('.pps') ||
    name.endsWith('.ppsx') ||
    name.endsWith('.odp') ||
    mime.includes('presentation') ||
    mime.includes('powerpoint')
  ) {
    return true;
  }
  if (material.category === 'Lecture Slides') {
    if (!isPdfMaterial(material) && !isImageMaterial(material)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if a material is an Image
 */
export function isImageMaterial(material: Material): boolean {
  if (material.fileType === 'image') return true;
  const name = material.fileName.toLowerCase();
  const mime = (material.mimeType || '').toLowerCase();
  if (
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp') ||
    name.endsWith('.gif') ||
    name.endsWith('.svg') ||
    mime.startsWith('image/')
  ) {
    return true;
  }
  if (material.fileData && material.fileData.startsWith('data:image/')) {
    return true;
  }
  return false;
}

/**
 * Checks if a material is an Office Word Document
 */
export function isDocMaterial(material: Material): boolean {
  if (material.fileType === 'doc') return true;
  const name = material.fileName.toLowerCase();
  const mime = (material.mimeType || '').toLowerCase();
  return (
    name.endsWith('.doc') ||
    name.endsWith('.docx') ||
    name.endsWith('.odt') ||
    name.endsWith('.rtf') ||
    mime.includes('word') ||
    mime.includes('wordprocessingml')
  );
}

/**
 * Checks if a material is a Spreadsheet
 */
export function isSpreadsheetMaterial(material: Material): boolean {
  const name = material.fileName.toLowerCase();
  const mime = (material.mimeType || '').toLowerCase();
  return (
    name.endsWith('.xls') ||
    name.endsWith('.xlsx') ||
    name.endsWith('.csv') ||
    name.endsWith('.tsv') ||
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('csv')
  );
}

/**
 * Converts stored material into a Blob and native File with accurate MIME types.
 */
export function materialToFile(material: Material): { blob: Blob; file: File; url: string } {
  let blob: Blob;
  const derivedMime = getMimeTypeFromFilename(material.fileName);
  const mimeType = material.mimeType && material.mimeType !== 'application/octet-stream' 
    ? material.mimeType 
    : derivedMime;

  if (material.fileData && material.fileData.startsWith('data:')) {
    try {
      const parts = material.fileData.split(',');
      const header = parts[0];
      const isBase64 = header.includes('base64');
      const detectedMime = header.split(';')[0].replace('data:', '') || mimeType;

      if (isBase64) {
        const base64Data = parts[1] || '';
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        blob = new Blob([byteNumbers], { type: detectedMime !== 'application/octet-stream' ? detectedMime : derivedMime });
      } else {
        const textContent = decodeURIComponent(parts[1] || '');
        blob = new Blob([textContent], { type: detectedMime });
      }
    } catch (err) {
      console.warn('Failed to parse base64 file data, creating fallback blob:', err);
      blob = new Blob([material.fileData], { type: derivedMime });
    }
  } else if (material.fileData) {
    blob = new Blob([material.fileData], { type: derivedMime || 'text/plain' });
  } else {
    const fallbackText = `StudySphere Document: ${material.title}
Filename: ${material.fileName}
Category: ${material.category}
Uploaded: ${new Date(material.uploadDate).toLocaleString()}

${material.description ? `Description:\n${material.description}\n\n` : ''}
Tags: ${(material.tags || []).join(', ')}`;
    blob = new Blob([fallbackText], { type: 'text/plain' });
  }

  const file = new File([blob], material.fileName, {
    type: blob.type || derivedMime,
    lastModified: new Date(material.uploadDate).getTime() || Date.now(),
  });

  const url = URL.createObjectURL(blob);
  return { blob, file, url };
}

/**
 * Opens material with an application installed on the user's device
 * (e.g., Microsoft PowerPoint, Google Slides, WPS Office, Word, Adobe Acrobat)
 * using the device's native app chooser / share sheet.
 */
export async function openWithDeviceApp(material: Material): Promise<{
  success: boolean;
  method: 'share' | 'url' | 'tab' | 'download';
  message: string;
}> {
  // 1. If it's a web link (CamScanner, Google Slides, Drive link), open directly
  const webUrl = extractWebUrl(material.fileData);
  if (webUrl) {
    const win = window.open(webUrl, '_blank');
    if (win) {
      return { success: true, method: 'url', message: 'Opening document link...' };
    }
  }

  // 2. Native Share to installed apps (PowerPoint, Slides, Office, Acrobat) on Android/mobile
  try {
    const { file } = materialToFile(material);
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: material.title,
        text: `Open ${material.title} (${material.category}) in installed app`,
        files: [file],
      });
      return { success: true, method: 'share', message: 'Opening in device app...' };
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: true, method: 'share', message: 'Cancelled.' };
    }
    console.warn('Native open with device app failed:', err);
  }

  // 3. Fallback: Open in safe preview tab
  const tabOpened = openInBrowserTab(material);
  if (tabOpened) {
    return { success: true, method: 'tab', message: 'Opened preview tab.' };
  }

  // 4. Fallback: Save to device so user can open from notification/downloads
  downloadMaterialFile(material);
  return { success: true, method: 'download', message: 'Saved to device downloads. Tap to open.' };
}

/**
 * Shares material file via native system share sheet (WhatsApp, Quick Share, Drive, etc.)
 */
export async function shareMaterialFile(material: Material): Promise<boolean> {
  try {
    const { file } = materialToFile(material);
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: material.title,
        text: `Sharing ${material.title} (${material.category}) from StudySphere`,
        files: [file],
      });
      return true;
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return false; // User cancelled
    }
    console.warn('Share error:', err);
  }
  return false;
}

/**
 * Opens document in a browser window/tab with ZERO automatic downloads.
 * Uses a self-contained HTML preview or web link.
 */
export function openInBrowserTab(material: Material): boolean {
  try {
    // If it's a web link (e.g. CamScanner link)
    const webUrl = extractWebUrl(material.fileData);
    if (webUrl) {
      const win = window.open(webUrl, '_blank');
      return Boolean(win && !win.closed);
    }

    if (material.fileType === 'image' && material.fileData && material.fileData.startsWith('data:image')) {
      const win = window.open(material.fileData, '_blank');
      return Boolean(win && !win.closed);
    }

    const titleEscaped = (material.title || 'Document').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fileEscaped = (material.fileName || 'file').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const descEscaped = (material.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Only show clean text, never raw base64 data URLs
    const decodedText = extractDecodedText(material.fileData);
    const contentEscaped = (decodedText || '')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleEscaped} - StudySphere</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; color: #0f172a; line-height: 1.6; }
    .card { max-width: 680px; margin: 0 auto 16px; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
    h1 { font-size: 18px; margin: 0 0 6px 0; color: #0f172a; }
    .meta { font-size: 12px; color: #64748b; font-family: monospace; }
    .tag { display: inline-block; padding: 2px 8px; background: #dbeafe; color: #1d4ed8; border-radius: 9999px; font-size: 11px; font-weight: 600; margin-right: 6px; }
    .desc { background: #f1f5f9; padding: 12px; border-radius: 8px; font-size: 13px; color: #334155; margin-top: 12px; border-left: 3px solid #3b82f6; }
    .content { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 20px; font-size: 13px; white-space: pre-wrap; font-family: monospace; color: #334155; }
    .tip { text-align: center; font-size: 11px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="margin-bottom: 8px;">
      <span class="tag">${material.category}</span>
      <span class="tag">${(material.fileType || 'Doc').toUpperCase()}</span>
    </div>
    <h1>${titleEscaped}</h1>
    <div class="meta">${fileEscaped} • Uploaded ${new Date(material.uploadDate).toLocaleDateString()}</div>
    ${descEscaped ? `<div class="desc"><strong>Study Overview:</strong><br/>${descEscaped}</div>` : ''}
  </div>
  ${contentEscaped ? `<div class="content">${contentEscaped}</div>` : ''}
  <div class="tip">StudySphere Safe Preview • To download this document, use the Download button inside StudySphere.</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const previewUrl = URL.createObjectURL(blob);
    const win = window.open(previewUrl, '_blank');
    return Boolean(win && !win.closed);
  } catch (e) {
    console.error('Could not open in browser tab:', e);
    return false;
  }
}

/**
 * Downloads the document directly to the device filesystem
 */
export function downloadMaterialFile(material: Material): void {
  const { url } = materialToFile(material);
  const a = document.createElement('a');
  a.href = url;
  a.download = material.fileName;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
  }, 100);
}
