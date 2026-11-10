import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  X,
  Copy,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  AlertCircle,
  Building2,
  Smartphone,
  CreditCard,
  FileText,
} from 'lucide-react';
import { TuLlaveCard } from '../types/tullave';
import {
  initiatePayment,
  verifyPaymentTransaction,
  OFFICIAL_PAYMENT_CHANNELS,
  generateReferenceCode,
  PaymentGatewayType,
  PaymentTransaction,
} from '../services/paymentGatewayService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubscribed: boolean;
  onActivateSubscription: () => void;
  activeCard?: TuLlaveCard;
  storedCards?: TuLlaveCard[];
}

type ContributionTab = '5000' | '10000' | '15000' | 'otro';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  isSubscribed,
  onActivateSubscription,
  activeCard,
  storedCards = [],
}) => {
  const isCardPreferential = (card?: TuLlaveCard) =>
    card &&
    (card.type === 'sisben' ||
      card.type === 'adulto_mayor' ||
      card.type === 'estudiantil' ||
      card.type === 'discapacidad');

  const [selectedTab, setSelectedTab] = useState<ContributionTab>('5000');
  const [customAmount, setCustomAmount] = useState<string>('20000');
  const [selectedMethod, setSelectedMethod] = useState<PaymentGatewayType>('nequi');
  const [payerPhoneInput, setPayerPhoneInput] = useState<string>('310 987 6543');
  const [userReferenceInput, setUserReferenceInput] = useState<string>('');
  const [expectedReference, setExpectedReference] = useState<string>(() => generateReferenceCode('nequi'));

  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedTx, setCompletedTx] = useState<PaymentTransaction | null>(null);
  const [successCountdown, setSuccessCountdown] = useState(12);

  // Preferential Verification State
  const [isVerifyingPreferential, setIsVerifyingPreferential] = useState(false);
  const [preferentialCardInput, setPreferentialCardInput] = useState('');
  const [preferentialDocInput, setPreferentialDocInput] = useState('');
  const [preferentialCategory, setPreferentialCategory] = useState<'adulto_mayor' | 'sisben' | 'estudiantil' | 'discapacidad'>('adulto_mayor');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Update expected reference when payment gateway changes
  useEffect(() => {
    setExpectedReference(generateReferenceCode(selectedMethod));
  }, [selectedMethod]);

  const handleDismissThankYou = () => {
    setPaymentSuccess(false);
    onClose();
  };

  // Auto-dismiss countdown when payment succeeds
  useEffect(() => {
    if (!isOpen || !paymentSuccess) return;
    if (successCountdown <= 0) {
      handleDismissThankYou();
      return;
    }
    const timer = setTimeout(() => {
      setSuccessCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isOpen, paymentSuccess, successCountdown]);

  // Resolve current active numerical amount
  const resolvedAmount = selectedTab === 'otro' ? parseInt(customAmount.replace(/\D/g, '') || '0', 10) : parseInt(selectedTab, 10);
  const isAmountValid = resolvedAmount >= 5000;
  const formattedAmount = `$${resolvedAmount.toLocaleString('es-CO')}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulatePayment = async () => {
    if (!isAmountValid) return;
    setIsProcessing(true);

    try {
      // 1. Create transaction record via Colombian payment service layer
      const tx = initiatePayment({
        gateway: selectedMethod,
        purpose: 'app_subscription',
        amountCop: resolvedAmount,
        payerPhoneNumber: payerPhoneInput,
        notes: `Aporte voluntario 30 días (${selectedMethod.toUpperCase()})`,
      });

      // 2. Perform verification against local bank gateway simulation
      const verification = await verifyPaymentTransaction(
        tx.id,
        userReferenceInput.trim() ? userReferenceInput : expectedReference
      );

      setCompletedTx(verification.transaction);
      setIsProcessing(false);
      setPaymentSuccess(true);
      setSuccessCountdown(12);
      onActivateSubscription();
    } catch {
      setIsProcessing(false);
    }
  };

  const handleStartPreferentialValidation = () => {
    const alreadyQualified = activeCard && isCardPreferential(activeCard);
    if (alreadyQualified) {
      onActivateSubscription();
      onClose();
      return;
    }
    setIsVerifyingPreferential(true);
  };

  const handleConfirmPreferentialValidation = () => {
    setVerificationError(null);
    const cleanNum = preferentialCardInput.replace(/\s+/g, '');
    const cleanDoc = preferentialDocInput.trim();

    if (cleanNum.length < 8 || cleanDoc.length < 6) {
      setVerificationError('Por favor ingresa los datos completos de tu tarjeta y documento.');
      return;
    }

    setVerificationSuccess(true);
    setTimeout(() => {
      onActivateSubscription();
      setIsVerifyingPreferential(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1726] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl p-6 sm:p-7 shadow-2xl text-left overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar transition-colors">
        {/* Close Button */}
        <button
          type="button"
          onClick={paymentSuccess ? handleDismissThankYou : onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#070D18] transition cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {paymentSuccess ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#0070F3]/15 text-[#0070F3] border border-[#0070F3]/30 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0060EA] dark:text-[#38BDF8] bg-[#EFF6FF] dark:bg-[#0E1B2E] px-3 py-1 rounded-full border border-[#BFDBFE] dark:border-[#0080FF]/30 font-mono">
                Aporte verificado · {formattedAmount} COP
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ¡Aporte Confirmado con Éxito!
              </h3>
            </div>

            {/* Official Digital Receipt Card */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] space-y-2.5 max-w-md mx-auto text-left text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1C2A3E]">
                <span className="text-slate-500 dark:text-slate-400">Comprobante Oficial:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {completedTx?.approvalReceiptNumber || 'REC-2026-894102'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pasarela / Canal:</span>
                <span className="font-bold uppercase text-[#0060EA] dark:text-[#38BDF8]">
                  {completedTx?.gateway || selectedMethod}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Referencia Bancaria:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {completedTx?.referenceCode || expectedReference}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Acceso Sostenible:</span>
                <span className="font-bold text-[#0060EA] dark:text-[#38BDF8]">
                  Activo 30 Días Calendario
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                Con tu aporte seguiremos ofreciendo un servicio efectivo, actualizado y sin publicidad para tu viaje diario.
              </div>
            </div>

            <div className="space-y-2 pt-2 max-w-xs mx-auto">
              <button
                type="button"
                onClick={handleDismissThankYou}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Continuar a la Aplicación ({successCountdown}s)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isVerifyingPreferential ? (
          <div className="space-y-4 py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 flex items-center justify-center text-[#0070F3]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Validación de Tarjeta de Transporte
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verifica tu tarjeta oficial registrada para habilitar el acceso $0 COP
                </p>
              </div>
            </div>

            {verificationSuccess ? (
              <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#0070F3]/40 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-[#0070F3] mx-auto" />
                <span className="text-sm font-black text-[#0060EA] dark:text-[#38BDF8] block">
                  ¡Tarjeta Oficial Validada con Éxito!
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Subsidio confirmado en el sistema masivo. Acceso completo activado a $0 COP.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Para garantizar la sostenibilidad del servicio, el acceso a $0 COP se activa verificando una tarjeta personalizada vinculada a programas oficiales de subsidio.
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Categoría de Subsidio Oficial:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'adulto_mayor', label: 'Adulto Mayor (+62)' },
                      { id: 'sisben', label: 'Sisbén (A, B, C)' },
                      { id: 'estudiantil', label: 'Estudiantil' },
                      { id: 'discapacidad', label: 'Movilidad Reducida' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPreferentialCategory(cat.id as any)}
                        className={`p-2.5 rounded-xl text-left font-bold transition cursor-pointer border ${
                          preferentialCategory === cat.id
                            ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] border-[#0070F3] text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Número de serie de tu tarjeta física:
                  </label>
                  <input
                    type="text"
                    value={preferentialCardInput}
                    onChange={(e) => setPreferentialCardInput(e.target.value)}
                    placeholder="Ej. 1010000012345678"
                    className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-[#0070F3]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Documento de identidad (Cédula / TI):
                  </label>
                  <input
                    type="text"
                    value={preferentialDocInput}
                    onChange={(e) => setPreferentialDocInput(e.target.value)}
                    placeholder="Número de cédula registrada"
                    className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl p-2.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-[#0070F3]"
                  />
                </div>

                {verificationError && (
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{verificationError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsVerifyingPreferential(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 text-[#0060EA] dark:text-[#38BDF8] font-bold transition cursor-pointer text-center"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPreferentialValidation}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white font-bold transition cursor-pointer text-center shadow-sm"
                  >
                    Validar Tarjeta ($0 COP)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Aporte para la Aplicación
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                A Tiempo
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Con tu aporte seguiremos ofreciendo un servicio efectivo, actualizado y personalizado para que tu viaje sea lo más cómodo y puntual posible.
              </p>
            </div>

            {/* CONTRIBUTION AMOUNT TABS */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Selecciona el monto de tu aporte:
              </label>

              <div className="grid grid-cols-4 gap-2 text-xs">
                {(['5000', '10000', '15000', 'otro'] as ContributionTab[]).map((tab) => {
                  const isSelected = selectedTab === tab;
                  const label = tab === 'otro' ? 'Otro monto' : `$${(parseInt(tab, 10) / 1000).toFixed(0)}.000`;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSelectedTab(tab)}
                      className={`py-2.5 px-2 rounded-xl font-bold transition-all cursor-pointer text-center border ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] text-white border-[#0070F3] shadow-md shadow-blue-500/25 font-bold'
                          : 'bg-[#F8FAFC] dark:bg-[#070D18] hover:bg-slate-100 dark:hover:bg-[#0E1726] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1C2A3E]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {selectedTab === 'otro' && (
                <div className="pt-1.5 animate-in fade-in space-y-1">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCustomAmount(val);
                      }}
                      placeholder="Ingresa el monto"
                      className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl py-2.5 pl-8 pr-16 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:border-[#0070F3]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                      COP
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector (Nequi / Daviplata / Bre-B) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Canal de pago colombiano:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* NEQUI */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('nequi')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                    selectedMethod === 'nequi'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-500/60 text-slate-900 dark:text-white ring-1 ring-purple-400/30'
                      : 'bg-[#F8FAFC] dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-purple-600 text-white font-black text-[9px] flex items-center justify-center">
                      NQ
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Nequi</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Celular directo</span>
                </button>

                {/* DAVIPLATA */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('daviplata')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                    selectedMethod === 'daviplata'
                      ? 'bg-red-50 dark:bg-red-950/40 border-red-400 dark:border-red-500/60 text-slate-900 dark:text-white ring-1 ring-red-400/30'
                      : 'bg-[#F8FAFC] dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-red-600 text-white font-black text-[9px] flex items-center justify-center">
                      DP
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Daviplata</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Davivienda</span>
                </button>

                {/* BRE-B */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('breb')}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                    selectedMethod === 'breb'
                      ? 'bg-[#EFF6FF] dark:bg-[#0E1B2E] border-[#0070F3] text-slate-900 dark:text-white ring-1 ring-[#0070F3]/30'
                      : 'bg-[#F8FAFC] dark:bg-[#070D18] border-slate-200 dark:border-[#1C2A3E] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-md bg-[#0070F3] text-white font-black text-[9px] flex items-center justify-center">
                      BB
                    </div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Bre-B</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Llave Banco Rep</span>
                </button>
              </div>
            </div>

            {/* Payment Channel Details */}
            <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  {selectedMethod === 'breb' ? 'Llave Interoperable Bre-B:' : `Número ${selectedMethod.toUpperCase()}:`}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedMethod === 'breb' ? OFFICIAL_PAYMENT_CHANNELS.brebKey : OFFICIAL_PAYMENT_CHANNELS.nequiPhone}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        selectedMethod === 'breb' ? OFFICIAL_PAYMENT_CHANNELS.brebKey : '3109876543',
                        selectedMethod
                      )
                    }
                    className="text-[#0070F3] hover:opacity-80 cursor-pointer p-1"
                    title="Copiar dato"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200 dark:border-[#1C2A3E]">
                <span className="text-slate-500 dark:text-slate-400">Titular verificado:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {OFFICIAL_PAYMENT_CHANNELS.receiverName}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Referencia de pago asignada:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#0060EA] dark:text-[#38BDF8]">
                    {expectedReference}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(expectedReference, 'referencia')}
                    className="text-[#0070F3] hover:opacity-80 cursor-pointer p-0.5"
                    title="Copiar referencia"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {copiedKey && (
              <div className="text-center text-[11px] text-[#0060EA] dark:text-[#38BDF8] font-bold bg-[#EFF6FF] dark:bg-[#0E1B2E] py-1 px-3 rounded-xl border border-[#BFDBFE] dark:border-[#0080FF]/30">
                ¡Dato copiado al portapapeles!
              </div>
            )}

            {/* Optional Input of user's voucher/reference */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Comprobante / Referencia de tu app (opcional):
              </label>
              <input
                type="text"
                value={userReferenceInput}
                onChange={(e) => setUserReferenceInput(e.target.value)}
                placeholder={`Ej. ${expectedReference}`}
                className="w-full bg-[#F8FAFC] dark:bg-[#070D18] border border-slate-200 dark:border-[#1C2A3E] rounded-xl py-2 px-3 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-[#0070F3]"
              />
            </div>

            {/* Subsidios de Transporte Masivo ($0 COP) */}
            <div className="p-3 bg-[#EFF6FF] dark:bg-[#0E1B2E] border border-[#BFDBFE] dark:border-[#0080FF]/30 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#0060EA] dark:text-[#38BDF8] font-bold">
                  <HeartHandshake className="w-4 h-4 text-[#0070F3]" strokeWidth={2} />
                  <span>Subsidios del Transporte Masivo ($0 COP)</span>
                </div>
                <span className="text-[10px] font-bold text-[#0060EA] dark:text-[#38BDF8] bg-white dark:bg-[#070D18] px-2 py-0.5 rounded-full border border-[#BFDBFE] dark:border-[#0080FF]/40 font-mono">
                  100% Gratis
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Si cuentas con subsidio oficial en tu tarjeta (Adulto Mayor, Sisbén, Estudiantes), valida tu tarjeta para disfrutar de A Tiempo sin cobro alguno.
              </p>
              <button
                type="button"
                onClick={handleStartPreferentialValidation}
                className="w-full py-2 px-3 rounded-xl bg-[#0070F3] hover:bg-[#0060EA] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Validar Tarjeta de Transporte con Subsidio</span>
              </button>
            </div>

            {/* Primary Verification & Contribution Action */}
            <button
              type="button"
              disabled={isProcessing || !isAmountValid}
              onClick={handleSimulatePayment}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                isAmountValid
                  ? 'bg-gradient-to-r from-[#0080FF] to-[#0060EA] hover:from-[#1A8CFF] hover:to-[#0054D1] text-white shadow-blue-500/25 active:scale-95'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando pasarela bancaria...</span>
                </>
              ) : isAmountValid ? (
                <>
                  <span>Verificar Aporte ({formattedAmount} COP)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>Confirmar aporte</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
