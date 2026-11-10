import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { TuLlaveCardType } from '../types/tullave';
import { playDepartureChime } from '../utils/audioAlert';
import { triggerHapticFeedback } from '../utils/haptics';

interface CardCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (serialNumber: string, cardType?: TuLlaveCardType) => void;
  systemName?: string;
}

export const CardCameraScannerModal: React.FC<CardCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  systemName = 'TuLlave / Cívica',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setErrorMessage(null);
    setHasPermission(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('El navegador no soporta acceso directo a la cámara.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasPermission(true);
      startDetectionLoop();
    } catch (err: any) {
      setHasPermission(false);
      setErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Permiso de cámara denegado. Puedes escribir el serial o usar la captura de prueba.'
          : 'No se pudo acceder a la cámara en este dispositivo.'
      );
    }
  };

  const startDetectionLoop = () => {
    const BarcodeDetectorClass = (window as any).BarcodeDetector;
    let detector: any = null;

    if (BarcodeDetectorClass) {
      try {
        detector = new BarcodeDetectorClass({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'itf'],
        });
      } catch {
        detector = null;
      }
    }

    const checkFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(checkFrame);
        return;
      }

      if (detector) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            handleSuccessfulRead(rawValue);
            return;
          }
        } catch {
          // ignore detection frames
        }
      }

      animationFrameRef.current = requestAnimationFrame(checkFrame);
    };

    animationFrameRef.current = requestAnimationFrame(checkFrame);
  };

  const handleSuccessfulRead = (rawText: string) => {
    stopCamera();
    playDepartureChime('gentle');
    triggerHapticFeedback('double');

    const digitsOnly = rawText.replace(/\D/g, '');
    let finalSerial = digitsOnly;

    if (digitsOnly.length >= 16) {
      finalSerial = digitsOnly.slice(0, 16);
    } else if (digitsOnly.length >= 10) {
      finalSerial = digitsOnly.padStart(16, '1010');
    } else {
      finalSerial = (digitsOnly + '1010000000000000').slice(0, 16);
    }

    setScannedResult(finalSerial);
    setIsScanning(false);

    setTimeout(() => {
      onScanComplete(finalSerial, 'personalizada');
      onClose();
    }, 1200);
  };

  const handleSimulateScan = () => {
    const sampleSerials = [
      '1010000084920145',
      '1010000073819203',
      '1010000059281039',
      '1010000091823746',
    ];
    const picked = sampleSerials[Math.floor(Math.random() * sampleSerials.length)];
    handleSuccessfulRead(picked);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
        if ((capabilities as any).torch) {
          const nextState = !torchEnabled;
          await (track as any).applyConstraints({
            advanced: [{ torch: nextState }],
          });
          setTorchEnabled(nextState);
        }
      } catch {
        // Torch not supported on this track
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setScannedResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-5 sm:p-6 shadow-2xl text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1C2A3E]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] text-[#0070F3] border border-[#BFDBFE] dark:border-[#0080FF]/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Escanear Tarjeta ({systemName})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apunta al código de barras o QR de tu tarjeta
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#070D18] transition cursor-pointer"
            aria-label="Cerrar escáner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative my-4 aspect-[4/3] rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-200 dark:border-[#1C2A3E]">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Scanner Overlay Guide Frame */}
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <div className="relative w-full aspect-[1.586/1] border-2 border-[#0070F3]/80 rounded-xl bg-[#0070F3]/10 shadow-[0_0_20px_rgba(0,112,243,0.3)]">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-[#0070F3]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-[#0070F3]" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-[#0070F3]" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-[#0070F3]" />

              {/* Scanning Laser Line */}
              {isScanning && (
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#38BDF8] to-transparent shadow-[0_0_8px_#38bdf8] animate-pulse" />
              )}
            </div>
          </div>

          {/* Scanned Success Badge */}
          {scannedResult && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-2 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-[#0070F3] animate-bounce" />
              <div className="text-white font-bold text-sm">¡Tarjeta Detectada!</div>
              <div className="text-[#38BDF8] font-mono text-base tracking-widest bg-[#0E1B2E] px-3 py-1 rounded-xl border border-[#0070F3]/40">
                {scannedResult}
              </div>
            </div>
          )}

          {/* Camera Permission / Error Fallback */}
          {hasPermission === false && (
            <div className="absolute inset-0 bg-slate-900/90 p-4 flex flex-col items-center justify-center text-center space-y-2.5">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reintentar acceso</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>¿Sin cámara o tarjeta física?</span>
            <span className="text-[#0060EA] dark:text-[#38BDF8] font-medium">Reconocimiento automático</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSimulateScan}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-500/25 active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Escanear Muestra</span>
            </button>

            <button
              type="button"
              onClick={toggleTorch}
              className="w-full py-2.5 px-3 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-[#DBEAFE] dark:hover:bg-[#15233a] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{torchEnabled ? 'Apagar Flash' : 'Linterna / Flash'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
