import { useState, useEffect } from 'react';
import { Transaction, Summary } from '../types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { th } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9'];

export default function Dashboard({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [userId, startDate, endDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const summary: Summary = transactions.reduce(
    (acc, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += curr.amount;
        acc.balance += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
        acc.balance -= curr.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, balance: 0 }
  );

  // Prepare data for Pie Chart (Expenses by Category)
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  })).sort((a, b) => b.value - a.value);

  // Prepare data for Bar Chart (Daily Income/Expense)
  const dailyDataMap = transactions.reduce((acc, curr) => {
    const date = format(new Date(curr.date), 'dd MMM', { locale: th });
    if (!acc[date]) {
      acc[date] = { date, income: 0, expense: 0 };
    }
    if (curr.type === 'income') {
      acc[date].income += curr.amount;
    } else {
      acc[date].expense += curr.amount;
    }
    return acc;
  }, {} as Record<string, { date: string, income: number, expense: number }>);

  const barData = Object.values(dailyDataMap).reverse();

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ภาพรวมร้านอาหาร 🍽️</h2>
          <p className="text-slate-500 text-sm mt-1">รหัสผู้ใช้: <span className="font-mono bg-rose-100 text-rose-600 px-2 py-0.5 rounded">{userId}</span></p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-rose-100">
          <Calendar size={18} className="text-rose-400" />
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm border-none focus:ring-0 text-slate-600 bg-transparent"
          />
          <span className="text-slate-300">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm border-none focus:ring-0 text-slate-600 bg-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-500 rounded-2xl">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">รายรับรวม</p>
            <h3 className="text-2xl font-bold text-slate-800">฿{summary.totalIncome.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 flex items-center gap-4">
          <div className="p-4 bg-rose-100 text-rose-500 rounded-2xl">
            <TrendingDown size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">รายจ่ายรวม</p>
            <h3 className="text-2xl font-bold text-slate-800">฿{summary.totalExpense.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-500 rounded-2xl">
            <Wallet size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">คงเหลือ</p>
            <h3 className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ฿{summary.balance.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-rose-100 text-center">
          <p className="text-slate-500">ยังไม่มีข้อมูลในช่วงเวลานี้ 📝</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">สัดส่วนรายจ่าย 🍰</h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `฿${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">ไม่มีข้อมูลรายจ่าย</div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">รายรับ-รายจ่าย รายวัน 📊</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => `฿${value.toLocaleString()}`}
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="รายรับ" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" name="รายจ่าย" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
