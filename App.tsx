
import React, { useState, useEffect } from 'react';
import { Project, ProjectType, User, Company } from './types';
import { getUser, getProjects, getCompany } from './services/storage';
import { ICONS, TRIAL_DAYS } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import BudgetHistory from './components/BudgetHistory';
import CompanySettings from './components/CompanySettings';
import Subscription from './components/Subscription';
import BudgetView from './components/BudgetView';
import Gallery from './components/Gallery';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
    setCompany(getCompany());
  }, []);

  if (!currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Calculate Trial Status
  const getDaysUsed = () => {
    const now = Date.now();
    // Use installDate or fallback to now (for brand new users in memory)
    const install = currentUser.installDate || now;
    const diffTime = Math.abs(now - install);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  const daysUsed = getDaysUsed();
  const trialExpired = daysUsed > TRIAL_DAYS;
  const isLocked = !currentUser.subscriptionActive && trialExpired;

  // Basic "Mock" Authentication logic
  const handleLogin = (email: string) => {
    const user = { ...currentUser, email };
    setCurrentUser(user);
  };

  const renderContent = () => {
    if (selectedProject) {
      return (
        <BudgetView 
          project={selectedProject} 
          company={company!} 
          onBack={() => setSelectedProject(null)} 
        />
      );
    }

    // Force Subscription screen if locked
    if (isLocked && activeTab !== 'subscription') {
       return <Subscription onActivate={() => {
        const updated = { ...currentUser, subscriptionActive: true };
        setCurrentUser(updated);
        setActiveTab('dashboard');
      }} isLocked={true} daysUsed={daysUsed} />;
    }

    // If user clicks subscription tab manually
    if (activeTab === 'subscription') {
      return <Subscription onActivate={() => {
        const updated = { ...currentUser, subscriptionActive: true };
        setCurrentUser(updated);
        setActiveTab('dashboard');
      }} isLocked={isLocked} daysUsed={daysUsed} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard onNewProject={() => setActiveTab('calculator')} onOpenProject={setSelectedProject} />;
      case 'calculator': return <Calculator 
          onSave={(p) => { setSelectedProject(p); setActiveTab('history'); }} 
          onCompanyUpdate={(c) => setCompany(c)}
        />;
      case 'history': return <BudgetHistory onOpenProject={setSelectedProject} />;
      case 'gallery': return <Gallery />;
      case 'settings': return <CompanySettings company={company!} onSave={(c) => setCompany(c)} />;
      default: return <Dashboard onNewProject={() => setActiveTab('calculator')} onOpenProject={setSelectedProject} />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setSelectedProject(null); }}
      className={`flex flex-col items-center justify-center w-full py-2 text-xs font-medium transition-colors ${
        activeTab === id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon className="w-6 h-6 mb-1" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10 flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ArfaDrywall <span className="text-blue-600">Calcula</span></h1>
        </div>
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
        >
          <ICONS.User className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0 container mx-auto px-4 py-6 max-w-4xl">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-1 z-10 md:hidden no-print">
        <NavItem id="dashboard" icon={ICONS.Calculator} label="Início" />
        <NavItem id="calculator" icon={ICONS.Plus} label="Novo" />
        <NavItem id="history" icon={ICONS.History} label="Hist." />
        <NavItem id="gallery" icon={ICONS.Gallery} label="Catálogo" />
        {isLocked ? (
           <button onClick={() => setActiveTab('subscription')} className="flex flex-col items-center justify-center w-full py-2 text-xs font-medium text-red-500">
             <ICONS.Lock className="w-6 h-6 mb-1" />
             Bloqueado
           </button>
        ) : (
           <NavItem id="settings" icon={ICONS.Settings} label="Ajustes" />
        )}
      </nav>

      {/* Desktop Sidebar (hidden on mobile, visible on lg screens) */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col p-6 z-20 no-print">
         <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ArfaDrywall</h1>
        </div>
        <div className="space-y-2">
           <SidebarItem id="dashboard" icon={ICONS.Calculator} label="Painel de Controle" activeTab={activeTab} onClick={setActiveTab} />
           <SidebarItem id="calculator" icon={ICONS.Plus} label="Novo Cálculo" activeTab={activeTab} onClick={setActiveTab} />
           <SidebarItem id="history" icon={ICONS.History} label="Histórico de Obras" activeTab={activeTab} onClick={setActiveTab} />
           <SidebarItem id="gallery" icon={ICONS.Gallery} label="Catálogo Digital" activeTab={activeTab} onClick={setActiveTab} />
           <SidebarItem id="settings" icon={ICONS.Settings} label="Configurações" activeTab={activeTab} onClick={setActiveTab} />
           <SidebarItem id="subscription" icon={ICONS.FileText} label="Licença de Uso" activeTab={activeTab} onClick={setActiveTab} />
        </div>
        <div className="mt-auto pt-6 border-t border-slate-100">
           <div className={`p-3 rounded-xl ${currentUser.subscriptionActive ? 'bg-green-50' : (trialExpired ? 'bg-red-50' : 'bg-blue-50')}`}>
              <div className="flex items-center justify-between mb-1">
                 <p className={`text-xs font-semibold ${currentUser.subscriptionActive ? 'text-green-700' : (trialExpired ? 'text-red-700' : 'text-blue-700')}`}>
                   {currentUser.subscriptionActive ? 'Licença Vitalícia' : (trialExpired ? 'Período Expirado' : 'Período de Teste')}
                 </p>
                 {currentUser.subscriptionActive ? <ICONS.Check className="w-3 h-3 text-green-600"/> : <ICONS.Lock className="w-3 h-3 text-slate-400"/>}
              </div>
              
              {!currentUser.subscriptionActive && (
                 <div className="w-full bg-white/50 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className={`h-full ${trialExpired ? 'bg-red-500' : 'bg-blue-500'}`} 
                      style={{ width: `${Math.min((daysUsed / TRIAL_DAYS) * 100, 100)}%` }}
                    ></div>
                 </div>
              )}
              
              {!currentUser.subscriptionActive && (
                <p className="text-[10px] mt-1 opacity-70">
                  {trialExpired ? 'Contate o suporte' : `Dia ${daysUsed} de ${TRIAL_DAYS}`}
                </p>
              )}
           </div>
        </div>
      </aside>
    </div>
  );
};

const SidebarItem = ({ id, icon: Icon, label, activeTab, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium ${
      activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

export default App;
