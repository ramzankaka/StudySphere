import { Material } from '../types';

/**
 * Converts stored material (base64 or text) into a real Blob, File, and object URL.
 */
export function materialToFile(material: Material): { blob: Blob; file: File; url: string } {
  let blob: Blob;
  const mimeType =
    material.mimeType ||
    (material.fileType === 'pdf'
      ? 'application/pdf'
      : material.fileType === 'image'
      ? 'image/jpeg'
      : material.fileType === 'code' || material.fileType === 'text'
      ? 'text/plain'
      : 'application/octet-stream');

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
        blob = new Blob([byteNumbers], { type: detectedMime });
      } else {
        const textContent = decodeURIComponent(parts[1] || '');
        blob = new Blob([textContent], { type: detectedMime });
      }
    } catch (err) {
      console.warn('Failed to parse base64 file data, creating fallback blob:', err);
      blob = new Blob([material.fileData], { type: mimeType });
    }
  } else if (material.fileData) {
    blob = new Blob([material.fileData], { type: mimeType || 'text/plain' });
  } else {
    // Plain text fallback if binary file was trimmed
    const fallbackText = `StudySphere Document: ${material.title}
Filename: ${material.fileName}
Category: ${material.category}
Uploaded: ${new Date(material.uploadDate).toLocaleString()}

${material.description ? `Description:\n${material.description}\n\n` : ''}
Tags: ${(material.tags || []).join(', ')}`;
    blob = new Blob([fallbackText], { type: 'text/plain' });
  }

  const file = new File([blob], material.fileName, {
    type: blob.type || mimeType,
    lastModified: new Date(material.uploadDate).getTime() || Date.now(),
  });

  const url = URL.createObjectURL(blob);
  return { blob, file, url };
}

/**
 * Opens material in external device applications or browser window.
 * NEVER automatically downloads the file — downloading is reserved exclusively
 * for explicit download button clicks.
 */
export async function openWithDeviceApp(material: Material): Promise<{
  success: boolean;
  method: 'new_tab' | 'blocked';
  message?: string;
}> {
  try {
    const opened = openInBrowserTab(material);
    if (opened) {
      return { success: true, method: 'new_tab', message: 'Document preview opened!' };
    }

    return { 
      success: false, 
      method: 'blocked', 
      message: 'Pop-up was blocked. View in StudySphere reader or tap Download.' 
    };
  } catch (err) {
    console.error('Failed to open document preview:', err);
    return { success: false, method: 'blocked', message: 'Could not open preview.' };
  }
}

/**
 * Shares material file via native system share sheet (WhatsApp, Quick Share, Bluetooth, etc.)
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
 * Uses a self-contained HTML preview to guarantee mobile browsers (e.g. Android Chrome)
 * do not intercept raw binary blob URLs and trigger automatic downloads.
 */
export function openInBrowserTab(material: Material): boolean {
  try {
    if (material.fileType === 'image' && material.fileData && material.fileData.startsWith('data:image')) {
      const win = window.open(material.fileData, '_blank');
      return Boolean(win && !win.closed);
    }

    const titleEscaped = (material.title || 'Document').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fileEscaped = (material.fileName || 'file').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const descEscaped = (material.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const contentEscaped = (material.fileData && !material.fileData.startsWith('data:') ? material.fileData : '')
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
  <div class="tip">StudySphere Safe Preview • To download this document, use the Download button inside the StudySphere app.</div>
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
