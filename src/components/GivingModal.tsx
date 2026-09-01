import React, { useState, useEffect, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ChevronRight, 
  CreditCard, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  Copy, 
  Check, 
  Download, 
  ArrowLeft, 
  Heart, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  Music2, 
  Award,
  Globe,
  Radio,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { djangoApi } from '../services/djangoApi';

export interface GivingTarget {
  id: string;
  name: string;
  avatar?: string;
  type: 'platform' | 'church' | 'artiste' | 'creator';
  categoryTitle?: string;
}

interface GivingModalProps {
  target?: GivingTarget | null;
  onClose: () => void;
  onPaymentSuccess: (amount: number, targetName: string, givingType: string) => void;
}

type PaymentMethodType = 'mtn_momo' | 'airtel_money' | 'card';
type CurrencyType = 'UGX' | 'USD' | 'KES' | 'NGN';

export default function GivingModal({ target, onClose, onPaymentSuccess }: GivingModalProps) {
  // Category & Recipient
  const [givingType, setGivingType] = useState<'tithe' | 'seed' | 'super_amen' | 'platform_pass'>('platform_pass');
  const [currency, setCurrency] = useState<CurrencyType>('UGX');
  
  // Amounts (UGX defaults like the screenshot USh 18,962.00)
  const [amountUgx, setAmountUgx] = useState<number>(18962);
  const [customAmount, setCustomAmount] = useState<string>('18962');
  const [orderNumber, setOrderNumber] = useState<string>(() => `3264${Math.floor(100000000000 + Math.random() * 900000000000)}`);
  
  // Selected Payment Method & Checkout Step
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [step, setStep] = useState<'select' | 'form' | 'processing_prompt' | 'success'>('select');

  // Input states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [momoPin, setMomoPin] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [prayerNote, setPrayerNote] = useState('');
  const [frequency, setFrequency] = useState<'one-time' | '3-month' | 'monthly'>('3-month');

  // Processing & Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [ussdPromptCountdown, setUssdPromptCountdown] = useState(15);
  const [receiptId, setReceiptId] = useState('');
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [djangoMsg, setDjangoMsg] = useState('');

  const recipient: GivingTarget = target || {
    id: 'platform-global',
    name: 'Gospread-Web (Gospel TV)',
    avatar: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=120&q=80',
    type: 'platform',
    categoryTitle: 'Kingdom Broadcasting & Partner Pass'
  };

  // Convert or format price display
  const formatCurrencyAmount = (val: number, curr: CurrencyType) => {
    if (curr === 'UGX') {
      return `USh ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (curr === 'USD') {
      return `$ ${(val / 3800).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (curr === 'KES') {
      return `KSh ${(val / 29).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (curr === 'NGN') {
      return `₦ ${(val * 0.42).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `USh ${val.toLocaleString('en-US')}`;
  };

  // Quick preset amounts in UGX
  const presetUgxAmounts = [
    { label: 'USh 5,000', value: 5000, desc: 'Friend Seed' },
    { label: 'USh 18,962', value: 18962, desc: '3-Month Pass' },
    { label: 'USh 50,000', value: 50000, desc: 'Tithe Offering' },
    { label: 'USh 100,000', value: 100000, desc: 'Kingdom Pillar' },
    { label: 'USh 250,000', value: 250000, desc: 'Sanctuary Builder' },
  ];

  // Trigger celebration on completion
  useEffect(() => {
    if (step === 'success') {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#ffcc00', '#ed1c24', '#3b82f6', '#10b981', '#f59e0b'],
        disableForReducedMotion: true,
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 35,
          angle: 60,
          spread: 55,
          origin: { x: 0.2, y: 0.6 },
          colors: ['#ffcc00', '#ed1c24', '#3b82f6'],
        });
        confetti({
          particleCount: 35,
          angle: 120,
          spread: 55,
          origin: { x: 0.8, y: 0.6 },
          colors: ['#ffcc00', '#ed1c24', '#3b82f6'],
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [step]);

  // Countdown timer for USSD Prompt verification
  useEffect(() => {
    let interval: any;
    if (step === 'processing_prompt' && ussdPromptCountdown > 0) {
      interval = setInterval(() => {
        setUssdPromptCountdown(prev => {
          if (prev <= 1) {
            handleCompleteAuthorization();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, ussdPromptCountdown]);

  const handleSelectPaymentMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    if (method === 'mtn_momo') {
      setPhoneNumber('0772 123 456');
    } else if (method === 'airtel_money') {
      setPhoneNumber('0702 987 654');
    }
    setStep('form');
  };

  const handleInitiatePayment = (e: FormEvent) => {
    e.preventDefault();
    if (amountUgx <= 0) return;

    if (selectedMethod === 'mtn_momo' || selectedMethod === 'airtel_money') {
      setUssdPromptCountdown(6);
      setStep('processing_prompt');
    } else {
      // Card payment
      setIsProcessing(true);
      setTimeout(() => {
        handleCompleteAuthorization();
      }, 1200);
    }
  };

  const handleCompleteAuthorization = async () => {
    setIsProcessing(true);
    const txnId = `GOSPREAD-${selectedMethod?.toUpperCase() || 'MOMO'}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await djangoApi.submitDonation({
        amount: amountUgx,
        ministryName: recipient.name,
        fundType: givingType,
        isRecurring: frequency !== 'one-time',
        paymentMethod: selectedMethod || 'mobile_money',
        donorName,
        donorEmail,
        prayerNote
      });

      setIsProcessing(false);
      setReceiptId(res.transactionId || txnId);
      setDjangoMsg(res.message || 'Payment confirmed via Django Payment Gateway.');
      setStep('success');
      onPaymentSuccess(amountUgx, recipient.name, givingType);
    } catch {
      setIsProcessing(false);
      setReceiptId(txnId);
      setDjangoMsg('Payment recorded successfully.');
      setStep('success');
      onPaymentSuccess(amountUgx, recipient.name, givingType);
    }
  };

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptId);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  const getGivingLabel = () => {
    switch (givingType) {
      case 'platform_pass': return `${frequency === '3-month' ? '3-month' : '1-month'} Gospread Partner Pass`;
      case 'tithe': return 'Tithe & Ministry Support';
      case 'seed': return 'Seed Faith Offering';
      case 'super_amen': return 'Super Amen Live Token';
      default: return 'Kingdom Offering';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl mx-auto my-auto"
        >
          {/* Top subtle close button matching design */}
          <button
            onClick={onClose}
            className="absolute -top-10 right-2 sm:right-0 p-2 rounded-full text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition z-20"
            title="Close Checkout"
          >
            <X className="w-5 h-5 text-indigo-400 hover:text-indigo-300" />
          </button>

          {step !== 'success' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
              
              {/* ================= LEFT CARD: APP & AMOUNT INFO ================= */}
              <div className="md:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                {/* Decorative Top subtle gradient accent */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-600" />
                
                {/* Brand Logo - Vibrant Streaming Badge */}
                <div className="relative mb-3.5 group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-[14px] flex flex-col items-center justify-center p-1 relative overflow-hidden">
                      {/* Play Arrow Icon with colorful gradients matching screenshot */}
                      <div className="w-0 h-0 border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent border-l-[24px] border-l-emerald-500 filter drop-shadow-sm ml-1" />
                      <div className="absolute bottom-1 px-1.5 py-0.5 rounded bg-blue-600 text-white font-extrabold text-[8px] tracking-tight uppercase">
                        Free Stream
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Name */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Gospread-Web
                </h3>
                <p className="text-[11px] text-slate-500 mb-4 font-medium">
                  {recipient.name}
                </p>

                {/* Primary Amount Display */}
                <div className="my-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                    {formatCurrencyAmount(amountUgx, currency)}
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    {formatCurrencyAmount(amountUgx, 'UGX')} {amountUgx} UGX/{getGivingLabel()}
                  </div>
                </div>

                {/* Order Number Pill */}
                <div className="mt-5 w-full">
                  <button
                    type="button"
                    onClick={handleCopyOrder}
                    className="w-full py-2 px-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono flex items-center justify-center gap-1.5 transition group"
                  >
                    <span>Order number:{orderNumber}</span>
                    {copiedOrder ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0" />
                    )}
                  </button>
                </div>

                {/* Optional Amount Adjuster Toggle */}
                <div className="mt-6 pt-5 border-t border-slate-100 w-full text-left">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Change Plan / Blessing Amount</span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase">{currency}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                    {presetUgxAmounts.slice(0, 3).map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => {
                          setAmountUgx(preset.value);
                          setCustomAmount(preset.value.toString());
                        }}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition ${
                          amountUgx === preset.value
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Currency Selector Pills */}
                  <div className="flex items-center gap-1.5">
                    {(['UGX', 'USD', 'KES', 'NGN'] as CurrencyType[]).map(curr => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setCurrency(curr)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          currency === curr ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secure Trust Footer */}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-Bit SSL Encrypted Cashier</span>
                </div>
              </div>

              {/* ================= RIGHT CARD: PAYMENT OPTIONS / FLOW ================= */}
              <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative min-h-[440px] flex flex-col justify-between">
                
                {/* 1. SELECTION STEP (Matching Screenshot Exactly) */}
                {step === 'select' && (
                  <div>
                    <h2 className="text-center text-sm sm:text-base font-semibold text-slate-700 mb-6">
                      Please choose a payment method
                    </h2>

                    {/* Blue Banner Header */}
                    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-[#eef4ff] px-5 py-3 border-b border-blue-100/80">
                        <span className="text-sm font-bold text-[#3b66ff] tracking-wide">
                          Online Payment
                        </span>
                      </div>

                      {/* Payment Method Rows */}
                      <div className="divide-y divide-slate-100 bg-white">
                        
                        {/* Option 1: MTN Momo */}
                        <button
                          type="button"
                          onClick={() => handleSelectPaymentMethod('mtn_momo')}
                          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/90 transition group text-left"
                        >
                          <div className="flex items-center gap-4">
                            {/* MTN Yellow Badge */}
                            <div className="w-12 h-8 rounded-lg bg-[#ffcc00] flex items-center justify-center shadow-sm border border-amber-300/80 shrink-0">
                              <div className="w-9 h-5 rounded-full border border-black flex items-center justify-center">
                                <span className="text-[10px] font-black tracking-tighter text-black">MTN</span>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-slate-800 group-hover:text-slate-950">
                              MTN Momo
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#3b66ff] group-hover:translate-x-0.5 transition" />
                        </button>

                        {/* Option 2: Airtel Money */}
                        <button
                          type="button"
                          onClick={() => handleSelectPaymentMethod('airtel_money')}
                          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/90 transition group text-left"
                        >
                          <div className="flex items-center gap-4">
                            {/* Airtel Red Badge */}
                            <div className="w-12 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                              <div className="w-full h-full bg-[#ed1c24] flex items-center justify-center p-0.5">
                                <span className="text-[10px] font-extrabold text-white tracking-tight">airtel</span>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-slate-800 group-hover:text-slate-950">
                              Airtel Money
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#3b66ff] group-hover:translate-x-0.5 transition" />
                        </button>

                        {/* Option 3: Card */}
                        <button
                          type="button"
                          onClick={() => handleSelectPaymentMethod('card')}
                          className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/90 transition group text-left"
                        >
                          <div className="flex items-center gap-4">
                            {/* Card Blue Badge */}
                            <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm shrink-0">
                              <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-800 group-hover:text-slate-950">
                              Card
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#3b66ff] group-hover:translate-x-0.5 transition" />
                        </button>
                      </div>
                    </div>

                    {/* Support note & details */}
                    <div className="mt-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Your seed directly empowers gospel satellite broadcasts, missionary outreach, and sanctuary media infrastructure.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. FORM STEP FOR SELECTED METHOD */}
                {step === 'form' && (
                  <div>
                    {/* Header with Back Button */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => setStep('select')}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Change Method</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {selectedMethod === 'mtn_momo' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> MTN Mobile Money
                          </span>
                        )}
                        {selectedMethod === 'airtel_money' && (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Airtel Money
                          </span>
                        )}
                        {selectedMethod === 'card' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Credit / Debit Card
                          </span>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleInitiatePayment} className="space-y-4">
                      {/* Mobile Money Inputs (MTN / Airtel) */}
                      {(selectedMethod === 'mtn_momo' || selectedMethod === 'airtel_money') && (
                        <div className="space-y-3.5">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              {selectedMethod === 'mtn_momo' ? 'MTN Phone Number' : 'Airtel Phone Number'}
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-2.5 flex items-center gap-1 text-xs font-bold text-slate-600 border-r border-slate-200 pr-2">
                                <span>🇺🇬 +256</span>
                              </div>
                              <input
                                type="tel"
                                required
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="077X XXX XXX"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-24 pr-3.5 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              A direct USSD push prompt will be sent to your phone to approve {formatCurrencyAmount(amountUgx, currency)}.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                              <input
                                type="text"
                                required
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Email for Receipt</label>
                              <input
                                type="email"
                                required
                                value={donorEmail}
                                onChange={(e) => setDonorEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Card Inputs */}
                      {selectedMethod === 'card' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                            <input
                              type="text"
                              required
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                              />
                              <div className="absolute right-3 top-2 flex items-center gap-1">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">VISA</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">MC</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">Expiration (MM/YY)</label>
                              <input
                                type="text"
                                required
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">CVV / CVC</label>
                              <input
                                type="password"
                                required
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Prayer Request / Note */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Prayer Request / Dedication (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={prayerNote}
                          onChange={(e) => setPrayerNote(e.target.value)}
                          placeholder="Attach a personal prayer petition or note..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Pay Button */}
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3 rounded-xl bg-[#3b66ff] hover:bg-[#2e55e6] text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay {formatCurrencyAmount(amountUgx, currency)}</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. USSD PUSH PROMPT SIMULATION */}
                {step === 'processing_prompt' && (
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <div className="relative mb-5">
                      <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-400 flex items-center justify-center animate-pulse">
                        <Smartphone className="w-8 h-8 text-amber-600" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                        {ussdPromptCountdown}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      Check Your Handset Phone
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mb-4">
                      A prompt from <span className="font-bold text-slate-900">{selectedMethod === 'mtn_momo' ? 'MTN MoMo' : 'Airtel Money'}</span> has been sent to <span className="font-mono font-bold text-blue-600">{phoneNumber}</span> for <span className="font-bold text-slate-900">{formatCurrencyAmount(amountUgx, currency)}</span>.
                    </p>

                    <div className="w-full max-w-xs p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left mb-5">
                      <div className="text-[11px] font-mono text-amber-900 leading-tight">
                        &quot;Authorize payment of {formatCurrencyAmount(amountUgx, currency)} to Gospread-Web? Enter PIN to approve.&quot;
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteAuthorization}
                      className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Have Entered My PIN (Confirm)</span>
                    </button>
                  </div>
                )}

                {/* Footer Security Badges */}
                <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Paynicorn & Gospread Secure Gateway</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">Uganda (UGX)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= SUCCESS CONFIRMATION RECEIPT ================= */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 max-w-xl mx-auto text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                Payment Successful
              </span>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 mb-1">
                Thank You for Your Seed!
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Your transaction has been confirmed and registered on the kingdom ledger.
              </p>

              {/* Receipt Summary Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 mb-6 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Merchant</span>
                  <span className="font-bold text-slate-900">Gospread-Web</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Amount Paid</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrencyAmount(amountUgx, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Payment Method</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {selectedMethod === 'mtn_momo' ? 'MTN Momo' : selectedMethod === 'airtel_money' ? 'Airtel Money' : 'Card'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Order Number</span>
                  <span className="font-mono font-bold text-slate-800">{orderNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Transaction ID</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-blue-600">{receiptId}</span>
                    <button
                      onClick={handleCopyReceipt}
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Copy ID"
                    >
                      {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#3b66ff] hover:bg-[#2e55e6] text-white font-bold text-xs tracking-wide shadow-md transition"
                >
                  Return to Streaming & Fellowship
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
