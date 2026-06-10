import React, { useState, useEffect } from 'react';
import { PlusCircle, Wallet, TrendingUp, TrendingDown, Trash2, Calendar, Tags, FileText, DollarSign } from 'lucide-react';
import { Transaction, TransactionType, CATEGORIES } from './types';

// Helper for date checks
const isToday = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isThisWeek = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  return date >= startOfWeek && date <= endOfWeek;
};

const isThisMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.getMonth() === today.getMonth() && 
         date.getFullYear() === today.getFullYear();
};

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>(CATEGORIES['expense'][0]);
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Handle type change to reset category
  useEffect(() => {
    setCategory(CATEGORIES[type][0]);
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    const newTx: Transaction = {
      id: Date.now(),
      date,
      type,
      category,
      amount: parseFloat(amount),
      note
    };

    setTransactions(prev => [newTx, ...prev]);
    setAmount('');
    setNote('');
  };

  const handleDelete = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getSummary = (filterFn: (date: string) => boolean) => {
    return transactions.filter(t => filterFn(t.date)).reduce(
      (acc, curr) => {
        if (curr.type === 'income') acc.income += curr.amount;
        else acc.expense += curr.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  };

  const daily = getSummary(isToday);
  const weekly = getSummary(isThisWeek);
  const monthly = getSummary(isThisMonth);

  const SummaryCard = ({ title, data }: { title: string, data: { income: number, expense: number } }) => {
    const balance = data.income - data.expense;
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <div className="flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-xs text-emerald-600 font-semibold mb-1 flex items-center gap-1"><TrendingUp size={12}/> ចំណូល</span>
                <span className="text-lg font-bold text-emerald-600">+${data.income.toFixed(2)}</span>
            </div>
            <div className="flex flex-col text-right">
                <span className="text-xs text-rose-500 font-semibold mb-1 flex items-center justify-end gap-1">ចំណាយ <TrendingDown size={12}/></span>
                <span className="text-lg font-bold text-rose-500">-${data.expense.toFixed(2)}</span>
            </div>
        </div>
        <div className="h-px bg-gray-100 my-1 w-full"></div>
        <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">សរុប (Balance)</span>
            <span className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                ${balance.toFixed(2)}
            </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 pb-12">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md mb-8">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center gap-3">
            <Wallet size={32} className="text-blue-100" />
            <h1 className="text-2xl font-bold tracking-tight">ប្រព័ន្ធកត់ត្រាចំណូលចំណាយផ្ទាល់ខ្លួន</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <section className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                <div className="p-5 bg-gray-50/50 border-b border-gray-100/80 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <PlusCircle size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                        បញ្ជូលប្រតិបត្តិការថ្មី
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                           <Calendar size={16} className="text-gray-400" /> កាលបរិច្ឆេទ
                        </label>
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                                <Tags size={16} className="text-gray-400"/> ប្រភេទ
                            </label>
                            <select 
                                value={type}
                                onChange={(e) => setType(e.target.value as TransactionType)}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none bg-white"
                            >
                                <option value="expense">ចំណាយ</option>
                                <option value="income">ចំណូល</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-transparent select-none">
                                ចំណាត់ថ្នាក់ក្រុម
                            </label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none bg-white"
                            >
                                {CATEGORIES[type].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                            <DollarSign size={16} className="text-gray-400" /> ចំនួនទឹកប្រាក់ ($)
                        </label>
                        <input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="ឧ. 10.50"
                            required
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none font-mono text-lg"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" /> បរិយាយ (ចំណាំ)
                        </label>
                        <input 
                            type="text" 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="ឧ. ញ៉ាំកាហ្វេ..."
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <PlusCircle size={20} />
                        រក្សាទុកទិន្នន័យ
                    </button>
                </form>
            </div>
        </section>

        {/* Right Column: Summaries & History */}
        <section className="lg:col-span-8 space-y-8">
            
            {/* Dashboard */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={24} className="text-blue-600" /> របាយការណ៍សង្ខេប
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard title="ប្រចាំថ្ងៃនេះ" data={daily} />
                    <SummaryCard title="ប្រចាំសប្តាហ៍នេះ" data={weekly} />
                    <SummaryCard title="ប្រចាំខែនេះ" data={monthly} />
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            ប្រវត្តិប្រតិបត្តិការថ្មីៗ
                        </h2>
                    </div>
                    <span className="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-medium">
                        {transactions.length} ប្រតិបត្តិការ
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-white border-b border-gray-200 text-gray-500 text-sm">
                                <th className="p-4 font-medium w-32">ថ្ងៃខែឆ្នាំ</th>
                                <th className="p-4 font-medium w-24">ប្រភេទ</th>
                                <th className="p-4 font-medium w-32">ក្រុម</th>
                                <th className="p-4 font-medium">បរិយាយ</th>
                                <th className="p-4 font-medium text-right w-28">ទឹកប្រាក់</th>
                                <th className="p-4 font-medium text-center w-16">សកម្មភាព</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Wallet size={48} className="text-gray-200" />
                                            <p>មិនទាន់មានទិន្នន័យនៅឡើយទេ</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{t.date}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded border text-[11px] font-medium tracking-wide shadow-sm ${
                                                t.type === 'income' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                                            }`}>
                                                {t.type === 'income' ? 'ចំណូល' : 'ចំណាយ'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700">{t.category}</td>
                                        <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate" title={t.note}>
                                            {t.note || '-'}
                                        </td>
                                        <td className={`p-4 text-right font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(t.id)}
                                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/20 md:opacity-0 md:group-hover:opacity-100"
                                                title="លុប"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
