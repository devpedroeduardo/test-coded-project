import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityCard = ({ atividade, formatarData }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{atividade.titulo}</h3>
        <p className="text-gray-600 text-sm mb-6">{atividade.descricao}</p>
      </div>
      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4">
        <span className="text-sm text-gray-500 font-medium">
          📅 Entrega: {formatarData(atividade.data_entrega)}
        </span>
        <button
          onClick={() => navigate(`/atividade/${atividade.id}`)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
        >
          Acessar Atividade
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;