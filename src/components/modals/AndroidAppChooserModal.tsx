import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  ExternalLink, 
  Download, 
  Share2, 
  Check, 
  Sparkles,
  BookOpen,
  Copy,
  Info
} from 'lucide-react';
import { Material, Subject } from '../../types';
import { 
  isPdfMaterial, 
  isSlidesMaterial, 
  isDocMaterial, 
  isSpreadsheetMaterial, 
  isImageMaterial,
  extractWebUrl, 
  downloadMaterialFile, 
  shareMaterialFile,
  materialToFile
} from '../../utils/fileViewer';
import { formatFileSize, COLOR_MAP } from '../../utils/helpers';

export interface AndroidAppOption {
  id: string;
  name: string;
  packageName?: string;
  subtext: string;
  badge?: string;
  brandColor: string;
  bgColor: string;
  iconType: 'camscanner' | 'powerpoint' | 'slides' | 'acrobat' | 'drive' | 'wps' | 'word' | 'excel' | 'chrome' | 'studysphere' | 'system';
}

interface AndroidAppChooserModalProps {
  isOpen: boolean;
  material: Material | null;
  subject?: Subject;
  onClose: () => void;
  onOpenInAppReader: (material: Material) => void;
}

export const AndroidAppChooserModal: React.FC<AndroidAppChooserModalProps> = ({
  isOpen,
  material,
  subject,
  onClose,
  onOpenInAppReader,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // File type detection
  const isWebLink = Boolean(material && extractWebUrl(material.fileData));
  const webUrl = material ? extractWebUrl(material.fileData) : null;
  const isCamScannerLink = Boolean(webUrl && /camscanner/i.test(webUrl));
  const isPdf = material ? isPdfMaterial(material) : false;
  const isSlides = material ? isSlidesMaterial(material) : false;
  const isDoc = material ? isDocMaterial(material) : false;
  const isSpreadsheet = material ? isSpreadsheetMaterial(material) : false;
  const isImage = material ? isImageMaterial(material) : false;

  // Determine file type category key for defaults
  const fileCategoryKey = isCamScannerLink
    ? 'camscanner'
    : isSlides
    ? 'slides'
    : isPdf
    ? 'pdf'
    : isDoc
    ? 'doc'
    : isSpreadsheet
    ? 'sheet'
    : isImage
    ? 'image'
    : 'general';

  // Build the list of Android apps installed on typical devices for this file type
  const getAppOptions = (): AndroidAppOption[] => {
    if (isCamScannerLink) {
      return [
        {
          id: 'camscanner',
          name: 'CamScanner',
          packageName: 'com.intsig.camscanner',
          subtext: 'Scan & Cloud Document Viewer',
          badge: 'Installed • Direct',
          brandColor: '#00a389',
          bgColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          iconType: 'camscanner',
        },
        {
          id: 'acrobat',
          name: 'Adobe Acrobat Reader',
          packageName: 'com.adobe.reader',
          subtext: 'PDF Reader & Cloud Annotator',
          badge: 'Installed',
          brandColor: '#ed2224',
          bgColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          iconType: 'acrobat',
        },
        {
          id: 'wps',
          name: 'WPS Office',
          packageName: 'cn.wps.moffice_eng',
          subtext: 'All-in-One Office & Scanner',
          badge: 'Installed',
          brandColor: '#ff5c26',
          bgColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          iconType: 'wps',
        },
        {
          id: 'drive',
          name: 'Google Drive',
          packageName: 'com.google.android.apps.docs',
          subtext: 'Google Workspace Cloud Hub',
          badge: 'Installed',
          brandColor: '#34a853',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'drive',
        },
        {
          id: 'chrome',
          name: 'Chrome / Default Browser',
          packageName: 'com.android.chrome',
          subtext: 'Web Document Viewer',
          badge: 'Installed',
          brandColor: '#4285f4',
          bgColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
          iconType: 'chrome',
        },
        {
          id: 'studysphere',
          name: 'StudySphere In-App Reader',
          subtext: 'View inside StudySphere without leaving',
          badge: 'Built-in',
          brandColor: '#2563eb',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'studysphere',
        },
        {
          id: 'system',
          name: 'Other Apps... (System Chooser)',
          subtext: 'Choose any other installed app on phone',
          brandColor: '#64748b',
          bgColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
          iconType: 'system',
        },
      ];
    }

    if (isSlides) {
      return [
        {
          id: 'powerpoint',
          name: 'Microsoft PowerPoint',
          packageName: 'com.microsoft.office.powerpoint',
          subtext: 'Slide Presenter & Presentation Editor',
          badge: 'Recommended',
          brandColor: '#d83b01',
          bgColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          iconType: 'powerpoint',
        },
        {
          id: 'slides',
          name: 'Google Slides',
          packageName: 'com.google.android.apps.docs.editors.slides',
          subtext: 'Google Workspace Presentations',
          badge: 'Installed',
          brandColor: '#fbbc04',
          bgColor: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
          iconType: 'slides',
        },
        {
          id: 'wps',
          name: 'WPS Office',
          packageName: 'cn.wps.moffice_eng',
          subtext: 'PowerPoint & Presentation Suite',
          badge: 'Installed',
          brandColor: '#ff5c26',
          bgColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          iconType: 'wps',
        },
        {
          id: 'drive',
          name: 'Google Drive',
          packageName: 'com.google.android.apps.docs',
          subtext: 'Cloud Presentation Viewer',
          badge: 'Installed',
          brandColor: '#34a853',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'drive',
        },
        {
          id: 'studysphere',
          name: 'StudySphere Slide Hub',
          subtext: 'Study summaries & presentation notes',
          badge: 'Built-in',
          brandColor: '#2563eb',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'studysphere',
        },
        {
          id: 'system',
          name: 'Other Apps... (System Chooser)',
          subtext: 'Choose any other installed app on phone',
          brandColor: '#64748b',
          bgColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
          iconType: 'system',
        },
      ];
    }

    if (isPdf) {
      return [
        {
          id: 'acrobat',
          name: 'Adobe Acrobat Reader',
          packageName: 'com.adobe.reader',
          subtext: 'PDF Reader, Annotator & Forms',
          badge: 'Recommended',
          brandColor: '#ed2224',
          bgColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          iconType: 'acrobat',
        },
        {
          id: 'drive',
          name: 'Google Drive PDF Viewer',
          packageName: 'com.google.android.apps.docs',
          subtext: 'Google Workspace PDF Reader',
          badge: 'Installed',
          brandColor: '#34a853',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'drive',
        },
        {
          id: 'wps',
          name: 'WPS Office',
          packageName: 'cn.wps.moffice_eng',
          subtext: 'Document & PDF Suite',
          badge: 'Installed',
          brandColor: '#ff5c26',
          bgColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          iconType: 'wps',
        },
        {
          id: 'studysphere',
          name: 'StudySphere Canvas Reader',
          subtext: 'Zero-download in-app canvas reader',
          badge: 'Built-in',
          brandColor: '#2563eb',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'studysphere',
        },
        {
          id: 'system',
          name: 'Other Apps... (System Chooser)',
          subtext: 'Choose any other installed app on phone',
          brandColor: '#64748b',
          bgColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
          iconType: 'system',
        },
      ];
    }

    if (isDoc) {
      return [
        {
          id: 'word',
          name: 'Microsoft Word',
          packageName: 'com.microsoft.office.word',
          subtext: 'Document Editor & Reader',
          badge: 'Recommended',
          brandColor: '#185abd',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'word',
        },
        {
          id: 'docs',
          name: 'Google Docs',
          packageName: 'com.google.android.apps.docs.editors.docs',
          subtext: 'Google Workspace Documents',
          badge: 'Installed',
          brandColor: '#4285f4',
          bgColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
          iconType: 'drive',
        },
        {
          id: 'wps',
          name: 'WPS Office',
          packageName: 'cn.wps.moffice_eng',
          subtext: 'Word & Document Suite',
          badge: 'Installed',
          brandColor: '#ff5c26',
          bgColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          iconType: 'wps',
        },
        {
          id: 'studysphere',
          name: 'StudySphere In-App Reader',
          subtext: 'View formatted text without leaving',
          badge: 'Built-in',
          brandColor: '#2563eb',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'studysphere',
        },
        {
          id: 'system',
          name: 'Other Apps... (System Chooser)',
          subtext: 'Choose any other installed app on phone',
          brandColor: '#64748b',
          bgColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
          iconType: 'system',
        },
      ];
    }

    if (isSpreadsheet) {
      return [
        {
          id: 'excel',
          name: 'Microsoft Excel',
          packageName: 'com.microsoft.office.excel',
          subtext: 'Spreadsheet & Data Viewer',
          badge: 'Recommended',
          brandColor: '#107c41',
          bgColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          iconType: 'excel',
        },
        {
          id: 'sheets',
          name: 'Google Sheets',
          packageName: 'com.google.android.apps.docs.editors.sheets',
          subtext: 'Google Workspace Spreadsheets',
          badge: 'Installed',
          brandColor: '#0f9d58',
          bgColor: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
          iconType: 'drive',
        },
        {
          id: 'wps',
          name: 'WPS Office',
          packageName: 'cn.wps.moffice_eng',
          subtext: 'Spreadsheet & Data Suite',
          badge: 'Installed',
          brandColor: '#ff5c26',
          bgColor: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          iconType: 'wps',
        },
        {
          id: 'studysphere',
          name: 'StudySphere In-App Reader',
          subtext: 'View tabular data inside StudySphere',
          badge: 'Built-in',
          brandColor: '#2563eb',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          iconType: 'studysphere',
        },
        {
          id: 'system',
          name: 'Other Apps... (System Chooser)',
          subtext: 'Choose any other installed app on phone',
          brandColor: '#64748b',
          bgColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
          iconType: 'system',
        },
      ];
    }

    // Default general options
    return [
      {
        id: 'studysphere',
        name: 'StudySphere In-App Reader',
        subtext: 'View inside StudySphere without leaving',
        badge: 'Recommended',
        brandColor: '#2563eb',
        bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        iconType: 'studysphere',
      },
      {
        id: 'chrome',
        name: 'Chrome / Browser',
        subtext: 'View in full browser window',
        badge: 'Installed',
        brandColor: '#4285f4',
        bgColor: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
        iconType: 'chrome',
      },
      {
        id: 'system',
        name: 'Other Apps... (System Chooser)',
        subtext: 'Choose any other installed app on phone',
        brandColor: '#64748b',
        bgColor: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
        iconType: 'system',
      },
    ];
  };

  const apps = getAppOptions();

  // Load saved default app or select top app
  useEffect(() => {
    if (!isOpen || !material) return;
    try {
      const savedDefault = localStorage.getItem(`studysphere_pref_app_${fileCategoryKey}`);
      if (savedDefault && apps.some((a) => a.id === savedDefault)) {
        setSelectedAppId(savedDefault);
      } else {
        setSelectedAppId(apps[0]?.id || 'studysphere');
      }
    } catch {
      setSelectedAppId(apps[0]?.id || 'studysphere');
    }
  }, [isOpen, material, fileCategoryKey]);

  if (!isOpen || !material) return null;

  const subjectColor = subject ? COLOR_MAP[subject.color] : COLOR_MAP.indigo;

  // Execute action with the chosen app
  const executeAppAction = async (appId: string, isAlways = false) => {
    if (isAlways) {
      try {
        localStorage.setItem(`studysphere_pref_app_${fileCategoryKey}`, appId);
      } catch {}
    }

    const app = apps.find((a) => a.id === appId) || apps[0];

    // Case 1: In-App Reader
    if (appId === 'studysphere') {
      onClose();
      onOpenInAppReader(material);
      return;
    }

    // Case 2: Web / CamScanner link
    if (webUrl) {
      setStatusMsg(`Launching in ${app.name}...`);
      window.open(webUrl, '_blank');
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1000);
      return;
    }

    // Case 3: System Share Chooser (Other Apps...)
    if (appId === 'system') {
      setStatusMsg('Opening Android app chooser...');
      const shared = await shareMaterialFile(material);
      if (shared) {
        setStatusMsg('Action completed!');
      } else {
        // Fallback to downloading so notification opens app chooser
        downloadMaterialFile(material);
        setStatusMsg('Downloaded! Tap notification to open with any app.');
      }
      setTimeout(() => {
        setStatusMsg(null);
        onClose();
      }, 1500);
      return;
    }

    // Case 4: Specific device app selected for a file
    setStatusMsg(`Opening with ${app.name}...`);
    try {
      const { file } = materialToFile(material);
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: material.title,
          text: `Open ${material.title} in ${app.name}`,
          files: [file],
        });
        setStatusMsg(`Opened with ${app.name}!`);
      } else {
        downloadMaterialFile(material);
        setStatusMsg(`Downloaded! Tap notification to open in ${app.name}.`);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        downloadMaterialFile(material);
        setStatusMsg(`Downloaded! Tap notification to open in ${app.name}.`);
      }
    }

    setTimeout(() => {
      setStatusMsg(null);
      onClose();
    }, 1500);
  };

  const handleCopyLink = () => {
    if (!webUrl) return;
    navigator.clipboard.writeText(webUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleQuickDownload = () => {
    downloadMaterialFile(material);
    setStatusMsg('Saved to Downloads! Tap notification to open.');
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleQuickShare = async () => {
    const shared = await shareMaterialFile(material);
    if (shared) {
      setStatusMsg('Shared successfully!');
      setTimeout(() => setStatusMsg(null), 2000);
    }
  };

  // Render authentic app icons
  const renderAppIcon = (type: AndroidAppOption['iconType']) => {
    switch (type) {
      case 'camscanner':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md">
            CS
          </div>
        );
      case 'powerpoint':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-base shadow-md">
            P
          </div>
        );
      case 'slides':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            📊
          </div>
        );
      case 'acrobat':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-md">
            PDF
          </div>
        );
      case 'wps':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white font-black text-base shadow-md">
            W
          </div>
        );
      case 'drive':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-yellow-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-md p-1">
            <span className="bg-white text-slate-900 rounded-lg w-full h-full flex items-center justify-center font-black text-[11px]">
              ▲
            </span>
          </div>
        );
      case 'word':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-base shadow-md">
            W
          </div>
        );
      case 'excel':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-black text-base shadow-md">
            X
          </div>
        );
      case 'chrome':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-500 via-yellow-500 to-emerald-500 flex items-center justify-center text-white shadow-md p-1">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]">
              ●
            </span>
          </div>
        );
      case 'studysphere':
        return (
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <BookOpen size={20} />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-md">
            <Smartphone size={20} />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] text-slate-900 dark:text-slate-100 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android Sheet Pull Handle */}
        <div className="w-full pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Smartphone size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Complete action using
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose an application installed on your device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* File Metadata Overview Card */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {isCamScannerLink ? 'CAMSCANNER LINK' : isSlides ? 'PPTX / SLIDES' : isPdf ? 'PDF' : isDoc ? 'WORD' : isSpreadsheet ? 'EXCEL' : material.category}
              </span>
              {subject && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${subjectColor.badgeBg} ${subjectColor.badgeText}`}>
                  {subject.code}
                </span>
              )}
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-1">
              {material.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
              {material.fileName} {material.fileSize > 0 ? `• ${formatFileSize(material.fileSize)}` : ''}
            </p>
          </div>

          {/* Quick Icon Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {webUrl && (
              <button
                onClick={handleCopyLink}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                title="Copy Link"
              >
                {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            )}
            <button
              onClick={handleQuickShare}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Share file"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handleQuickDownload}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Download to device"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusMsg && (
          <div className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold text-center animate-fadeIn shadow-xs flex items-center justify-center gap-1.5">
            <Sparkles size={14} />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Installed Device Applications List */}
        <div className="p-4 space-y-2.5 overflow-y-auto flex-1 overscroll-contain">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 px-1 uppercase tracking-wider">
            <span>Select Application</span>
            <span className="normal-case font-normal text-[10px] text-slate-500">Tap to select • Double tap to open</span>
          </div>

          <div className="space-y-2">
            {apps.map((app) => {
              const isSelected = selectedAppId === app.id;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  onDoubleClick={() => executeAppAction(app.id, false)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3.5 select-none ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderAppIcon(app.iconType)}

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {app.name}
                        </h4>
                        {app.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {app.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {app.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Radio indicator */}
                  <div className="shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Helpful Hint */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5 mt-2">
            <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              {isCamScannerLink
                ? 'Selecting CamScanner or Chrome opens the scan directly. On Android with CamScanner installed, it launches the native app automatically.'
                : 'Selecting an installed app will launch your phone\'s native viewer (PowerPoint, Acrobat, WPS Office, etc.).'}
            </p>
          </div>
        </div>

        {/* Android "Just Once" & "Always" Bottom Action Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenInAppReader(material);
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-2"
          >
            In-App Reader
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-just-once"
              onClick={() => executeAppAction(selectedAppId, false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition active:scale-95"
            >
              Just Once
            </button>

            <button
              id="btn-open-always"
              onClick={() => executeAppAction(selectedAppId, true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <span>Always</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
