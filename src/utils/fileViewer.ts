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
    const { url } = materialToFile(material);

    // Launch the Blob URL in a new window/tab for preview
    const openedWindow = window.open(url, '_blank');
    if (openedWindow && !openedWindow.closed) {
      return { success: true, method: 'new_tab', message: 'Document opened in preview window!' };
    }

    return { 
      success: false, 
      method: 'blocked', 
      message: 'Pop-up was blocked. Use the In-App Reader or click Download.' 
    };
  } catch (err) {
    console.error('Failed to open document preview:', err);
    return { success: false, method: 'blocked', message: 'Could not open external viewer.' };
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
 * Opens document directly in a new browser window/tab.
 * Does NOT trigger any automatic download if popup is blocked.
 */
export function openInBrowserTab(material: Material): boolean {
  try {
    const { url } = materialToFile(material);
    const win = window.open(url, '_blank');
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
