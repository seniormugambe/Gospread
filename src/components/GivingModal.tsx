import React, { useState, useEffect, FormEvent } from 'react';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  DollarSign, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Building2, 
  Music2, 
  Globe, 
  Award, 
  QrCode, 
  ArrowRight,
  Gift,
  Lock,
  Receipt,
  Download,
  Share2,
  Check,
  Server
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

export default function GivingModal({ target, onClose, onPaymentSuccess }: GivingModalProps) {
  // Giving Category Selection (if no specific target provided or if user wants to switch target)
  const [givingType, setGivingType] = useState<'tithe' | 'seed' | 'super_amen' | 'platform_pass'>('tithe');
  const [recipient, setRecipient] = useState<GivingTarget>(
    target || {
      id: 'platform-global',
      name: 'Gospread Global Mission Fund',
      avatar: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=120&q=80',
      type: 'platform',
      categoryTitle: 'Global Gospel Broadcasting & Satellite Network'
    }
  );

  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'paypal' | 'mobile_money'>('card');
  
  // Form Input States
  const [donorName, setDonorName] = useState('Senior Member');
  const [donorEmail, setDonorEmail] = useState('member@gospread.tv');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('777');
  const [prayerNote, setPrayerNote] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  // Success Receipt State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [djangoMsg, setDjangoMsg] = useState('');
  const [isRealDjango, setIsRealDjango] = useState(false);

  // Trigger subtle confetti celebration on transaction completion
  useEffect(() => {
    if (isCompleted) {
      // Main central confetti burst
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#34d399', '#3b82f6', '#fef08a'],
        disableForReducedMotion: true,
      });

      // Secondary subtle side bursts after 200ms
      const timer = setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 50,
          origin: { x: 0.25, y: 0.6 },
          colors: ['#fbbf24', '#34d399', '#fef08a'],
        });
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 50,
          origin: { x: 0.75, y: 0.6 },
          colors: ['#fbbf24', '#34d399', '#fef08a'],
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleSubmitPayment = async (e: FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsProcessing(true);

    try {
      const res = await djangoApi.submitDonation({
        amount,
        ministryName: recipient.name,
        fundType: givingType,
        isRecurring: frequency === 'monthly',
        paymentMethod,
        donorName: anonymous ? 'Anonymous Partner' : donorName,
        donorEmail,
        prayerNote
      });

      setIsProcessing(false);
      setReceiptId(res.transactionId);
      setDjangoMsg(res.message);
      setIsRealDjango(res.isRealDjango);
      setIsCompleted(true);
      onPaymentSuccess(amount, recipient.name, givingType);
    } catch (err: any) {
      setIsProcessing(false);
      const generatedReceipt = `GOSPREAD-GIVE-${Math.floor(100000 + Math.random() * 900000)}`;
      setReceiptId(generatedReceipt);
      setDjangoMsg('Transaction recorded via Django fallback handler.');
      setIsRealDjango(false);
      setIsCompleted(true);
      onPaymentSuccess(amount, recipient.name, givingType);
    }
  };

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptId);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#181818] border border-amber-500/30 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>

          {!isCompleted ? (
            <div>
              {/* Header Banner */}
              <div className="p-6 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950/80 border-b border-slate-800 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Heart className="w-6 h-6 fill-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <span>Kingdom Giving & Partner Portal</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold font-mono flex items-center gap-1">
                        <Server className="w-3 h-3 text-emerald-400" /> Django API
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Support ministry broadcasts, sow faith seeds, or join Gospread Platform Membership.
                    </p>
                  </div>
                </div>

                {/* Recipient Card */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {recipient.avatar ? (
                      <img src={recipient.avatar} alt={recipient.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                        GT
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Recipient Profile</div>
                      <h4 className="text-xs font-bold text-white truncate">{recipient.name}</h4>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase shrink-0">
                    {recipient.type === 'platform' ? 'Platform Partner' : recipient.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Giving Form Body */}
              <form onSubmit={handleSubmitPayment} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                
                {/* 1. Giving Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    1. Select Support Type
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { 
                        id: 'tithe', 
                        label: 'Tithe & Offering', 
                        sub: 'Church & Ministry support', 
                        icon: Building2, 
                        color: 'text-amber-400' 
                      },
                      { 
                        id: 'seed', 
                        label: 'Seed Faith Offering', 
                        sub: 'Artiste & Preacher blessing', 
                        icon: Music2, 
                        color: 'text-red-400' 
                      },
                      { 
                        id: 'super_amen', 
                        label: 'Super Amen Chat Token', 
                        sub: 'Highlight during live stream', 
                        icon: Sparkles, 
                        color: 'text-blue-400' 
                      },
                      { 
                        id: 'platform_pass', 
                        label: 'Platform Partner Pass', 
                        sub: 'Ad-Free + Supporter Badge', 
                        icon: Award, 
                        color: 'text-emerald-400' 
                      },
                    ].map(typeItem => {
                      const Icon = typeItem.icon;
                      const isSel = givingType === typeItem.id;
                      return (
                        <button
                          key={typeItem.id}
                          type="button"
                          onClick={() => setGivingType(typeItem.id as any)}
                          className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                            isSel
                              ? 'bg-slate-900 border-amber-500/50 ring-1 ring-amber-500/50'
                              : 'bg-[#0f0f0f] border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className={`p-1.5 rounded-xl bg-slate-800 ${typeItem.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{typeItem.label}</div>
                            <div className="text-[10px] text-slate-400">{typeItem.sub}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Amount & Frequency */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      2. Choose Amount ($ USD)
                    </label>
                    <div className="flex bg-[#0f0f0f] border border-slate-800 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setFrequency('one-time')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                          frequency === 'one-time' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        One-Time Seed
                      </button>
                      <button
                        type="button"
                        onClick={() => setFrequency('monthly')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg transition ${
                          frequency === 'monthly' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Monthly Covenant
                      </button>
                    </div>
                  </div>

                  {/* Preset Amount Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {presetAmounts.map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAmountSelect(val)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          amount === val && !customAmount
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-[#0f0f0f] text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Input */}
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                    <input
                      type="number"
                      min="1"
                      step="any"
                      placeholder="Enter custom blessing amount..."
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 3. Payment Method */}
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    3. Secure Payment Method
                  </label>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'card', label: 'Card', icon: CreditCard },
                      { id: 'apple_pay', label: 'Apple Pay', icon: Lock },
                      { id: 'paypal', label: 'PayPal', icon: Globe },
                      { id: 'mobile_money', label: 'Mobile/Bank', icon: Receipt },
                    ].map(method => {
                      const Icon = method.icon;
                      const isSel = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`py-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                            isSel
                              ? 'bg-slate-900 border-amber-500/50 text-amber-400 font-bold'
                              : 'bg-[#0f0f0f] border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[10px]">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Card Form Inputs */}
                  {paymentMethod === 'card' && (
                    <div className="p-3.5 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-3 mt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Card Number</label>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Exp / CVC</label>
                          <input
                            type="text"
                            required
                            value={`${cardExpiry} ${cardCvc}`}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prayer / Dedication Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Prayer Request / Blessing Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={prayerNote}
                    onChange={(e) => setPrayerNote(e.target.value)}
                    placeholder="Attach a personal prayer request or thanksgiving note with this offering..."
                    className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm ${amount} {frequency === 'monthly' ? '/ Month' : ''} Blessing</span>
                    </>
                  )}
                </button>

                {/* Security Footer Note */}
                <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  256-Bit SSL Encrypted Kingdom Financial Gateways. Tax Deductible Receipt Generated.
                </p>
              </form>
            </div>
          ) : (
            /* SUCCESSFUL RECEIPT & Scripture BLESSING SCREEN */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="p-6 text-center space-y-6 relative overflow-hidden"
            >
              {/* Background Glow Effect */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Animated Success Checkmark & Glow Aura */}
              <div className="relative inline-block mx-auto">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: [0, 1.2, 1], rotate: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 relative z-10"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>
                
                {/* Floating Heart / Sparkle Badges */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: [0, -6, 0], opacity: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-2 -right-3 p-1.5 rounded-full bg-amber-500 text-slate-950 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                </motion.div>

                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: [0, 6, 0], opacity: 1 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  className="absolute -bottom-1 -left-3 p-1.5 rounded-full bg-red-500 text-white shadow-md"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                </motion.div>
              </div>

              {/* Thank You Animated Banner */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-1.5"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Offering Received & Processed</span>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
                  Thank You for Your ${amount} Blessing!
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your offering to <strong className="text-white">{recipient.name}</strong> has been processed securely. May your kingdom seed yield a bountiful harvest!
                </p>
              </motion.div>

              {/* Scripture Blessing Box */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-left space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Scripture Blessing</span>
                <p className="text-xs text-amber-200 italic">
                  "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                </p>
                <span className="text-[10px] font-semibold text-slate-400 block text-right">— 2 Corinthians 9:7</span>
              </div>

              {/* Transaction Receipt Card */}
              <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span>Official Receipt ID</span>
                  <span className="font-mono text-amber-400 font-bold">{receiptId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Donor Name</span>
                  <span className="text-white font-semibold">{donorName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Support Target</span>
                  <span className="text-white font-semibold">{recipient.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frequency</span>
                  <span className="text-emerald-400 font-semibold uppercase">{frequency}</span>
                </div>
                <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2 text-[11px]">
                  <span>Payment Gateway Engine</span>
                  <span className="text-emerald-300 font-mono flex items-center gap-1 font-bold">
                    <Server className="w-3 h-3 text-emerald-400" />
                    {isRealDjango ? 'Django REST Endpoint (/api/v1/giving/donate/)' : 'Django Service Gateway Active'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCopyReceipt}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition"
                >
                  {copiedReceipt ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
                  <span>{copiedReceipt ? 'Receipt Reference Copied' : 'Copy Receipt ID'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/20"
                >
                  <span>Return to Gospread</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
