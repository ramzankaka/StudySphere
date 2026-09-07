import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Loader2, 
  AlertCircle,
  FileText
} from 'lucide-react';

// Configure the worker URL for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PDFCanvasViewerProps {
  dataUrlOrBlob: string | Blob;
  title: string;
  fileName: string;
  description?: string;
}

export const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({
  dataUrlOrBlob,
  title,
  fileName,
  description
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF document
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setRenderError(null);
    setCurrentPage(1);

    const loadPDF = async () => {
      try {
        let loadingTask: any;

        if (typeof dataUrlOrBlob === 'string') {
          if (dataUrlOrBlob.startsWith('data:')) {
            // Convert data URL to Uint8Array
            const base64 = dataUrlOrBlob.split(',')[1] || '';
            const raw = atob(base64);
            const uint8Array = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) {
              uint8Array[i] = raw.charCodeAt(i);
            }
            loadingTask = pdfjsLib.getDocument({ data: uint8Array });
          } else {
            loadingTask = pdfjsLib.getDocument({ url: dataUrlOrBlob });
          }
        } else {
          const arrayBuffer = await dataUrlOrBlob.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        }

        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        try {
          const page1 = await doc.getPage(1);
          const unscaledViewport = page1.getViewport({ scale: 1.0 });
          if (typeof window !== 'undefined' && window.innerWidth < 640 && unscaledViewport.width > 0) {
            const availableWidth = Math.min(window.innerWidth - 40, 560);
            const autoScale = Math.max(0.45, Math.min(1.0, availableWidth / unscaledViewport.width));
            setScale(Number(autoScale.toFixed(2)));
          }
        } catch {}
        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('PDF.js could not parse document (may be mock placeholder):', err);
        setRenderError(err?.message || 'Could not parse PDF content');
        setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [dataUrlOrBlob]);

  // Render current page onto canvas
  useEffect(() => {
    if (!pdfDoc || currentPage < 1 || currentPage > numPages) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Support high DPI screens
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          viewport,
          transform: transform as any,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, currentPage, scale, rotation, numPages]);

  return (
    <div className="w-full flex flex-col items-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
      {/* Reader Toolbar */}
      <div className="w-full px-3 py-2 bg-white dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || isLoading || !!renderError}
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[70px] text-center">
            {numPages > 0 ? `Page ${currentPage} / ${numPages}` : 'Document Reader'}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages || isLoading || !!renderError}
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
            disabled={isLoading || !!renderError}
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
            disabled={isLoading || !!renderError}
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            disabled={isLoading || !!renderError}
            className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition ml-1"
            title="Rotate Page"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="w-full flex-1 min-h-[360px] max-h-[70vh] overflow-auto p-4 flex items-center justify-center bg-slate-200/50 dark:bg-slate-950/80">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-500 dark:text-slate-400">
            <Loader2 size={28} className="animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium">Rendering document pages...</span>
          </div>
        ) : renderError ? (
          /* Graceful Reader Overview when document is a syllabus/lecture summary or format fallback */
          <div className="max-w-md w-full p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4 my-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{fileName}</p>
            </div>
            {description ? (
              <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-lg text-left leading-relaxed border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Document Overview & Study Notes:
                </span>
                {description}
              </div>
            ) : null}
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-lg text-[11px] text-blue-800 dark:text-blue-300">
              Document is ready in StudySphere. Use the toolbar above to adjust views or tap Download if you wish to save a local copy.
            </div>
          </div>
        ) : (
          <div className="shadow-lg rounded-sm overflow-hidden bg-white max-w-full">
            <canvas ref={canvasRef} className="block mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};
