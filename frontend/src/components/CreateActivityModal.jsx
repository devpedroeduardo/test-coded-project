import React from 'react';

const CreateActivityModal = ({ isOpen, onClose, novaAtiv, setNovaAtiv, handleCriarAtividade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h3 className="text-xl font-bold text-gray-800">Criar Nova Atividade</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleCriarAtividade} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título:</label>
            <input type="text" required placeholder="Ex: Prova de Matemática" value={novaAtiv.titulo} onChange={(e) => setNovaAtiv({...novaAtiv, titulo: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição:</label>
            <textarea required rows="3" placeholder="Instruções para os alunos..." value={novaAtiv.descricao} onChange={(e) => setNovaAtiv({...novaAtiv, descricao: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y"></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID da Turma:</label>
              <input type="number" required min="1" placeholder="Ex: 1" value={novaAtiv.turma} onChange={(e) => setNovaAtiv({...novaAtiv, turma: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega:</label>
              <input type="datetime-local" required value={novaAtiv.data_entrega} onChange={(e) => setNovaAtiv({...novaAtiv, data_entrega: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 border-dashed mt-2">
            <label className="block text-sm font-medium text-blue-800 mb-2">Material de Apoio (Opcional):</label>
            <input 
              type="file" 
              onChange={(e) => setNovaAtiv({...novaAtiv, arquivo: e.target.files[0]})}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-2">Anexe um PDF, documento ou imagem com as instruções detalhadas.</p>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Cancelar</button>
            <button type="submit" className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm">Publicar Atividade</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityModal;