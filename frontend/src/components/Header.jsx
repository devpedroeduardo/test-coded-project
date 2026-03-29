import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ titulo, extraActions }) => {
  const navigate = useNavigate();
  const { logout, auth } = useAuth();

  //Pega as iniciais do usuário (ex: admin -> A, prof_pedro -> PP)
  const getIniciais = () => {
    if (!auth || !auth.username) return 'U';
    const partes = auth.username.split(/[._-]/); // Separa por ponto, underline ou traço
    if (partes.length > 1) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return auth.username.substring(0, 2).toUpperCase();
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Se não for o Dashboard, mostra o botão voltar */}
        {window.location.pathname !== '/dashboard' && (
           <button 
             onClick={() => navigate('/dashboard')} 
             className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
             title="Voltar para o Dashboard"
           >
             ←
           </button>
        )}
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{titulo}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Espaço para botões específicos da tela (ex: + Nova Atividade) */}
        {extraActions && (
          <div className="flex gap-3">
            {extraActions}
          </div>
        )}

        {/* Perfil do Usuário e Logout */}
        <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
          <div className="flex items-center gap-2">
            {/* Avatar com iniciais */}
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
              <span className="font-bold text-blue-700 text-sm">
                {getIniciais()}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-semibold text-gray-800">
                {auth?.username || 'Usuário'}
              </span>
              <span className="block text-xs text-gray-500">
                Plataforma Escolar
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout} 
            className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
            title="Sair do sistema"
          >
            {/* Ícone de Sair (Porta) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;