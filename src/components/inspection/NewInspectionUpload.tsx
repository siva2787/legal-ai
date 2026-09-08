import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  CheckCircle2,
  Sparkles,
  Trash2,
  Info,
  MapPin,
  User,
  X,
  RotateCcw
} from 'lucide-react';
import { PackageImage } from '../../types';
import sampleFrontView from '../../assets/sample-dark-fantasy-front.jpg';
import sampleBackView from '../../assets/sample-dark-fantasy-back.jpg';
import sampleSideView from '../../assets/sample-dark-fantasy-side.jpg';

interface NewInspectionUploadProps {
  onStartAnalysis: (payload: {
    images: PackageImage[];
    metadata: {
      inspection_number: string;
      inspector_name: string;
      location: string;
      category_hint: string;
      market_type: string;
    };
  }) => void;
}

const VIEW_ORDER: PackageImage['view_type'][] = ['Front View', 'Back View', 'Side View'];

function CameraCaptureModal({
  viewType,
  onClose,
  onCapture
}: {
  viewType: PackageImage['view_type'];
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        setError('Unable to access camera. Please check browser permissions or use file upload instead.');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(canvas.toDataURL('image/jpeg', 0.92));
  };

  const handleRetake = () => setCaptured(null);

  const handleUsePhoto = () => {
    if (captured) onCapture(captured);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Capture {viewType}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="relative bg-black aspect-video flex items-center justify-center">
          {error ? (
            <div className="text-center text-white text-sm p-6">{error}</div>
          ) : captured ? (
            <img src={captured} alt="Captured" className="w-full h-full object-contain" />
          ) : (
            <video ref={videoRef} className="w-full h-full object-contain" playsInline muted />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 flex items-center justify-center gap-3">
          {error ? (
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          ) : captured ? (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retake
              </button>
              <button
                onClick={handleUsePhoto}
                className="px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Use Photo
              </button>
            </>
          ) : (
            <button
              onClick={handleCapture}
              className="w-14 h-14 rounded-full bg-white border-4 border-blue-600 hover:bg-blue-50 flex items-center justify-center"
              aria-label="Capture photo"
            >
              <span className="w-9 h-9 rounded-full bg-blue-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function NewInspectionUpload({ onStartAnalysis }: NewInspectionUploadProps) {
  const [inspectionNumber] = useState(`INS-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [inspectorName, setInspectorName] = useState('Rohinth Kumaran');
  const [location, setLocation] = useState('Kumbakonam, Tamil Nadu');
  const [marketType, setMarketType] = useState('Retail Store');
  const [categoryHint, setCategoryHint] = useState('Packaged Snacks');

  const [images, setImages] = useState<PackageImage[]>([]);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [cameraSlot, setCameraSlot] = useState<PackageImage['view_type'] | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const urlToDataUrl = (url: string): Promise<{ dataUrl: string; size: number }> => {
    return fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<{ dataUrl: string; size: number }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ dataUrl: reader.result as string, size: blob.size });
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  };

  const addImage = (dataUrl: string, viewType: PackageImage['view_type'], fileName: string, fileSize: number) => {
    const newImg: PackageImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      view_type: viewType,
      data_url: dataUrl,
      file_name: fileName,
      file_size: fileSize
    };
    setImages((prev) => [...prev.filter((item) => item.view_type !== viewType), newImg]);
  };

  const readFileAsImage = (file: File, viewType: PackageImage['view_type']) => {
    const reader = new FileReader();
    reader.onload = () => {
      addImage(reader.result as string, viewType, file.name, file.size);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, viewType: PackageImage['view_type']) => {
    if (!e.target.files || e.target.files.length === 0) return;
    readFileAsImage(e.target.files[0], viewType);
    e.target.value = '';
  };

  const handleSlotDrop = (e: React.DragEvent<HTMLDivElement>, viewType: PackageImage['view_type']) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    readFileAsImage(files[0], viewType);
  };

  const handleGeneralDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSlot(null);
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    let filled = new Set(images.map((i) => i.view_type));
    files.forEach((file) => {
      const slot = VIEW_ORDER.find((v) => !filled.has(v)) ?? 'Side View';
      filled = new Set([...filled, slot]);
      readFileAsImage(file, slot);
    });
  };

  const handleGeneralFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    let filled = new Set(images.map((i) => i.view_type));
    Array.from(e.target.files).forEach((file) => {
      const slot = VIEW_ORDER.find((v) => !filled.has(v)) ?? 'Side View';
      filled = new Set([...filled, slot]);
      readFileAsImage(file, slot);
    });
    e.target.value = '';
  };

  const handleCameraCapture = (dataUrl: string) => {
    if (!cameraSlot) return;
    addImage(dataUrl, cameraSlot, `${cameraSlot.toLowerCase().replace(' ', '_')}_capture.jpg`, Math.round((dataUrl.length * 3) / 4));
    setCameraSlot(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleProceed = () => {
    onStartAnalysis({
      images,
      metadata: {
        inspection_number: inspectionNumber,
        inspector_name: inspectorName,
        location,
        category_hint: categoryHint,
        market_type: marketType
      }
    });
  };

  return (
    <div id="new-inspection-upload-page" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Workflow Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-sm">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">
              1
            </span>
            <span>Upload</span>
          </div>
          <div className="h-0.5 w-12 sm:w-20 bg-slate-200"></div>

          <div className="flex items-center gap-3 text-slate-400 font-semibold text-sm">
            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
              2
            </span>
            <span className="hidden sm:inline">AI Analysis</span>
          </div>
          <div className="h-0.5 w-12 sm:w-20 bg-slate-200"></div>

          <div className="flex items-center gap-3 text-slate-400 font-semibold text-sm">
            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
              3
            </span>
            <span className="hidden sm:inline">Review Info</span>
          </div>
          <div className="h-0.5 w-12 sm:w-20 bg-slate-200"></div>

          <div className="flex items-center gap-3 text-slate-400 font-semibold text-sm">
            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
              4
            </span>
            <span className="hidden sm:inline">Results</span>
          </div>
          <div className="h-0.5 w-12 sm:w-20 bg-slate-200"></div>

          <div className="flex items-center gap-3 text-slate-400 font-semibold text-sm">
            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
              5
            </span>
            <span className="hidden sm:inline">Report</span>
          </div>
        </div>
      </div>

      {/* Title & Instructions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">New Inspection</h1>
          <p className="text-sm text-slate-500">
            Upload package images for compliance verification under Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={loadingSample}
            onClick={async () => {
              setLoadingSample(true);
              try {
                const [front, back, side] = await Promise.all([
                  urlToDataUrl(sampleFrontView),
                  urlToDataUrl(sampleBackView),
                  urlToDataUrl(sampleSideView)
                ]);
                setImages([
                  {
                    id: 'img-front',
                    view_type: 'Front View',
                    data_url: front.dataUrl,
                    file_name: 'dark_fantasy_front.jpg',
                    file_size: front.size
                  },
                  {
                    id: 'img-back',
                    view_type: 'Back View',
                    data_url: back.dataUrl,
                    file_name: 'dark_fantasy_back.jpg',
                    file_size: back.size
                  },
                  {
                    id: 'img-side',
                    view_type: 'Side View',
                    data_url: side.dataUrl,
                    file_name: 'dark_fantasy_side.jpg',
                    file_size: side.size
                  }
                ]);
              } catch (err) {
                console.warn('Failed to load sample package images:', err);
              } finally {
                setLoadingSample(false);
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loadingSample ? 'Loading Sample...' : 'Reset to Sample Package'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col h-full">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Inspection Metadata
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Inspection Number
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900">
              {inspectionNumber}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Inspector Name & ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Inspection Location / Zone
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Market Type
              </label>
              <select
                value={marketType}
                onChange={(e) => setMarketType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="Retail Store">Retail Store</option>
                <option value="Wholesale Market">Wholesale Market</option>
                <option value="E-Commerce Warehouse">E-Commerce Warehouse</option>
                <option value="Manufacturing Facility">Manufacturing Facility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Commodity Category
              </label>
              <select
                value={categoryHint}
                onChange={(e) => setCategoryHint(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="Packaged Snacks">Packaged Snacks</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Household Products">Household Products</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5 mt-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Rule 6 Notice:</strong> All packaged commodities intended for retail sale must bear legible declarations of generic name, net weight/measure, MRP, month & year of manufacture, and consumer care address.
            </div>
          </div>

          <button
            id="proceed-to-ai-analysis-btn"
            onClick={handleProceed}
            disabled={images.length === 0}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze with AI Engine</span>
          </button>
        </div>

        <div className="lg:col-span-7 space-y-4 flex flex-col h-full">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex-1 flex flex-col">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-1">
              Package Images ({images.length}/3 views uploaded)
            </h2>
            <p className="text-xs text-slate-500 mb-5 mt-2">
              Ensure high clarity for accurate optical recognition and measurement compliance checks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {VIEW_ORDER.map((view) => {
                const img = images.find((i) => i.view_type === view);

                return (
                  <div
                    key={view}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverSlot(view);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverSlot((prev) => (prev === view ? null : prev));
                    }}
                    onDrop={(e) => handleSlotDrop(e, view)}
                    className={`rounded-xl border-2 border-dashed p-3 text-center flex flex-col items-center justify-between min-h-[200px] relative transition-all ${img
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : dragOverSlot === view
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
                      }`}
                  >
                    {img ? (
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 mb-2 relative">
                          <img
                            src={img.data_url}
                            alt={view}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{view}</span>
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-between p-3">
                        <button
                          type="button"
                          onClick={() => setCameraSlot(view)}
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Camera className="w-8 h-8 text-slate-400 mb-2" />
                          <div className="text-xs font-bold text-slate-700">{view}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {view === 'Front View' ? '(Mandatory)' : '(Recommended)'}
                          </div>
                          <div className="text-[10px] text-blue-500 mt-1">Tap to capture or drop image</div>
                        </button>
                        <label className="text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full px-3 py-1 mt-4 cursor-pointer transition-colors">
                          or choose from device
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, view)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverSlot('general');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverSlot((prev) => (prev === 'general' ? null : prev));
              }}
              onDrop={handleGeneralDrop}
              className={`mt-6 border-2 border-dashed rounded-xl p-6 text-center transition-colors flex-1 flex flex-col items-center justify-center ${dragOverSlot === 'general' ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50/60'
                }`}
            >
              <UploadCloud className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">
                Drag and drop additional photos or scans
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Supports JPG, PNG, WEBP high-resolution package label scans
              </div>
              <label className="mt-3 inline-block px-5 py-2.5 bg-blue-600 border border-blue-600 text-xs font-bold text-white rounded-lg shadow-md shadow-blue-500/25 hover:bg-blue-700 cursor-pointer transition-colors">
                Browse Files
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGeneralFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {cameraSlot && (
        <CameraCaptureModal
          viewType={cameraSlot}
          onClose={() => setCameraSlot(null)}
          onCapture={handleCameraCapture}
        />
      )}
    </div>
  );
}