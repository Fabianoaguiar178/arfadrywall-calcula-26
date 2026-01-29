
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onLogin(email);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-blue-200">A</div>
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">ArfaDrywall <span className="text-blue-600 uppercase">Calcula</span></h1>
           <p className="text-slate-500 mt-2">Acesse sua ferramenta de orçamentos profissional.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sua Senha</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium"
            />
          </div>
          <button 
            type="submit"
            className="w-full p-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            Entrar no Painel
          </button>
        </form>

        <div className="text-center pt-4">
           <button className="text-xs text-blue-600 font-bold hover:underline">Esqueceu sua senha?</button>
           <div className="mt-8 flex items-center gap-4 text-slate-300">
             <div className="h-px flex-1 bg-slate-100"></div>
             <span className="text-[10px] uppercase font-bold">Ou crie uma conta</span>
             <div className="h-px flex-1 bg-slate-100"></div>
           </div>
           <button className="mt-4 w-full p-4 border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">
             Cadastre-se Gratuitamente
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
