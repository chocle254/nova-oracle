
import React, { useState } from 'react';
import { Transaction, Wallet, TransactionDestination } from '../types';
import { CATEGORIES } from '../constants';
import { CreditCard, Wallet as WalletIcon, ChevronDown } from 'lucide-react';

interface Props {
  wallets: Wallet[];
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<Props> = ({ wallets, onAdd, onClose }) => {
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc || !walletId) return;
    
    let destination: TransactionDestination = 'ready_to_use';
    if (type === 'income') {
      const amt = parseFloat(amount);
      if (amt > 1000) destination = 'investments';
      else if (amt > 200) destination = 'savings';
    }

    onAdd({
      amount: parseFloat(amount),
      description: desc,
      category: cat,
      type,
      walletId,
      destination,
      date: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-md p-8 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl font-black mb-8 text-slate-100 tracking-tight">New Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-3 rounded-xl transition-all duration-300 font-black text-xs uppercase tracking-widest ${type === 'expense' ? 'bg-slate-800 text-red-400 shadow-xl' : 'text-slate-600'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-3 rounded-xl transition-all duration-300 font-black text-xs uppercase tracking-widest ${type === 'income' ? 'bg-slate-800 text-emerald-400 shadow-xl' : 'text-slate-600'}`}
            >
              Income
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-5 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none text-2xl font-black text-slate-100"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none font-bold text-slate-100 placeholder:text-slate-700"
                placeholder="Details"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Category</label>
                <select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none appearance-none text-slate-300 font-bold"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-[3.2rem] text-slate-600" />
              </div>
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Wallet</label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:border-indigo-500 outline-none appearance-none text-slate-300 font-bold"
                >
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-[3.2rem] text-slate-600" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition"
            >
              Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
