
import React, { useState, useEffect } from 'react';
import { ProjectType, Project, Client, Company, MaterialPrices, ProjectRoom, Material } from '../types';
import { calculateMaterials, calculateTotals, consolidateMaterials } from '../services/calculator';
import { saveProject, getCompany, saveCompany } from '../services/storage';
import { ICONS, MATERIAL_PRICES } from '../constants';

interface CalculatorProps {
  onSave: (p: Project) => void;
  onCompanyUpdate?: (c: Company) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onSave, onCompanyUpdate }) => {
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState<ProjectRoom[]>([]);
  
  // Current Room State
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<ProjectType>(ProjectType.WALL);
  const [dimLength, setDimLength] = useState('');
  const [dimWidth, setDimWidth] = useState('');
  const [dimHeight, setDimHeight] = useState('');
  const [roomIncludePainting, setRoomIncludePainting] = useState(false);

  // Global Config
  const [client, setClient] = useState<Client>({ name: '', phone: '', email: '', address: '' });
  const [laborPrice, setLaborPrice] = useState(35);
  const [paintingPrice, setPaintingPrice] = useState(25);
  const [currentMaterialPrices, setCurrentMaterialPrices] = useState<MaterialPrices>({ ...MATERIAL_PRICES });
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const c = getCompany();
    setCompany(c);
    setLaborPrice(c.defaultLaborPrice);
    setPaintingPrice(c.defaultPaintingPrice);
    setCurrentMaterialPrices(c.materialPrices);
  }, []);

  const parseInput = (val: string) => {
    if (!val) return 0;
    const num = parseFloat(val.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const handleAddRoom = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (rooms.length >= 30) {
      alert("Limite máximo de 30 ambientes atingido.");
      return;
    }

    // Parse values
    const l = parseInput(dimLength);
    const w = parseInput(dimWidth);
    const h = parseInput(dimHeight);

    // Validation
    const hasName = !!roomName.trim();
    const isCeiling = roomType === ProjectType.CEILING;
    
    let isValidDims = false;
    let errorMsg = "";

    if (isCeiling) {
      if (l > 0 && w > 0 && h >= 0) isValidDims = true;
      else errorMsg = "Para Forro, preencha Comprimento, Largura e Rebaixamento (pode ser 0).";
    } else {
      if (l > 0 && h > 0) isValidDims = true;
      else errorMsg = "Preencha Comprimento e Altura maiores que 0.";
    }

    if (!hasName) {
      alert("Por favor, digite um nome para o ambiente.");
      return;
    }

    if (!isValidDims) {
      alert(errorMsg || "Verifique as medidas. Use apenas números.");
      return;
    }

    const newRoom: ProjectRoom = {
      id: `room_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: roomName,
      type: roomType,
      dimensions: { 
        length: l, 
        width: isCeiling ? w : 0, 
        height: h 
      },
      includePainting: roomType === ProjectType.PAINTING ? true : roomIncludePainting,
      materials: [] 
    };

    setRooms(prev => [...prev, newRoom]);
    
    // Reset inputs
    setRoomName('');
    setDimLength('');
    setDimWidth('');
    setDimHeight('');
    setRoomIncludePainting(false);
  };

  const removeRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const handleCalculate = () => {
    // 1. Calculate materials
    const calculatedRooms = rooms.map(room => {
      const doPaint = room.type === ProjectType.PAINTING || !!room.includePainting;

      const mats = calculateMaterials(
        room.type, 
        room.dimensions.length, 
        room.dimensions.width, 
        room.dimensions.height, 
        currentMaterialPrices, 
        doPaint
      );
      return { ...room, materials: mats };
    });

    // 2. Consolidate
    const allMaterials = consolidateMaterials(calculatedRooms.map(r => r.materials));

    // 3. Totals
    let totalLaborVal = 0;
    let totalPaintingVal = 0;

    calculatedRooms.forEach(room => {
       const area = room.type === ProjectType.CEILING 
         ? room.dimensions.length * room.dimensions.width 
         : room.dimensions.length * room.dimensions.height;
       
       const doPaint = room.type === ProjectType.PAINTING || !!room.includePainting;

       const { laborTotal, paintingTotal } = calculateTotals(
         room.materials,
         room.type,
         area,
         laborPrice,
         paintingPrice,
         doPaint
       );
       
       totalLaborVal += laborTotal;
       totalPaintingVal += paintingTotal;
    });

    const materialTotalVal = allMaterials.reduce((acc, m) => acc + (m.quantity * m.estimatedPrice), 0);
    const totalValue = materialTotalVal + totalLaborVal + totalPaintingVal;
    const downPayment = totalValue * 0.60;
    
    const projectTypeLabel = rooms.length === 1 ? rooms[0].type : `Múltiplos Ambientes (${rooms.length})`;

    const totalArea = rooms.reduce((acc, r) => {
       return acc + (r.type === ProjectType.CEILING ? r.dimensions.length * r.dimensions.width : r.dimensions.length * r.dimensions.height);
    }, 0);

    const hasPaintingAnywhere = calculatedRooms.some(r => r.type === ProjectType.PAINTING || r.includePainting);

    if (company) {
      const updatedCompany = {
        ...company,
        defaultLaborPrice: laborPrice,
        defaultPaintingPrice: paintingPrice,
        materialPrices: currentMaterialPrices
      };
      saveCompany(updatedCompany);
      if (onCompanyUpdate) onCompanyUpdate(updatedCompany);
    }

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      client,
      type: projectTypeLabel,
      rooms: calculatedRooms,
      dimensions: { length: totalArea, width: 0, height: 0 },
      includePainting: hasPaintingAnywhere,
      laborPrice,
      paintingPrice,
      materials: allMaterials,
      materialTotal: materialTotalVal,
      laborTotal: totalLaborVal,
      paintingTotal: totalPaintingVal,
      totalValue,
      downPayment,
      status: 'draft'
    };

    saveProject(newProject);
    onSave(newProject);
  };

  const updatePrice = (key: keyof MaterialPrices, val: string) => {
    const num = parseFloat(val.replace(',', '.')) || 0;
    setCurrentMaterialPrices(prev => ({ ...prev, [key]: num }));
  };

  const handleNextStep = () => {
    if (rooms.length === 0) {
      alert("Adicione pelo menos um ambiente antes de continuar.");
      return;
    }
    if (roomName || dimLength || dimWidth || dimHeight) {
      if (!window.confirm("Você preencheu dados de um ambiente mas não clicou em 'Adicionar à Lista'. Deseja continuar sem salvar este ambiente?")) {
        return;
      }
    }
    setStep(2);
  };

  const resetRoomInputs = () => {
    setDimLength('');
    setDimWidth('');
    setDimHeight('');
    setRoomIncludePainting(false);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
        <span className="text-sm font-bold text-slate-500">Passo {step} de 4</span>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Adicionar Ambientes (Máx. 30)</h2>
          
          {/* Room Entry Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome do Ambiente</label>
                <input 
                  type="text" 
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="Ex: Sala de Estar, Quarto 01..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>

             <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setRoomType(ProjectType.WALL); resetRoomInputs(); }}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    roomType === ProjectType.WALL ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-500'
                  }`}
                >
                  <ICONS.FileText className="w-5 h-5" />
                  <span className="font-bold text-xs">Parede</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setRoomType(ProjectType.CEILING); resetRoomInputs(); }}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    roomType === ProjectType.CEILING ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-500'
                  }`}
                >
                  <ICONS.Calculator className="w-5 h-5" />
                  <span className="font-bold text-xs">Forro</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setRoomType(ProjectType.PAINTING); resetRoomInputs(); }}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    roomType === ProjectType.PAINTING ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-500'
                  }`}
                >
                  <ICONS.Brush className="w-5 h-5" />
                  <span className="font-bold text-xs">Pintura</span>
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Comprimento (m)</label>
                  <input 
                    type="number"
                    step="0.01" 
                    value={dimLength} 
                    onChange={e => setDimLength(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                {roomType === ProjectType.CEILING ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Largura (m)</label>
                      <input 
                        type="number"
                        step="0.01" 
                        value={dimWidth} 
                        onChange={e => setDimWidth(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Rebaixamento (cm)</label>
                      <input 
                        type="number"
                        step="0.01" 
                        value={dimHeight} 
                        onChange={e => setDimHeight(e.target.value)}
                        placeholder="Ex: 15"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Altura (m)</label>
                    <input 
                      type="number"
                      step="0.01" 
                      value={dimHeight} 
                      onChange={e => setDimHeight(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                )}
              </div>
              
              {/* Per-Room Painting Toggle (Only for Drywall types) */}
              {roomType !== ProjectType.PAINTING && (
                <div 
                  onClick={() => setRoomIncludePainting(!roomIncludePainting)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${roomIncludePainting ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}
                >
                   <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${roomIncludePainting ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <ICONS.Brush className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-900">Incluir Pintura/Acabamento</p>
                       <p className="text-[10px] text-slate-500">Adicionar materiais e mão de obra de pintura para este ambiente.</p>
                     </div>
                   </div>
                   <div className={`w-12 h-6 rounded-full p-1 transition-colors ${roomIncludePainting ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${roomIncludePainting ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </div>
                </div>
              )}

              <button 
                 type="button"
                 onClick={handleAddRoom}
                 className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
              >
                 <ICONS.Plus className="w-4 h-4" />
                 Adicionar à Lista
              </button>
          </div>

          {/* Rooms List */}
          <div className="space-y-3">
             <div className="flex justify-between items-center px-2">
               <h3 className="font-bold text-slate-900">Ambientes ({rooms.length}/30)</h3>
               {rooms.length > 0 && <span className="text-xs text-blue-600 font-bold">Total estimado: {rooms.reduce((acc, r) => acc + (r.type === 'Forro' ? r.dimensions.length * r.dimensions.width : r.dimensions.length * r.dimensions.height), 0).toFixed(2)} m²</span>}
             </div>
             
             {rooms.length > 0 ? (
               <div className="bg-slate-50 rounded-2xl p-2 max-h-60 overflow-y-auto space-y-2">
                 {rooms.map((room, idx) => (
                   <div key={room.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{idx + 1}</div>
                         <div>
                            <p className="font-bold text-sm text-slate-900">{room.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                              {room.type} • {room.type === 'Forro' ? `${room.dimensions.length}x${room.dimensions.width}m` : `${room.dimensions.length}x${room.dimensions.height}m`}
                              {(room.includePainting || room.type === 'Pintura') && (
                                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px]">Pintura</span>
                              )}
                            </p>
                         </div>
                      </div>
                      <button onClick={() => removeRoom(room.id)} className="text-red-400 hover:text-red-600 p-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                  Nenhum ambiente adicionado ainda.
               </div>
             )}
          </div>

          <button 
            type="button"
            onClick={handleNextStep}
            className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            Próximo Passo
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Ajustar Preços Globais</h2>
          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-3 rounded-xl border border-orange-100">
             <ICONS.Settings className="w-4 h-4" />
             <p>As alterações feitas aqui serão salvas como <strong>padrão</strong> para futuros orçamentos.</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6 max-h-[60vh] overflow-y-auto">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Mão de Obra e Pintura</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Mão de Obra Drywall (R$/m²)</label>
                  <input 
                    type="number" 
                    value={laborPrice}
                    onChange={e => setLaborPrice(parseFloat(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Mão de Obra Pintura (R$/m²)</label>
                  <div className="flex items-center gap-2">
                     <input 
                      type="number" 
                      value={paintingPrice}
                      onChange={e => setPaintingPrice(parseFloat(e.target.value))}
                      className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none`}
                    />
                  </div>
                </div>
            </div>

            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest pt-4 border-t border-slate-50">Materiais Drywall</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <PriceInput label="Chapa (und)" val={currentMaterialPrices.sheet} onChange={(v) => updatePrice('sheet', v)} />
              <PriceInput label="Montante (und)" val={currentMaterialPrices.stud} onChange={(v) => updatePrice('stud', v)} />
              <PriceInput label="Guia (und)" val={currentMaterialPrices.track} onChange={(v) => updatePrice('track', v)} />
              <PriceInput label="Canaleta F530 (und)" val={currentMaterialPrices.f530} onChange={(v) => updatePrice('f530', v)} />
              <PriceInput label="Tabica/Cantoneira (und)" val={currentMaterialPrices.perimeter} onChange={(v) => updatePrice('perimeter', v)} />
              <PriceInput label="Massa Drywall (kg)" val={currentMaterialPrices.compound} onChange={(v) => updatePrice('compound', v)} />
            </div>
            
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest pt-4 border-t border-slate-50">Materiais de Pintura</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <PriceInput label="Tinta 18L" val={currentMaterialPrices.paint_18l} onChange={(v) => updatePrice('paint_18l', v)} />
              <PriceInput label="Massa Corrida 15kg" val={currentMaterialPrices.massa_15kg} onChange={(v) => updatePrice('massa_15kg', v)} />
              <PriceInput label="Lixa (folha)" val={currentMaterialPrices.sandpaper} onChange={(v) => updatePrice('sandpaper', v)} />
              <PriceInput label="Rolo Pintura" val={currentMaterialPrices.roller} onChange={(v) => updatePrice('roller', v)} />
              <PriceInput label="Pincel" val={currentMaterialPrices.brush} onChange={(v) => updatePrice('brush', v)} />
              <PriceInput label="Fita Larga" val={currentMaterialPrices.wide_tape} onChange={(v) => updatePrice('wide_tape', v)} />
              <PriceInput label="Lona (m)" val={currentMaterialPrices.canvas} onChange={(v) => updatePrice('canvas', v)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setStep(1)} className="w-full p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200">
              Voltar
            </button>
            <button onClick={() => setStep(3)} className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200">
              Próximo Passo
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Dados do Cliente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Nome Completo</label>
              <input 
                type="text" 
                value={client.name} 
                onChange={e => setClient({...client, name: e.target.value})}
                placeholder="Ex: João da Silva"
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="tel" 
                value={client.phone} 
                onChange={e => setClient({...client, phone: e.target.value})}
                placeholder="Telefone"
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input 
                type="email" 
                value={client.email} 
                onChange={e => setClient({...client, email: e.target.value})}
                placeholder="Email"
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <input 
              type="text" 
              value={client.address} 
              onChange={e => setClient({...client, address: e.target.value})}
              placeholder="Endereço da Obra"
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setStep(2)} className="w-full p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200">
              Voltar
            </button>
            <button 
              disabled={!client.name}
              onClick={() => setStep(4)}
              className="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-200"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 text-center py-8">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ICONS.Check className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Tudo Pronto!</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Configuramos o orçamento para {rooms.length} ambiente(s). Os materiais foram consolidados.
          </p>

          <div className="pt-6 space-y-4">
            <button 
              onClick={handleCalculate}
              className="w-full p-6 bg-blue-600 text-white rounded-3xl font-bold text-xl hover:bg-blue-700 shadow-2xl shadow-blue-300"
            >
              Gerar Orçamento
            </button>
            <button onClick={() => setStep(3)} className="text-slate-500 font-medium">Revisar Informações</button>
          </div>
        </div>
      )}
    </div>
  );
};

const PriceInput = ({ label, val, onChange }: { label: string, val: number, onChange: (v: string) => void }) => (
  <div>
    <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">R$</span>
      <input 
        type="number" 
        value={val} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 pl-7 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs font-bold text-slate-700"
      />
    </div>
  </div>
);

export default Calculator;
