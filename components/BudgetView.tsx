
import React, { useState } from 'react';
import { Project, Company } from '../types';
import { ICONS } from '../constants';

interface BudgetViewProps {
  project: Project;
  company: Company;
  onBack: () => void;
}

const BudgetView: React.FC<BudgetViewProps> = ({ project, company, onBack }) => {
  const [viewMode, setViewMode] = useState<'budget' | 'quantities'>('budget');
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const element = document.getElementById('printable-budget');
    
    // Define filename based on view mode
    const typeLabel = viewMode === 'budget' ? 'Orcamento' : 'Lista_Materiais';
    const clientName = project.client.name.replace(/\s+/g, '_').substring(0, 15);
    const filename = `Arfa_${typeLabel}_${clientName}.pdf`;

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
      alert("Erro ao carregar biblioteca de PDF. Tente imprimir como PDF.");
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = () => {
    const area = project.type === 'Forro' 
      ? project.dimensions.length * project.dimensions.width 
      : project.dimensions.length * project.dimensions.height;

    const message = `*Orçamento: ${company.name}*
    
Olá, *${project.client.name}*! Segue o resumo do seu orçamento:

📌 *Serviço:* ${project.type}
📏 *Ambientes:* ${project.rooms ? project.rooms.length : 1}
🎨 *Pintura:* ${project.includePainting || project.type === 'Pintura' ? 'Incluso' : 'Não incluso'}

💰 *Investimento Total:* R$ ${project.totalValue.toFixed(2)}
💳 *Entrada (Materiais - 60%):* R$ ${project.downPayment.toFixed(2)}
📉 *Saldo Final (40%):* R$ ${(project.totalValue - project.downPayment).toFixed(2)}

⏳ *Validade:* 10 dias (${getValidityDate()})

_Para visualizar o documento completo em PDF, por favor, me solicite o arquivo gerado._`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${project.client.phone.replace(/\D/g, '')}&text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  // Legacy support for area calculation if rooms not present
  const area = project.rooms 
    ? project.rooms.reduce((acc, r) => acc + (r.type === 'Forro' ? r.dimensions.length * r.dimensions.width : r.dimensions.length * r.dimensions.height), 0)
    : (project.type === 'Forro' 
        ? project.dimensions.length * project.dimensions.width 
        : project.dimensions.length * project.dimensions.height);

  // Calculate the validity date (10 days from project date or current date)
  function getValidityDate() {
    const parts = project.date.split('/');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      date.setDate(date.getDate() + 10);
      return date.toLocaleDateString('pt-BR');
    }
    return '10 dias após emissão';
  }

  const drywallMaterials = project.materials.filter(m => !m.category || m.category === 'Drywall');
  const paintingMaterials = project.materials.filter(m => m.category === 'Pintura');

  const totalDrywallMat = drywallMaterials.reduce((acc, m) => acc + (m.quantity * m.estimatedPrice), 0);
  const totalPaintingMat = paintingMaterials.reduce((acc, m) => acc + (m.quantity * m.estimatedPrice), 0);

  // For Client Budget View: Combine Labor + Materials per category
  const totalDrywallCombined = project.laborTotal + totalDrywallMat;
  const totalPaintingCombined = project.paintingTotal + totalPaintingMat;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 self-start">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Voltar
        </button>
        
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
          <button 
            onClick={() => setViewMode('budget')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'budget' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
          >
            Orçamento (Cliente)
          </button>
          <button 
            onClick={() => setViewMode('quantities')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'quantities' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
          >
            Quantitativos
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.63 1.438h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            <span className="hidden md:inline">WhatsApp</span>
          </button>
          
          <button 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-lg text-white transition-all ${isGenerating ? 'bg-slate-400' : 'bg-red-600 hover:bg-red-700'}`}
          >
             {isGenerating ? (
               <span className="animate-pulse">Gerando...</span>
             ) : (
               <>
                 <ICONS.FileText className="w-4 h-4" />
                 Baixar PDF
               </>
             )}
          </button>
        </div>
      </div>

      {/* Main Document */}
      <div id="printable-budget" className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8 mb-8">
          <div className="flex items-center gap-4">
             {company.logo ? (
                <img src={company.logo} alt="Logo" className="w-16 h-16 object-contain" />
             ) : (
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  {company.name[0]}
                </div>
             )}
             <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{company.name}</h3>
                <p className="text-xs text-slate-400 font-bold">CNPJ: {company.cnpj} | {company.phone}</p>
                <p className="text-[10px] text-slate-400 font-medium">{company.email}</p>
             </div>
          </div>
          <div className="text-left md:text-right">
             <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">
               {viewMode === 'budget' ? 'Orçamento de Serviço' : 'Lista de Materiais'}
             </h4>
             <p className="font-black text-xl text-slate-900">Nº {project.id.split('_')[1]}</p>
             <p className="text-slate-500 text-xs font-bold">Data de Emissão: {project.date}</p>
          </div>
        </div>

        {/* Client & Project Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Cliente / Destinatário</h5>
            <p className="font-bold text-slate-900 leading-tight">{project.client.name}</p>
            <p className="text-xs text-slate-500 mt-1">{project.client.address}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{project.client.phone}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Descrição da Obra</h5>
            <p className="text-xs text-slate-700 font-bold uppercase">
              {project.type}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Área Total Estimada: <span className="text-slate-900 font-bold">{area.toFixed(2)} m²</span>
            </p>
            {project.rooms && project.rooms.length > 0 && (
               <p className="text-xs text-slate-500 mt-1">
                 Qtd. Ambientes: <span className="text-slate-900 font-bold">{project.rooms.length}</span>
               </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Serviço de Pintura: <span className="text-slate-900 font-bold">{project.includePainting || project.type === 'Pintura' ? 'Incluso' : 'Não incluso'}</span>
            </p>
          </div>
        </div>

        {/* Room Detail Table (New Section) */}
        {project.rooms && project.rooms.length > 0 && viewMode === 'budget' && (
           <div className="mb-8">
             <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Detalhamento por Ambiente</h5>
             <div className="overflow-hidden rounded-2xl border border-slate-100">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest">
                   <tr>
                     <th className="px-6 py-3">Ambiente</th>
                     <th className="px-6 py-3">Serviço</th>
                     <th className="px-6 py-3">Dimensões</th>
                     <th className="px-6 py-3 text-right">Pintura</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 text-xs">
                    {project.rooms.map((room, idx) => (
                      <tr key={idx}>
                         <td className="px-6 py-3 font-bold text-slate-700">{room.name}</td>
                         <td className="px-6 py-3 text-slate-500">{room.type}</td>
                         <td className="px-6 py-3 text-slate-500">
                           {room.type === 'Forro' ? `${room.dimensions.length}x${room.dimensions.width}m` : `${room.dimensions.length}x${room.dimensions.height}m`}
                           {room.type === 'Forro' && room.dimensions.height > 0 && ` (Rebaixo ${room.dimensions.height}cm)`}
                         </td>
                         <td className="px-6 py-3 text-right">
                           {(room.includePainting || room.type === 'Pintura') ? (
                             <span className="text-blue-600 font-bold">Sim</span>
                           ) : (
                             <span className="text-slate-300">Não</span>
                           )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {viewMode === 'budget' ? (
          <>
            {/* Opaque Item Description (Total Cost per Category) */}
            <div className="mb-8">
              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Descrição dos Serviços e Fornecimento</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {project.type !== 'Pintura' && (
                      <tr>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">Fornecimento de Materiais e Instalação de Sistema Drywall</p>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                            Incluso todos os perfis, chapas, arames, parafusos, fitas e massas necessários para a correta execução seguindo normas técnicas.
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900 align-top">
                          R$ {totalDrywallCombined.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {(project.includePainting || project.type === 'Pintura' || project.rooms?.some(r => r.type === 'Pintura' || r.includePainting)) && (
                      <tr>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">Mão de Obra e Materiais para Pintura / Acabamento</p>
                          <p className="text-[10px] text-slate-400 mt-1">Preparação de superfície, aplicação de massa corrida, lixamento e pintura acrílica.</p>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900 align-top">
                          R$ {totalPaintingCombined.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total do Investimento</p>
                 <p className="text-4xl font-black text-slate-900 tracking-tighter">R$ {project.totalValue.toFixed(2)}</p>
               </div>
               <div className="text-right">
                 <p className="text-xs font-bold text-slate-500">Validade do Orçamento:</p>
                 <p className="text-sm font-black text-blue-600">10 dias ({getValidityDate()})</p>
               </div>
            </div>

            {/* Down Payment Section (Emphasized as Materials) */}
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 mb-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest mb-1 opacity-90">Entrada para Aquisição de Materiais (60%)</h5>
                  <p className="text-4xl font-black">R$ {project.downPayment.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20 max-w-xs">
                  <p className="text-[10px] font-bold leading-relaxed">
                    Este valor de entrada é destinado exclusivamente para a logística e compra antecipada de todos os materiais listados para a sua obra.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20 flex flex-col md:flex-row justify-between text-xs font-bold">
                 <span>Saldo Final (40%): R$ {(project.totalValue - project.downPayment).toFixed(2)}</span>
                 <span className="opacity-75">Pagamento do saldo no ato da entrega dos serviços</span>
              </div>
            </div>
          </>
        ) : (
          /* Quantities Mode */
          <div className="overflow-hidden rounded-2xl border border-slate-100 mb-8">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Insumo / Material</th>
                  <th className="px-6 py-4 text-center">Quantidade</th>
                  <th className="px-6 py-4 text-center">Unidade</th>
                  <th className="px-6 py-4 text-right">Preço Unit.</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* Drywall Section */}
                {drywallMaterials.length > 0 && (
                  <>
                    <tr className="bg-slate-100"><td colSpan={5} className="px-6 py-2 text-xs font-black uppercase text-slate-500 tracking-wider">Estrutura & Drywall</td></tr>
                    {drywallMaterials.map((m, idx) => (
                      <tr key={`dw-${idx}`} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-900 text-sm">{m.name}</td>
                        <td className="px-6 py-3 text-center font-black text-blue-600 text-base">{m.quantity}</td>
                        <td className="px-6 py-3 text-center text-slate-500 font-bold uppercase text-[10px]">{m.unit}</td>
                        <td className="px-6 py-3 text-right text-slate-500 font-medium text-xs">R$ {m.estimatedPrice.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-700 text-sm">R$ {(m.quantity * m.estimatedPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </>
                )}

                {/* Painting Section */}
                {paintingMaterials.length > 0 && (
                  <>
                    <tr className="bg-slate-100"><td colSpan={5} className="px-6 py-2 text-xs font-black uppercase text-slate-500 tracking-wider">Pintura & Acabamento</td></tr>
                    {paintingMaterials.map((m, idx) => (
                      <tr key={`pt-${idx}`} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-bold text-slate-900 text-sm">{m.name}</td>
                        <td className="px-6 py-3 text-center font-black text-blue-600 text-base">{m.quantity}</td>
                        <td className="px-6 py-3 text-center text-slate-500 font-bold uppercase text-[10px]">{m.unit}</td>
                        <td className="px-6 py-3 text-right text-slate-500 font-medium text-xs">R$ {m.estimatedPrice.toFixed(2)}</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-700 text-sm">R$ {(m.quantity * m.estimatedPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                   <td colSpan={5} className="px-6 py-6">
                      <div className="flex flex-col items-end gap-3">
                         {/* Drywall Summary */}
                         {project.type !== 'Pintura' && (
                           <>
                              <div className="w-full md:w-1/2 flex justify-between items-center text-slate-500">
                                <span className="text-xs font-bold uppercase">Materiais Drywall</span>
                                <span className="font-bold text-slate-700">R$ {totalDrywallMat.toFixed(2)}</span>
                              </div>
                              <div className="w-full md:w-1/2 flex justify-between items-center text-slate-500">
                                <span className="text-xs font-bold uppercase">Mão de Obra Drywall</span>
                                <span className="font-bold text-slate-700">R$ {project.laborTotal.toFixed(2)}</span>
                              </div>
                           </>
                         )}

                         {/* Painting Summary */}
                         {(project.includePainting || project.type === 'Pintura' || project.rooms?.some(r => r.type === 'Pintura' || r.includePainting)) && (
                           <>
                              <div className="w-full md:w-1/2 flex justify-between items-center text-slate-500 border-t border-slate-100 pt-2 mt-2">
                                <span className="text-xs font-bold uppercase">Materiais Pintura</span>
                                <span className="font-bold text-slate-700">R$ {totalPaintingMat.toFixed(2)}</span>
                              </div>
                              <div className="w-full md:w-1/2 flex justify-between items-center text-slate-500">
                                <span className="text-xs font-bold uppercase">Mão de Obra Pintura</span>
                                <span className="font-bold text-slate-700">R$ {project.paintingTotal.toFixed(2)}</span>
                              </div>
                           </>
                         )}

                         <div className="w-full md:w-1/2 border-t-2 border-slate-900 pt-3 mt-2 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900 uppercase">Custo Total (Obra Completa)</span>
                            <span className="text-xl font-black text-blue-600">R$ {project.totalValue.toFixed(2)}</span>
                         </div>
                      </div>
                   </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Terms and Signatures */}
        <div className="pt-8 border-t border-slate-100">
           {/* Added Terms Grid */}
           <div className="mb-12 bg-slate-50 p-6 rounded-2xl">
              <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Termos e Condições de Serviço</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] text-slate-500 font-medium leading-relaxed text-justify">
                 <div className="space-y-2">
                    <p>• <strong>Validade:</strong> Este orçamento é válido por 10 dias corridos a partir da data de emissão ({project.date}).</p>
                    <p>• <strong>Pagamento:</strong> O início dos trabalhos e a compra de materiais estão condicionados à confirmação do pagamento da entrada.</p>
                    <p>• <strong>Armazenamento:</strong> É responsabilidade do contratante disponibilizar local seco, seguro e de fácil acesso para a estocagem dos materiais.</p>
                 </div>
                 <div className="space-y-2">
                    <p>• <strong>Garantia de Quantitativos:</strong> A prestadora garante que não haverá falta de materiais para a execução do escopo contratado.</p>
                    <p>• <strong>Sobras de Material:</strong> Todo material excedente (sobras) permanece sendo de propriedade da prestadora de serviços.</p>
                    <p>• <strong>Limpeza e Organização:</strong> Todo entulho gerado pela instalação será retirado pela prestadora. A obra será entregue limpa e organizada.</p>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col md:flex-row justify-around gap-12 mt-8">
              <div className="flex flex-col items-center">
                 <div className="w-64 border-b-2 border-slate-900 mb-2"></div>
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{company.name}</p>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">CONTRATADA (ASSINATURA E CARIMBO)</p>
              </div>
              <div className="flex flex-col items-center">
                 <div className="w-64 border-b-2 border-slate-900 mb-2"></div>
                 <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{project.client.name}</p>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">CONTRATANTE (CIENTE E ACORDO)</p>
              </div>
           </div>
           
           <p className="text-center mt-12 text-[9px] text-slate-300 font-bold uppercase tracking-widest">
             Documento emitido via ArfaDrywall Calcula Professional • Versão Cliente
           </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetView;
