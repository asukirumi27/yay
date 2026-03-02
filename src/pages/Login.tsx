import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'motion/react';
import { KeyRound, Sparkles } from 'lucide-react';

export default function Login({ setUserId }: { setUserId: (id: string) => void }) {
  const [inputCode, setInputCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setUserId(inputCode.trim());
    }
  };

  const handleGenerateCode = () => {
    const newCode = uuidv4().split('-')[0].toUpperCase();
    setGeneratedCode(newCode);
  };

  const handleUseGeneratedCode = () => {
    if (generatedCode) {
      setUserId(generatedCode);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-rose-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-pink-500"></div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-500 rounded-full mb-4 shadow-inner">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">ยินดีต้อนรับ</h1>
          <p className="text-slate-500 text-sm">ระบบจัดการร้านอาหารสุดน่ารัก 🌸</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รหัสประจำตัวของคุณ</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all shadow-sm text-slate-700 font-mono tracking-wider"
                placeholder="กรอกรหัสของคุณที่นี่..."
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputCode.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 mb-4">ยังไม่มีรหัสใช่ไหม?</p>
          
          {!generatedCode ? (
            <button
              onClick={handleGenerateCode}
              className="w-full bg-white border-2 border-rose-200 text-rose-500 hover:bg-rose-50 font-medium py-3 rounded-xl transition-colors"
            >
              สร้างรหัสใหม่
            </button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 p-4 rounded-xl border border-rose-200"
            >
              <p className="text-xs text-rose-600 mb-2 font-medium">รหัสใหม่ของคุณคือ (โปรดจดจำไว้!)</p>
              <div className="text-2xl font-mono font-bold text-slate-800 mb-3 tracking-widest bg-white py-2 rounded-lg shadow-sm">
                {generatedCode}
              </div>
              <button
                onClick={handleUseGeneratedCode}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
              >
                ใช้รหัสนี้เข้าสู่ระบบ
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
