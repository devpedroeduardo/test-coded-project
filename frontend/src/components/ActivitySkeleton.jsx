import React from 'react';

const ActivitySkeleton = () => {
  return (
    // Imitamos a estrutura exata do container do ActivityCard original
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Skeleton do Título (Mais largo e alto) */}
        <div className="h-7 bg-gray-200 rounded-md w-3/4 mb-4 animate-pulse"></div>
        
        {/* Skeletons da Descrição (Três linhas com larguras variadas) */}
        <div className="space-y-2.5 mb-8 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      {/* Skeleton do Rodapé (Borda superior, data e botão) */}
      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 animate-pulse">
        {/* Skeleton da Data */}
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        {/* Skeleton do Botão (Altura total e fundo cinza mais escuro) */}
        <div className="w-full h-10 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
};

export default ActivitySkeleton;