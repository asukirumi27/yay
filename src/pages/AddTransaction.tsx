import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const INCOME_CATEGORIES = ['ยอดขายหน้าร้าน', 'ยอดขายเดลิเวอรี่', 'รับจัดเลี้ยง', 'อื่นๆ'];
const EXPENSE_CATEGORIES = ['วัตถุดิบ (เนื้อสัตว์)', 'วัตถุดิบ (ผัก/ผลไม้)', 'เครื่องดื่ม', 'บรรจุภัณฑ์', 'ค่าแก๊ส/น้ำ/ไฟ', 'ค่าจ้างพนักงาน', 'อื่นๆ'];

export default function AddTransaction({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uuidv4(),
          userId,
          type,
          amount: Number(amount),
          category,
          note,
          date,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setAmount('');
          setNote('');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to add transaction', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto font-sans">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">เพิ่มรายการใหม่ 📝</h2>
        <p className="text-slate-500 text-sm mt-1">บันทึกรายรับ-รายจ่ายของร้าน</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-rose-100 relative overflow-hidden"
      >
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center"
          >
            <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-slate-800">บันทึกสำเร็จ! 🎉</h3>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => { setType('income'); setCategory(INCOME_CATEGORIES[0]); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                type === 'income' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              รายรับ 💰
            </button>
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                type === 'expense' 
                  ? 'bg-white text-rose-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              รายจ่าย 💸
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">วันที่</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-rose-400 transition-shadow text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">จำนวนเงิน (บาท)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-rose-400 transition-shadow text-slate-700 text-lg font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-rose-400 transition-shadow text-slate-700"
              >
                {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">บันทึกเพิ่มเติม (ไม่บังคับ)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น ซื้อผักที่ตลาด..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-rose-400 transition-shadow text-slate-700 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !amount}
            className={`w-full py-4 rounded-xl text-white font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
              type === 'income' 
                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
            {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
