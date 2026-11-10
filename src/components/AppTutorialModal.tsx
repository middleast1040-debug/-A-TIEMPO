import React, { useState } from 'react';
import {
  X,
  Footprints,
  Calendar,
  BellRing,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Smartphone,
  HeartHandshake,
  Search,
  Bike,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityName?: string;
}

interface TutorialStep {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  stepNumber: number;
  badge: string;
  description: string;
  points: string[];
  tip?: string;
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleFinish = () => {
    try {
      localStorage.setItem('atiempo_tutorial_seen_v1', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const steps: TutorialStep[] = [
    {
      title: 'Ubicador de Buses & Vagón Asignado',
      subtitle: 'Encuentra tu ruta y parada exacta sin correr',
      stepNumber: 1,
      badge: 'Paso 1 · Ubicador',
      icon: <Search className="w-6 h-6 text-[#0070F3]" />,
      description:
        'Escribe el código o nombre de tu bus (ej. H27, C15, 330, Z8) para conocer de inmediato el vagón oficial donde para y el tiempo de espera estimado.',
      points: [
        'Búsqueda rápida: Encuentra troncales expresos, alimentadores o buses zonales de tu ciudad en segundos.',
        'Vagón y puerta designada: Sabrás exactamente en qué punto de la estación esperar para abordar sin congestiones.',
        'Cálculo de salida en 1 toque: Toca "Calcular Salida" para sincronizar la hora exacta en que debes salir de casa.',
      ],
      tip: 'Puedes buscar solo con el número de ruta (ej. 27, 330) o el nombre de tu estación habitual.',
    },
    {
      title: 'Cálculo de Salida & Minutos a Pie',
      subtitle: 'Llega justo cuando el bus abre sus puertas',
      stepNumber: 2,
      badge: 'Paso 2 · Salida Exacta',
      icon: <Footprints className="w-6 h-6 text-[#0070F3]" />,
      description:
        'A Tiempo sincroniza tu caminata con el paso de los buses para que no pierdas tiempo en el frío o la lluvia esperando en la estación.',
      points: [
        'Elige origen y destino: Selecciona tus estaciones e invierte el sentido con el botón (⇄) para tu regreso a casa.',
        'Ajusta tus minutos de caminata: Elige si tardas 3, 5, 8 o 12 minutos a pie para que la app descuente tu trayecto.',
        'Cuenta regresiva en vivo: Mira exactamente cuántos minutos y segundos te quedan antes de cruzar la puerta.',
      ],
      tip: 'Guarda tus trayectos habituales tocando el corazón para consultarlos todos los días en un solo toque.',
    },
    {
      title: 'Modo Salida & «Avísame al llegar»',
      subtitle: 'Viaja seguro y con tono suave a bordo del bus',
      stepNumber: 3,
      badge: 'Paso 3 · En Camino',
      icon: <BellRing className="w-6 h-6 text-[#0070F3]" />,
      description:
        'Activa la salida para tener un cronómetro claro en pantalla y un tono suave que te avisa antes de llegar a tu destino.',
      points: [
        'Alarma de proximidad: Te avisa con un tono suave 2 estaciones antes de tu parada final para que viajes con total tranquilidad.',
        'Aviso por WhatsApp a tu familia: Envía tu hora estimada de llegada a tus seres queridos con un solo toque.',
        'Calendario semanal de rutas: Asigna rutas diferentes para tus días de trabajo o estudio y fines de semana.',
      ],
      tip: 'Los tonos de aviso suenan directamente en tu teléfono sin gastar megas ni saldo de tu plan de datos.',
    },
    {
      title: 'Subsidios, Apoyos Sociales & Auxilio a Crédito',
      subtitle: 'Tarifas preferenciales y viajes de emergencia',
      stepNumber: 4,
      badge: 'Paso 4 · Apoyos & Subsidios',
      icon: <HeartHandshake className="w-6 h-6 text-[#0070F3]" />,
      description:
        'A Tiempo te orienta para que aproveches todos los descuentos sociales y auxilios económicos aprobados en tu ciudad.',
      points: [
        'Subsidio Sisbén (Grupos A y B): Acceso a tarifas reducidas y descuentos oficiales en viajes troncales y zonales.',
        'Adulto Mayor & Movilidad Reducida: Tarifas preferenciales especiales y herramientas de lectura asistida por voz.',
        '2 Viajes a Crédito (Auxilio de Emergencia): Si tu tarjeta personalizada se queda sin saldo en la calle, el sistema te presta hasta 2 pasajes para no quedarte varado.',
      ],
      tip: 'Para acceder a los subsidios distritales y al auxilio a crédito, personaliza tu tarjeta física con tu cédula en taquilla.',
    },
    {
      title: 'Tarjetas Físicas & Ventana de Trasbordo ($0)',
      subtitle: 'Tus plásticos reales y control de pasajes',
      stepNumber: 5,
      badge: 'Paso 5 · Mi Tarjeta',
      icon: <CreditCard className="w-6 h-6 text-[#0070F3]" />,
      description:
        'Gestiona tus tarjetas inteligentes con los colores reales de sus plásticos físicos (Roja personalizada, Verde básica, Cívica, MÍO o Metrolínea).',
      points: [
        'Colores idénticos a tu tarjeta: Identifica fácilmente tus plásticos y los de tus familiares con saldo y categoría.',
        'Ventana de Trasbordo ($0 COP): Cuentas con 125 minutos para hacer hasta 2 trasbordos sin pagar un solo peso extra.',
        'Aviso de vencimiento: La aplicación te advierte con sonido antes de que termine tu tiempo de trasbordo gratuito.',
        'Abono Mensual TransMiPass: Información del abono de 65 viajes con ahorro de más de $70.000 COP al mes.',
      ],
      tip: 'Revisa la sección de Tarjetas para escanear el código de barras o ingresar el número de serial en segundos.',
    },
    {
      title: 'TransMiBici & Multimodalidad Gratuita',
      subtitle: 'Cicloparqueaderos vigilados y pasajes de regalo',
      stepNumber: 6,
      badge: 'Paso 6 · TransMiBici',
      icon: <Bike className="w-6 h-6 text-[#0070F3]" />,
      description:
        'Combina tu bicicleta con el transporte masivo de forma segura y cómoda en los portales y estaciones clave.',
      points: [
        'Cicloparqueaderos cubiertos a $0 COP: Más de 26 estaciones con vigilancia permanente y cupos cerrados sin costo.',
        'Recompensa de pasajes gratis: Por cada 30 viajes combinados en que valides tu entrada en bici y bus, ganas 1 pasaje gratis.',
        'Requisitos fáciles: Solo necesitas tu tarjeta personalizada, cédula original y candado para registrar tu bicicleta.',
      ],
      tip: 'Puedes consultar los cicloparqueaderos disponibles y su ubicación directa en la pestaña de Tarjetas.',
    },
    {
      title: 'Recargas Digitales & Activación en Tótem',
      subtitle: 'Paga con Nequi, Daviplata o Bre-B y valida en segundos',
      stepNumber: 7,
      badge: 'Paso 7 · Recargas & Tótem',
      icon: <Smartphone className="w-6 h-6 text-[#0070F3]" />,
      description:
        'Evita filas en taquillas recargando tu saldo desde el celular y activándolo al instante en la estación.',
      points: [
        'Recargas locales seguras: Realiza tu aporte o recarga usando Nequi, Daviplata o llave Bre-B y confirma tu comprobante.',
        'Activación en tótem o validador: Pasa tu tarjeta física por el tótem rojo de la estación para que el saldo suba al chip.',
        'Simulador de tótem interactivo: Consulta la pestaña dedicada que te guía paso a paso para apoyar tu tarjeta en el lector.',
      ],
      tip: 'Recarga antes de salir de tu casa para que tu saldo esté listo apenas toques el validador de la estación.',
    },
    {
      title: 'Asesoría Integral & Soporte Comunitario',
      subtitle: 'Acompañamiento directo en WhatsApp, Telegram y Facebook',
      stepNumber: 8,
      badge: 'Paso 8 · Asesoría & Ayuda',
      icon: <MessageCircle className="w-6 h-6 text-[#0070F3]" />,
      description:
        'A Tiempo te acompaña en cada viaje con canales directos para resolver cualquier consulta o trámite con el sistema de transporte.',
      points: [
        'Atención en WhatsApp: Contacto directo para resolver dudas de rutas, desvíos temporales y horarios especiales.',
        'Comunidad en Telegram: Reportes de tráfico, marchas y estado de vías compartidos en tiempo real por otros usuarios.',
        'Página de Facebook: Información sobre puntos móviles de personalización de tarjetas y nuevos beneficios para usuarios.',
        'Líneas de emergencia (123): Acceso rápido ante cualquier eventualidad de seguridad o salud.',
      ],
      tip: 'Encontrarás los botones de acceso directo a WhatsApp, Telegram y Facebook al final de la pantalla principal.',
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl shadow-2xl text-left overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-[#1C2A3E] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#0070F3] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {current.stepNumber}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#0080FF] to-[#0060EA] px-2.5 py-0.5 rounded-full inline-block shadow-xs mb-0.5">
                {current.badge}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono block">
                Paso {currentStep + 1} de {steps.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#070D18] transition cursor-pointer"
            aria-label="Cerrar tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar with Blue indicators */}
        <div
          className="grid gap-1 px-5 pt-2 shrink-0"
          style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        >
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-[#0070F3]'
                  : idx < currentStep
                  ? 'bg-[#0070F3]/40'
                  : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Scrollable Step Content Body */}
        <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto no-scrollbar flex-1">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {current.title}
              </h3>
              <span className="text-xs text-white font-bold bg-[#0070F3] px-2.5 py-0.5 rounded-lg inline-block shadow-xs mt-1">
                {current.subtitle}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.description}
          </p>

          {/* Bullet Points with Checkmark Badges */}
          <div className="space-y-2 bg-[#F8FAFC] dark:bg-[#070D18] p-3.5 rounded-xl border border-slate-200 dark:border-[#1C2A3E]">
            {current.points.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-4 h-4 rounded-full bg-[#0070F3] text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="leading-snug">{pt}</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          {current.tip && (
            <div className="p-3 bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 rounded-xl text-[11px] text-[#0060EA] dark:text-[#38BDF8] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0070F3] shrink-0" />
              <span>
                <strong>Consejo útil:</strong> {current.tip}
              </span>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-[#1C2A3E] bg-white dark:bg-[#0E1726] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              currentStep === 0
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] hover:bg-[#DBEAFE] dark:hover:bg-[#15233a] cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFinish}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              Cerrar
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-2 transition active:scale-95"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white shadow-md shadow-blue-500/25 cursor-pointer flex items-center gap-2 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>¡Comenzar a Usar!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
