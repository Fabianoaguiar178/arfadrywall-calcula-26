
import React, { useState } from 'react';
import { ICONS, PIX_KEY, SUBSCRIPTION_PRICE, UNLOCK_KEY_SECRET, TRIAL_DAYS, SUPPORT_PHONE } from '../constants';
import { updateUser, getUser } from '../services/storage';

interface SubscriptionProps {
  onActivate: () => void;
  isLocked?: boolean;
  daysUsed?: number;
}

const Subscription: React.FC<SubscriptionProps> = ({ onActivate, isLocked = false, daysUsed = 0 }) => {
  const [checking, setChecking] = useState(false);
  const [unlockKey, setUnlockKey] = useState('');
  const [error, setError] = useState('');

  const remainingDays = Math.max(0, TRIAL_DAYS - daysUsed);
  const user = getUser(); // Get fresh user state

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');

    setTimeout(() => {
      if (unlockKey.trim() === UNLOCK_KEY_SECRET) {
        // Activate user
        const updatedUser = { ...user, subscriptionActive: true };
        updateUser(updatedUser);
        setChecking(false);
        onActivate();
      } else {
        setError('Chave inválida. Verifique e tente novamente.');
        setChecking(false);
      }
    }, 1500); // Fake processing delay for better UX
  };

  if (user.subscriptionActive) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ICONS.Check className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Licença Vitalícia Ativa!</h2>
        <p className="text-slate-500 mb-8">Você possui acesso liberado ao ArfaDrywall Calcula Pro para sempre.</p>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm mx-auto">
          <p className="text-xs font-bold uppercase text-slate-400 mb-1">Sua Chave de Acesso</p>
          <p className="font-mono text-lg font-bold text-slate-800 tracking-wider">••••••••@isa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">
          {isLocked ? <span className="text-red-600">Teste Finalizado</span> : <span>Seja Arfa <span className="text-blue-600">Pro</span></span>}
        </h2>
        <p className="text-slate-500">
          {isLocked 
            ? "Seu período de avaliação terminou. Adquira sua chave vitalícia para continuar." 
            : `Você tem ${remainingDays} dias restantes de teste gratuito (Total de ${TRIAL_DAYS} dias).`}
        </p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-blue-600 shadow-2xl shadow-blue-100 overflow-hidden">
        <div className={`p-8 text-white text-center ${isLocked ? 'bg-slate-800' : 'bg-blue-600'}`}>
          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-white/30">
            Acesso Vitalício
          </div>
          <p className="text-blue-100 font-bold text-sm uppercase tracking-widest mb-2">Pagamento Único</p>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-medium">R$</span>
            <span className="text-5xl font-black">{SUBSCRIPTION_PRICE.toFixed(2)}</span>
          </div>
          <p className="text-blue-200 mt-2 text-xs font-medium">Sem mensalidades. Use para sempre.</p>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Payment Info */}
          <div className="text-center space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Adquira a Chave</p>
            <div className="flex flex-col items-center gap-4">
               <p className="text-sm text-slate-600 px-4">
                 Para liberar o acesso vitalício, entre em contato via WhatsApp e solicite sua chave.
               </p>
               <a 
                 href={`https://api.whatsapp.com/send?phone=${SUPPORT_PHONE}&text=Ola, gostaria de adquirir a Chave Vitalicia do ArfaDrywall Calcula.`} 
                 target="_blank" 
                 className="w-full flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
               >
                 <ICONS.WhatsApp className="w-6 h-6" />
                 Adquirir Chave Vitalícia
               </a>
            </div>
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Já possui a chave?</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          {/* Key Validation */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="text-center">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Insira sua Chave</p>
            </div>
            
            <div>
               <input 
                 type="text" 
                 value={unlockKey}
                 onChange={e => {
                   setUnlockKey(e.target.value);
                   setError('');
                 }}
                 placeholder="Cole sua chave aqui..."
                 className={`w-full p-4 bg-slate-50 border ${error ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'} rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-medium text-center`}
               />
               {error && <p className="text-red-500 text-xs font-bold mt-2 text-center">{error}</p>}
            </div>

            <button 
              type="submit"
              disabled={checking || !unlockKey}
              className={`w-full p-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
                 checking || !unlockKey 
                 ? 'bg-slate-200 text-slate-400 shadow-none' 
                 : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {checking ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Validando...
                </>
              ) : (
                'Liberar Acesso Vitalício'
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className="text-center space-y-2">
         <div className="p-4 bg-slate-100 rounded-2xl text-xs text-slate-500">
           <strong>Suporte Técnico:</strong> Dúvidas ou problemas com a chave? <br/>
           Chame no WhatsApp: <strong>(54) 98118-9714</strong>
         </div>
      </div>
    </div>
  );
};

export default Subscription;