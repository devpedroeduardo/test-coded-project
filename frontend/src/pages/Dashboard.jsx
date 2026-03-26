import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import CreateActivityModal from '../components/CreateActivityModal';
import ActivitySkeleton from '../components/ActivitySkeleton';

const Dashboard = () => {
  const { logout } = useAuth();
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para o Modal de Criação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaAtiv, setNovaAtiv] = useState({ titulo: '', descricao: '', turma: '', data_entrega: '' });

  const carregarAtividades = async () => {
    try {
      const response = await api.get('/me/atividades/');
      setAtividades(response.data);
    } catch (error) {
      console.error("Erro ao buscar atividades", error);
      if (error.response && error.response.status === 401) {
          logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAtividades();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCriarAtividade = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atividades/', {
        ...novaAtiv,
        turma: parseInt(novaAtiv.turma) // Garante que vá como número para o Django
      });
      
      alert('Atividade criada com sucesso!');
      setIsModalOpen(false); // Fecha o modal
      setNovaAtiv({ titulo: '', descricao: '', turma: '', data_entrega: '' }); // Limpa o form
      carregarAtividades(); // Atualiza a lista
      
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert("Acesso Negado: Apenas PROFESSORES podem criar atividades.");
      } else {
        console.error(error);
        alert("Erro ao criar atividade. Verifique os dados.");
      }
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Minhas Atividades</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors shadow-sm"
          >
            + Nova Atividade
          </button>
          <button 
            onClick={logout} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors shadow-sm"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
  {loading ? (
    // Enquanto carrega, mostramos um grid com 3 skeletons pulsando
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ActivitySkeleton />
      <ActivitySkeleton />
      <ActivitySkeleton />
    </div>
  ) : atividades.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-lg">Nenhuma atividade encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {atividades.map((ativ) => (
              <ActivityCard 
                key={ativ.id} 
                atividade={ativ} 
                formatarData={formatarData} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Renderiza o componente do Modal apenas quando isModalOpen for true */}
      <CreateActivityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        novaAtiv={novaAtiv} 
        setNovaAtiv={setNovaAtiv} 
        handleCriarAtividade={handleCriarAtividade} 
      />
    </div>
  );
};

export default Dashboard;