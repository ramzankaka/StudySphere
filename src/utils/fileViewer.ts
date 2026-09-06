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
 * Opens material in external device applications (WPS Office, CamScanner, Drive, Acrobat, ShareIt, etc.)
 * Uses Web Share API with Files when available (Android/iOS), or launches in a new tab / triggers download (PC).
 */
export async function openWithDeviceApp(material: Material): Promise<{
  success: boolean;
  method: 'share_sheet' | 'new_tab' | 'download' | 'cancelled';
  message?: string;
}> {
  try {
    const { file, url } = materialToFile(material);

    // 1. On Mobile devices (Android / iOS): Web Share API with File
    // This triggers Android / iOS native "Complete action using" / "Open with" / "Share to"
    // which displays installed apps like WPS Office, CamScanner, Drive, Acrobat, ShareIt, etc.
    if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: material.title,
          text: `Open ${material.title} (${material.category})`,
          files: [file],
        });
        return { success: true, method: 'share_sheet' };
      } catch (shareErr: unknown) {
        if (shareErr instanceof Error && shareErr.name === 'AbortError') {
          // User dismissed the system share sheet
          return { success: true, method: 'cancelled' };
        }
        console.warn('Native share threw error, falling back:', shareErr);
      }
    }

    // 2. Fallback for PC or browsers without navigator.canShare files:
    // Open the Blob URL directly in a new window/tab
    const openedWindow = window.open(url, '_blank');
    if (openedWindow && !openedWindow.closed) {
      return { success: true, method: 'new_tab' };
    }

    // 3. If popup was blocked by browser, trigger direct download
    downloadMaterialFile(material);
    return { success: true, method: 'download' };
  } catch (err) {
    console.error('Failed to open document with device app:', err);
    // Absolute fallback: download file
    downloadMaterialFile(material);
    return { success: false, method: 'download' };
  }
}

/**
 * Opens document directly in a new browser window/tab
 */
export function openInBrowserTab(material: Material): boolean {
  try {
    const { url } = materialToFile(material);
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // Popup blocked, fallback to download
      downloadMaterialFile(material);
      return false;
    }
    return true;
  } catch (e) {
    console.error('Could not open in browser tab:', e);
    downloadMaterialFile(material);
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
