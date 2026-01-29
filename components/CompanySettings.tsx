
import React, { useState } from 'react';
import { Company, MaterialPrices } from '../types';
import { saveCompany } from '../services/storage';
import { ICONS } from '../constants';

interface CompanySettingsProps {
  company: Company;
  onSave: (c: Company) => void;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ company, onSave }) => {
  const [data, setData] = useState<Company>(company);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    saveCompany(data);
    onSave(data);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateMaterialPrice = (key: keyof MaterialPrices, val: number) => {
    setData(prev => ({
      ...prev,
      materialPrices: {
        ...prev.materialPrices,
        [key]: val
      }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Perfil Profissional</h2>
        {success && (
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-bounce">
            Configurações Salvas!
          </div>
        )}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center">
              {data.logo ? (
                <img src={data.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <ICONS.User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold">
              Alterar
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
          <p className="text-xs text-slate-500 font-medium">Logotipo para Orçamentos</p>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome da Empresa</label>
            <input 
              type="text" 
              value={data.name} 
              onChange={e => setData({...data, name: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">CNPJ / CPF</label>
            <input 
              type="text" 
              value={data.cnpj} 
              onChange={e => setData({...data, cnpj: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Telefone</label>
            <input 
              type="text" 
              value={data.phone} 
              onChange={e => setData({...data, phone: e.target.value})}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Global Prices Table */}
        <div className="pt-6 border-t border-slate-100">
           <h4 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-wider flex items-center gap-2">
             <ICONS.Calculator className="w-4 h-4 text-blue-600" />
             Tabela de Preços (Mercado)
           </h4>
           
           <div className="space-y-6">
              {/* Labor & Painting */}
              <div className="grid grid-cols-2 gap-4">
                <PriceItem label="Mão de Obra / m²" val={data.defaultLaborPrice} onChange={v => setData({...data, defaultLaborPrice: v})} />
                <PriceItem label="Pintura / m²" val={data.defaultPaintingPrice} onChange={v => setData({...data, defaultPaintingPrice: v})} />
              </div>

              {/* Specific Materials */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl">
                 <div className="col-span-full text-xs font-black text-blue-600 uppercase tracking-widest mb-1 mt-2 border-b border-blue-100 pb-1">Drywall</div>
                 <PriceItem label="Chapa (1.2x1.8)" val={data.materialPrices.sheet} onChange={v => updateMaterialPrice('sheet', v)} />
                 <PriceItem label="Montante (3m)" val={data.materialPrices.stud} onChange={v => updateMaterialPrice('stud', v)} />
                 <PriceItem label="Guia (3m)" val={data.materialPrices.track} onChange={v => updateMaterialPrice('track', v)} />
                 <PriceItem label="F530 (3m)" val={data.materialPrices.f530} onChange={v => updateMaterialPrice('f530', v)} />
                 <PriceItem label="Tabica (3m)" val={data.materialPrices.perimeter} onChange={v => updateMaterialPrice('perimeter', v)} />
                 <PriceItem label="Massa (kg)" val={data.materialPrices.compound} onChange={v => updateMaterialPrice('compound', v)} />
                 <PriceItem label="Paraf. Chapa (un)" val={data.materialPrices.screw_sheet} onChange={v => updateMaterialPrice('screw_sheet', v)} />
                 <PriceItem label="Paraf. Metal (un)" val={data.materialPrices.screw_metal} onChange={v => updateMaterialPrice('screw_metal', v)} />
                 <PriceItem label="Fita Telada (un)" val={data.materialPrices.tape} onChange={v => updateMaterialPrice('tape', v)} />
                 <PriceItem label="Bucha 6mm (un)" val={data.materialPrices.bucha_6} onChange={v => updateMaterialPrice('bucha_6', v)} />
                 <PriceItem label="Regulador F530 (un)" val={data.materialPrices.regulator} onChange={v => updateMaterialPrice('regulator', v)} />
                 <PriceItem label="Arame (kg)" val={data.materialPrices.wire} onChange={v => updateMaterialPrice('wire', v)} />

                 <div className="col-span-full text-xs font-black text-blue-600 uppercase tracking-widest mb-1 mt-4 border-b border-blue-100 pb-1">Pintura</div>
                 <PriceItem label="Tinta 18L" val={data.materialPrices.paint_18l} onChange={v => updateMaterialPrice('paint_18l', v)} />
                 <PriceItem label="Massa Corrida 15kg" val={data.materialPrices.massa_15kg} onChange={v => updateMaterialPrice('massa_15kg', v)} />
                 <PriceItem label="Lixa (folha)" val={data.materialPrices.sandpaper} onChange={v => updateMaterialPrice('sandpaper', v)} />
                 <PriceItem label="Rolo" val={data.materialPrices.roller} onChange={v => updateMaterialPrice('roller', v)} />
                 <PriceItem label="Pincel" val={data.materialPrices.brush} onChange={v => updateMaterialPrice('brush', v)} />
                 <PriceItem label="Fita Larga" val={data.materialPrices.wide_tape} onChange={v => updateMaterialPrice('wide_tape', v)} />
                 <PriceItem label="Lona (m)" val={data.materialPrices.canvas} onChange={v => updateMaterialPrice('canvas', v)} />
              </div>
           </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
        >
          Salvar Todas as Configurações
        </button>
      </div>

      <div className="p-6 bg-red-50 border border-red-100 rounded-3xl">
        <h4 className="text-red-900 font-bold mb-1 flex items-center gap-2">Sair da Conta</h4>
        <p className="text-red-700 text-xs mb-4">Você precisará logar novamente para acessar seus orçamentos.</p>
        <button className="text-red-600 text-sm font-bold underline">Fazer Logout</button>
      </div>
    </div>
  );
};

const PriceItem = ({ label, val, onChange }: { label: string, val: number, onChange: (v: number) => void }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tight">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
      <input 
        type="number" 
        step="0.01"
        value={val} 
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full p-2 pl-8 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700"
      />
    </div>
  </div>
);

export default CompanySettings;
