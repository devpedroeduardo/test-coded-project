import React from 'react';

const CreateActivityModal = ({ isOpen, onClose, novaAtiv, setNovaAtiv, handleCriarAtividade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Criar Nova Atividade</h3>
        <form onSubmit={handleCriarAtividade} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título:</label>
            <input type="text" required value={novaAtiv.titulo} onChange={(e) => setNovaAtiv({...novaAtiv, titulo: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição:</label>
            <textarea required rows="3" value={novaAtiv.descricao} onChange={(e) => setNovaAtiv({...novaAtiv, descricao: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID da Turma:</label>
            <input type="number" required placeholder="Ex: 1" value={novaAtiv.turma} onChange={(e) => setNovaAtiv({...novaAtiv, turma: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega:</label>
            <input type="datetime-local" required value={novaAtiv.data_entrega} onChange={(e) => setNovaAtiv({...novaAtiv, data_entrega: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors">Salvar Atividade</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityModal;