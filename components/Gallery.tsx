
import React, { useState, useEffect } from 'react';
import { GalleryItem, Company } from '../types';
import { getGallery, addToGallery, removeFromGallery, getCompany } from '../services/storage';
import { ICONS } from '../constants';

const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  
  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'image' | 'video'>('image');
  const [newUrl, setNewUrl] = useState(''); // Stores Base64 for img or URL for video
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setItems(getGallery());
    setCompany(getCompany());
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation for size (limit to ~2MB to respect localStorage)
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Por favor, use imagens menores que 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!newTitle || !newUrl) {
      alert("Adicione um título e uma imagem/link.");
      return;
    }

    const item: GalleryItem = {
      id: `item_${Date.now()}`,
      title: newTitle,
      description: newDesc,
      type: newType,
      url: newUrl,
      date: Date.now()
    };

    addToGallery(item);
    setItems(getGallery()); // Refresh
    
    // Reset
    setIsAdding(false);
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setNewType('image');
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este item?")) {
      removeFromGallery(id);
      setItems(getGallery());
    }
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const element = document.getElementById('printable-catalog');
    
    const filename = `Catalogo_${company?.name.replace(/\s+/g, '_') || 'Arfa'}.pdf`;

    const opt = {
      margin: 5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: false, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsGenerating(false);
      });
    } else {
      alert("Erro ao gerar PDF.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Catálogo Digital</h2>
           <p className="text-slate-500 text-sm">Organize suas obras e compartilhe com clientes.</p>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => setIsAdding(!isAdding)}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-lg transition-all ${isAdding ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
           >
             {isAdding ? 'Cancelar' : (
               <>
                 <ICONS.Plus className="w-4 h-4" />
                 Adicionar Item
               </>
             )}
           </button>
           
           {items.length > 0 && (
             <button 
               onClick={handleDownloadPDF}
               disabled={isGenerating}
               className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all"
             >
               {isGenerating ? 'Gerando...' : (
                 <>
                   <ICONS.FileText className="w-4 h-4" />
                   Baixar PDF
                 </>
               )}
             </button>
           )}
        </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border border-blue-200 shadow-lg mb-6 no-print">
           <h3 className="font-bold text-slate-900 mb-4">Novo Item do Catálogo</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Tipo de Mídia</label>
                <div className="flex gap-2 mb-4">
                  <button 
                    onClick={() => { setNewType('image'); setNewUrl(''); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border ${newType === 'image' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-slate-200 text-slate-500'}`}
                  >
                    Foto / Imagem
                  </button>
                  <button 
                    onClick={() => { setNewType('video'); setNewUrl(''); }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border ${newType === 'video' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-slate-200 text-slate-500'}`}
                  >
                    Link de Vídeo
                  </button>
                </div>

                {newType === 'image' ? (
                   <div className="mb-4">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Foto da Obra</label>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                   </div>
                ) : (
                   <div className="mb-4">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Link do Vídeo (Youtube/Vimeo)</label>
                      <input type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs"/>
                      <p className="text-[9px] text-slate-400 mt-1">Cole o link completo do vídeo.</p>
                   </div>
                )}
              </div>

              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Título</label>
                    <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex: Forro Sala de Estar" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"/>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Descrição (Opcional)</label>
                    <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} placeholder="Detalhes sobre a obra..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"></textarea>
                 </div>
              </div>
           </div>
           
           <div className="mt-4 flex justify-end">
              <button onClick={handleAddItem} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">Salvar Item</button>
           </div>
        </div>
      )}

      {/* Display Grid (Interactive) */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 no-print">
           <ICONS.Gallery className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-medium">Seu catálogo está vazio.</p>
           <p className="text-xs text-slate-400">Adicione fotos e vídeos das suas obras para compartilhar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
           {items.map(item => (
             <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                   {item.type === 'image' ? (
                     <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-4 text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-2">
                           <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <p className="text-xs truncate w-full px-4">{item.url}</p>
                     </div>
                   )}
                   <button 
                     onClick={() => handleDelete(item.id)}
                     className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                   </button>
                </div>
                <div className="p-4">
                   <div className="flex justify-between items-start">
                     <h4 className="font-bold text-slate-900">{item.title}</h4>
                     <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase">{item.type}</span>
                   </div>
                   {item.description && <p className="text-sm text-slate-500 mt-2 line-clamp-2">{item.description}</p>}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Hidden Printable Area - Moved off-screen instead of hidden for html2canvas compatibility */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
         <div id="printable-catalog" className="bg-white p-8 w-[210mm]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
               <div className="flex items-center gap-4">
                  {company?.logo ? (
                    <img src={company.logo} className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                       {company?.name[0]}
                    </div>
                  )}
                  <div>
                     <h1 className="text-2xl font-black text-slate-900 uppercase">Catálogo de Obras</h1>
                     <p className="text-slate-500 font-bold">{company?.name}</p>
                  </div>
               </div>
               <div className="text-right text-xs text-slate-500">
                  <p>{company?.phone}</p>
                  <p>{company?.email}</p>
               </div>
            </div>

            {/* Grid for PDF */}
            <div className="grid grid-cols-2 gap-6">
               {items.map(item => (
                 <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden break-inside-avoid">
                    <div className="h-64 bg-slate-50 relative">
                       {item.type === 'image' ? (
                          <img src={item.url} className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center border-b border-slate-100">
                             <p className="text-sm font-bold uppercase mb-2">Vídeo Disponível</p>
                             <p className="text-xs break-all text-blue-600 underline">{item.url}</p>
                          </div>
                       )}
                    </div>
                    <div className="p-4 bg-white">
                       <h4 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h4>
                       <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-12 pt-6 border-t border-slate-200 text-center">
               <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                  Catálogo gerado via ArfaDrywall Calcula Professional
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Gallery;
