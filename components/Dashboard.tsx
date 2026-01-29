
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { getProjects } from '../services/storage';
import { ICONS } from '../constants';

interface DashboardProps {
  onNewProject: () => void;
  onOpenProject: (p: Project) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewProject, onOpenProject }) => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  useEffect(() => {
    const all = getProjects();
    setRecentProjects(all.slice(-3).reverse());
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Olá, Arfa Pro!</h2>
            <p className="text-slate-500">O que vamos calcular hoje?</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={onNewProject}
            className="flex items-center gap-4 p-6 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <ICONS.Plus className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg leading-tight">Novo Orçamento</h3>
              <p className="text-blue-100 text-sm">Cálculo instantâneo de materiais</p>
            </div>
          </button>
          
          <div className="flex items-center gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
              <ICONS.History className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg text-slate-900 leading-tight">Projetos Ativos</h3>
              <p className="text-slate-500 text-sm">{getProjects().length} orçamentos salvos</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Orçamentos Recentes</h3>
        {recentProjects.length > 0 ? (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => onOpenProject(project)}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-300 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    project.type === 'Parede' ? 'bg-orange-50 text-orange-600' : 'bg-cyan-50 text-cyan-600'
                  }`}>
                    <ICONS.FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">{project.client.name}</p>
                    <p className="text-xs text-slate-500">{project.type} • {project.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">R$ {project.totalValue.toFixed(2)}</p>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Ver Detalhes</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 mb-2">Nenhum orçamento recente</p>
            <button onClick={onNewProject} className="text-blue-600 font-bold">Comece agora</button>
          </div>
        )}
      </section>

      <section className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">Dica do Especialista</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            Sempre considere 10% a mais de material para recortes e desperdício em ambientes com muitos ângulos.
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">DRYWALL</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">PRO</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
      </section>
    </div>
  );
};

export default Dashboard;
