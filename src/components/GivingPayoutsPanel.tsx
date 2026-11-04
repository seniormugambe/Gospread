import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Banknote, Landmark, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import {
  djangoApi,
  DonationLedgerApi,
  PayoutAccountApi,
  PayoutAccountInput,
} from '../services/djangoApi';

const CURRENCIES = ['UGX', 'KES', 'TZS', 'RWF', 'NGN', 'GHS', 'ZAR', 'USD', 'GBP', 'EUR'];

const emptyForm = {
  label: '',
  account_type: 'mobile_money' as PayoutAccountInput['account_type'],
  currency: 'UGX',
  account_holder: '',
  provider: '',
  account_number: '',
  routing_or_swift: '',
  phone_number: '',
  is_primary: false,
};

const formatMoney = (amount: number, currency: string) =>
  `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default function GivingPayoutsPanel() {
  const [accounts, setAccounts] = useState<PayoutAccountApi[]>([]);
  const [ledger, setLedger] = useState<DonationLedgerApi[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [accountList, donationList, me] = await Promise.all([
        djangoApi.getPayoutAccounts(),
        djangoApi.getGivingLedger(),
        djangoApi.getMe(),
      ]);
      setAccounts(accountList);
      setLedger(donationList);
      setMyId(String(me.id));
    } catch (error) {
      setLoadError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const { income, outcome, incomeTotals, outcomeTotals } = useMemo(() => {
    const completed = ledger.filter(d => d.status === 'completed');
    const isMine = (d: DonationLedgerApi) => myId !== null && String(d.donor) === myId;
    const sum = (rows: DonationLedgerApi[]) => rows.reduce<Record<string, number>>((acc, d) => {
      acc[d.currency] = (acc[d.currency] || 0) + Number(d.amount);
      return acc;
    }, {});
    const received = completed.filter(d => !isMine(d));
    const given = completed.filter(isMine);
    return { income: received, outcome: given, incomeTotals: sum(received), outcomeTotals: sum(given) };
  }, [ledger, myId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (acc: PayoutAccountApi) => {
    setEditingId(acc.id);
    setForm({
      label: acc.label,
      account_type: acc.account_type,
      currency: acc.currency,
      account_holder: acc.account_holder,
      provider: acc.provider,
      account_number: '',
      routing_or_swift: acc.routing_or_swift,
      phone_number: acc.phone_number,
      is_primary: acc.is_primary,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload: PayoutAccountInput = {
        label: form.label.trim(),
        account_type: form.account_type,
        currency: form.currency,
        account_holder: form.account_holder.trim(),
        provider: form.provider.trim(),
        routing_or_swift: form.account_type === 'bank' ? form.routing_or_swift.trim() : '',
        phone_number: form.account_type === 'mobile_money' ? form.phone_number.trim() : '',
        is_primary: form.is_primary,
      };
      // A blank account number on edit keeps the stored one.
      if (form.account_number.trim()) payload.account_number = form.account_number.trim();
      await djangoApi.savePayoutAccount(payload, editingId ?? undefined);
      setShowForm(false);
      await load();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (acc: PayoutAccountApi) => {
    if (!window.confirm(`Remove "${acc.label}"? This cannot be undone.`)) return;
    try {
      await djangoApi.deletePayoutAccount(acc.id);
      await load();
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  };

  const inputClass = 'w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none';
  const totalsText = (totals: Record<string, number>) => {
    const entries = Object.entries(totals);
    return entries.length ? entries.map(([cur, amt]) => formatMoney(amt, cur)).join(' • ') : '0';
  };

  const renderLedger = (rows: DonationLedgerApi[], direction: 'in' | 'out') => (
    <div className="space-y-2.5">
      {rows.length === 0 && (
        <p className="p-4 text-center text-xs text-slate-400 rounded-2xl bg-slate-900/80 border border-slate-800">
          {direction === 'in' ? 'No completed donations received yet.' : 'No completed gifts made from this account yet.'}
        </p>
      )}
      {rows.slice(0, 8).map(tx => (
        <div key={tx.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="min-w-0">
            <span className="font-bold text-white">
              {direction === 'in' ? (tx.is_anonymous ? 'Anonymous' : tx.donor_name || 'Giver') : tx.church_name}
            </span>
            <span className="text-slate-500 ml-2">• {tx.fund_name}</span>
            <p className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleString()}</p>
          </div>
          <span className={`font-mono font-bold ${direction === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {direction === 'in' ? '+' : '-'}{formatMoney(Number(tx.amount), tx.currency)}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Giving & Partners — Payout Details</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage the mobile money numbers and bank accounts that belong to your account.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add payout account
        </button>
      </div>

      {loadError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button type="button" onClick={() => void load()} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl bg-[#161616] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5"><ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> Income (donations received)</span>
          <p className="text-lg font-black text-emerald-400 break-words">{totalsText(incomeTotals)}</p>
        </div>
        <div className="p-4 rounded-3xl bg-[#161616] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5"><ArrowUpRight className="w-3.5 h-3.5 text-rose-400" /> Outcome (gifts you made)</span>
          <p className="text-lg font-black text-rose-400 break-words">{totalsText(outcomeTotals)}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="p-5 rounded-3xl bg-[#161616] border border-amber-500/30 space-y-4">
          <h4 className="text-sm font-bold text-white">{editingId ? 'Edit payout account' : 'New payout account'}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="font-bold text-slate-300">Type</span>
              <select
                value={form.account_type}
                onChange={e => setForm({ ...form, account_type: e.target.value as PayoutAccountInput['account_type'] })}
                className={inputClass}
              >
                <option value="mobile_money">Mobile money</option>
                <option value="bank">Bank account</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="font-bold text-slate-300">Label</span>
              <input required maxLength={80} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="e.g. Tithes MTN line" className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="font-bold text-slate-300">Account holder name</span>
              <input required maxLength={160} value={form.account_holder} onChange={e => setForm({ ...form, account_holder: e.target.value })} className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="font-bold text-slate-300">{form.account_type === 'bank' ? 'Bank name' : 'Network (MTN, Airtel, M-Pesa…)'}</span>
              <input required maxLength={120} value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} className={inputClass} />
            </label>
            {form.account_type === 'mobile_money' ? (
              <label className="space-y-1">
                <span className="font-bold text-slate-300">Mobile number</span>
                <input required type="tel" inputMode="tel" value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} placeholder="+256 7XX XXX XXX" className={inputClass} />
              </label>
            ) : (
              <>
                <label className="space-y-1">
                  <span className="font-bold text-slate-300">Account number {editingId && <em className="font-normal text-slate-500">(leave blank to keep current)</em>}</span>
                  <input required={!editingId} inputMode="numeric" autoComplete="off" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} className={inputClass} />
                </label>
                <label className="space-y-1">
                  <span className="font-bold text-slate-300">SWIFT / routing code (optional)</span>
                  <input maxLength={32} value={form.routing_or_swift} onChange={e => setForm({ ...form, routing_or_swift: e.target.value })} className={inputClass} />
                </label>
              </>
            )}
            <label className="space-y-1">
              <span className="font-bold text-slate-300">Currency</span>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inputClass}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" checked={form.is_primary} onChange={e => setForm({ ...form, is_primary: e.target.checked })} />
            Make this my primary payout account
          </label>
          {formError && <p className="text-xs text-rose-400">{formError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-xs cursor-pointer">
              {saving ? 'Saving…' : 'Save account'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading && <p className="text-xs text-slate-400">Loading payout accounts…</p>}
        {!loading && accounts.length === 0 && !loadError && (
          <p className="p-6 text-center text-xs text-slate-400 rounded-3xl bg-[#161616] border border-slate-800">
            No payout accounts yet. Add a mobile money number or bank account to receive giving.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map(acc => (
            <div key={acc.id} className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{acc.label}</span>
                    {acc.is_primary && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">PRIMARY</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {acc.account_type === 'bank' ? 'Bank' : 'Mobile money'} • {acc.currency} • {acc.provider}
                  </p>
                </div>
                {acc.account_type === 'bank' ? <Landmark className="w-4 h-4 text-slate-500 shrink-0" /> : <Phone className="w-4 h-4 text-slate-500 shrink-0" />}
              </div>
              <div className="text-xs text-slate-300 font-mono">
                <p>{acc.account_holder}</p>
                <p className="text-slate-400">{acc.account_type === 'bank' ? acc.account_number_masked : acc.phone_number}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(acc)} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button type="button" onClick={() => void handleDelete(acc)} className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-white">Recent income</h4>
          {renderLedger(income, 'in')}
        </div>
        <div className="p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-white">Recent outcome</h4>
          {renderLedger(outcome, 'out')}
        </div>
      </div>
    </div>
  );
}
