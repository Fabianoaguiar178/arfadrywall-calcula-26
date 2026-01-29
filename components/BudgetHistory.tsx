
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { getProjects } from '../services/storage';
import { ICONS } from '../constants';

interface BudgetHistoryProps {
  onOpenProject: (p: Project) => void;
}

const BudgetHistory: React.FC<BudgetHistoryProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setProjects(getProjects().reverse());
  }, []);

  const filtered = projects.filter(p => 
    p.client.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Histórico de Projetos</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por cliente..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((project) => (
            <button
              key={project.id}
              onClick={() => onOpenProject(project)}
              className="group text-left p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  project.type === 'Parede' ? 'bg-orange-100 text-orange-600' : 'bg-cyan-100 text-cyan-600'
                }`}>
                  {project.type}
                </div>
                <span className="text-xs text-slate-400 font-medium">{project.date}</span>
              </div>
              
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{project.client.name}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-1">{project.client.address}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Valor Total</p>
                  <p className="font-bold text-slate-900">R$ {project.totalValue.toFixed(2)}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
           <ICONS.History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500">Nenhum projeto encontrado</p>
        </div>
      )}
    </div>
  );
};

export default BudgetHistory;
