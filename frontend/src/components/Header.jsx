import React from 'react';
import { useAuth } from '../context/AuthContext'; 

const Header = ({ titulo, extraActions }) => {
  const { user, logout } = useAuth(); 

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-4 px-8 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">{titulo}</h1>
      
      <div className="flex items-center gap-6">
        {extraActions}
        
        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
            {user?.username ? user.username.charAt(0) : 'U'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700">
              {user?.username || 'Usuário'}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {user?.role ? user.role.toLowerCase() : 'Plataforma Escolar'}
            </span>
          </div>
          
          <button onClick={logout} className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors" title="Sair">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;