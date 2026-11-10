import React, { useState } from 'react';
import {
  X,
  Volume2,
  Eye,
  HeartHandshake,
  CheckCircle2,
  Sun,
  Moon,
  Vibrate,
  GraduationCap,
  Users,
  Heart,
  Accessibility,
} from 'lucide-react';
import { speakDepartureAnnouncement } from '../utils/textToSpeech';
import { triggerHapticFeedback } from '../utils/haptics';

export interface AccessibilitySettings {
  speechAssistance: boolean;
  largeText: boolean;
  highContrast: boolean;
  visualFlashing: boolean;
  hapticFeedback: boolean;
  subsidizedProfile?: 'estudiante' | 'adulto_mayor' | 'sisben' | 'discapacidad' | null;
}

interface AccessibilitySupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: AccessibilitySettings) => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
  onActivateFreeAccess: () => void;
  isSubscribed: boolean;
}

export const AccessibilitySupportModal: React.FC<AccessibilitySupportModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  themeMode,
  onToggleTheme,
  onActivateFreeAccess,
  isSubscribed,
}) => {
  const [testVoiceSpeaking, setTestVoiceSpeaking] = useState(false);
  const [subsidioFeedback, setSubsidioFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = (key: keyof AccessibilitySettings) => {
    const updated = {
      ...settings,
      [key]: !settings[key],
    };
    onUpdateSettings(updated);
    try {
      localStorage.setItem('atiempo_accessibility_support_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleTestVoice = async () => {
    setTestVoiceSpeaking(true);
    await speakDepartureAnnouncement(
      'Atención. Modo Apoyo activado. Tu bus hacia Portal Usme sale en 4 minutos. Camina con calma hacia la estación.'
    );
    setTestVoiceSpeaking(false);
  };

  const handleClaimSubsidy = (profileType: 'estudiante' | 'adulto_mayor' | 'sisben' | 'discapacidad') => {
    const profileNames = {
      estudiante: 'Estudiante',
      adulto_mayor: 'Adulto Mayor (+62)',
      sisben: 'Sisbén (Población Prioritaria)',
      discapacidad: 'Discapacidad / Movilidad',
    };

    const updated: AccessibilitySettings = {
      ...settings,
      subsidizedProfile: profileType,
    };
    onUpdateSettings(updated);
    try {
      localStorage.setItem('atiempo_accessibility_support_v1', JSON.stringify(updated));
    } catch {
      // ignore
    }

    onActivateFreeAccess();
    triggerHapticFeedback('success');
    speakDepartureAnnouncement(`Acceso gratuito confirmado para perfil ${profileNames[profileType]}. Sin costo mensual.`);
    setSubsidioFeedback(`Acceso 100% Gratuito Activado (${profileNames[profileType]})`);
    setTimeout(() => setSubsidioFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-5 sm:p-7 shadow-2xl text-left overflow-y-auto max-h-[90vh] no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-[#1C2A3E]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] text-[#0070F3] border border-[#BFDBFE] dark:border-[#0080FF]/30 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Modo Apoyo & Accesibilidad
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajustes visuales, auditivos y subsidios de transporte masivo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#070D18] transition cursor-pointer"
            aria-label="Cerrar Modo Apoyo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Tema (Modo Noche / Modo Día) */}
        <div className="py-4 border-b border-slate-100 dark:border-[#1C2A3E] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Contraste de Iluminación
            </span>
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] hover:bg-[#DBEAFE] dark:hover:bg-[#15233a] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-xs font-semibold text-[#0060EA] dark:text-[#38BDF8] transition cursor-pointer"
            >
              {themeMode === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Modo Nocturno</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Modo Diurno</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Asistencia Sensorial (Voz, Texto Grande, Vibración) */}
        <div className="py-4 border-b border-slate-100 dark:border-[#1C2A3E] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
            Asistencia Sensorial
          </span>

          {/* Voice Assistance */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-200">
                <Volume2 className="w-4 h-4 text-[#0070F3]" />
                <span>Lectura Asistida en Voz Alta</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Anuncia cuándo debes salir y cuántas paradas restan hacia tu destino.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={testVoiceSpeaking}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                {testVoiceSpeaking ? 'Hablando...' : 'Probar'}
              </button>
              <button
                type="button"
                onClick={() => handleToggle('speechAssistance')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.speechAssistance ? 'bg-[#0070F3]' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.speechAssistance ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Large Text */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-200">
                <Eye className="w-4 h-4 text-[#0070F3]" />
                <span>Texto Aumentado (Baja Visión)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escala los textos clave y números de ruta a tamaño extragrande.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('largeText')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                settings.largeText ? 'bg-[#0070F3]' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.largeText ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Visual Flashing and Haptics */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-200">
                <Vibrate className="w-4 h-4 text-[#0070F3]" />
                <span>Alerta Háptica y Visual</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vibración en el teléfono y destello en pantalla para no depender de sonido.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('hapticFeedback')}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                settings.hapticFeedback ? 'bg-[#0070F3]' : 'bg-slate-300 dark:bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.hapticFeedback ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 3: Subsidios de Transporte Masivo ($0 COP) */}
        <div className="pt-4 space-y-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#0080FF] to-[#0060EA] px-2.5 py-1 rounded-lg inline-block shadow-xs mb-1">
              Subsidios del Transporte Masivo
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Acceso <strong>100% Gratuito ($0 COP)</strong> para usuarios con subsidio activo en TransMilenio o Metro:
            </p>
          </div>

          {subsidioFeedback && (
            <div className="p-3 bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#0070F3]/40 rounded-xl text-xs text-[#0060EA] dark:text-[#38BDF8] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#0070F3] shrink-0" />
              <span>{subsidioFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'adulto_mayor', label: 'Adulto Mayor (+62)', sub: 'Subsidio distrital oficial', icon: Heart },
              { id: 'sisben', label: 'Sisbén A / B / C', sub: 'Población prioritaria', icon: Users },
              { id: 'estudiante', label: 'Convenio Estudiantil', sub: 'Colegios / Estudio', icon: GraduationCap },
              { id: 'discapacidad', label: 'Movilidad Reducida', sub: 'Acompañamiento prioritario', icon: Accessibility },
            ].map((subItem) => {
              const IconComp = subItem.icon;
              return (
                <button
                  key={subItem.id}
                  type="button"
                  onClick={() => handleClaimSubsidy(subItem.id as any)}
                  className="p-3 rounded-2xl bg-[#F8FAFC] dark:bg-[#070D18] hover:bg-slate-100 dark:hover:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] hover:border-[#0070F3]/50 text-left transition cursor-pointer flex items-center justify-between gap-3 group shadow-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0070F3] flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {subItem.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{subItem.sub}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-white font-mono bg-gradient-to-r from-[#0080FF] to-[#0060EA] px-2.5 py-0.5 rounded-md shrink-0 shadow-xs">
                    $0 COP
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#1C2A3E] text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold text-xs transition cursor-pointer shadow-md shadow-blue-500/25 active:scale-95"
          >
            Guardar preferencias
          </button>
        </div>
      </div>
    </div>
  );
};
