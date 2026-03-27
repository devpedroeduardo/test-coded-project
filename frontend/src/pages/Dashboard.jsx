import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ActivityCard from '../components/ActivityCard';
import CreateActivityModal from '../components/CreateActivityModal';
import ActivitySkeleton from '../components/ActivitySkeleton';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext'; // Importante se a API der 401

const Dashboard = () => {
  const { logout } = useAuth();
  const [atividades, setAtividades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [temProxima, setTemProxima] = useState(false);
  const [temAnterior, setTemAnterior] = useState(false);

  // Estados de Filtros
  const [isAluno, setIsAluno] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [filtro, setFiltro] = useState('todas'); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaAtiv, setNovaAtiv] = useState({ titulo: '', descricao: '', turma: '', data_entrega: '' });

  const carregarAtividades = async (pagina = 1) => {
    setLoading(true);
    try {
      // Busca as atividades paginadas
      const responseAtiv = await api.get(`/me/atividades/?page=${pagina}`);
      setAtividades(responseAtiv.data.results);
      
      // Atualiza os controles de página para o ESLint não reclamar!
      setTemProxima(responseAtiv.data.next !== null);
      setTemAnterior(responseAtiv.data.previous !== null);
      setPaginaAtual(pagina);

      // Tenta buscar as respostas
      try {
        const responseResp = await api.get('/me/respostas/');
        setRespostas(responseResp.data);
        setIsAluno(true); 
      } catch (err) {
        console.log("Acesso às respostas foi negado, assumindo que é professor.", err);
        setIsAluno(false); 
      }

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
    carregarAtividades(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCriarAtividade = async (e) => {
    e.preventDefault();
    try {
      await api.post('/atividades/', {
        ...novaAtiv,
        turma: parseInt(novaAtiv.turma)
      });
      
      toast.success('Atividade criada com sucesso!');
      setIsModalOpen(false);
      setNovaAtiv({ titulo: '', descricao: '', turma: '', data_entrega: '' });
      carregarAtividades(1); // Volta para a primeira página
      
    } catch (error) {
      if (error.response && error.response.status === 403) {
        toast.error("Acesso Negado: Apenas PROFESSORES podem criar atividades.");
      } else {
        console.error(error);
        toast.error("Erro ao criar atividade. Verifique os dados.");
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

  const atividadesFiltradas = atividades.filter(ativ => {
    if (!isAluno || filtro === 'todas') return true;
    const respondeu = respostas.find(r => r.atividade === ativ.id);
    if (filtro === 'pendentes') return !respondeu; 
    if (filtro === 'concluidas') return respondeu;  
    return true;
  });

  const acoesExtras = (
    <button 
      onClick={() => setIsModalOpen(true)} 
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors shadow-sm flex items-center gap-2"
    >
      <span className="text-lg">+</span> Nova Atividade
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header titulo="Minhas Atividades" extraActions={acoesExtras} />

      <main className="p-8 max-w-7xl mx-auto">
        {isAluno && !loading && (
          <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
            <button 
              onClick={() => setFiltro('todas')} 
              className={`px-4 py-2 rounded-md font-medium transition-colors ${filtro === 'todas' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Todas
            </button>
            <button 
              onClick={() => setFiltro('pendentes')} 
              className={`px-4 py-2 rounded-md font-medium transition-colors ${filtro === 'pendentes' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Pendentes
            </button>
            <button 
              onClick={() => setFiltro('concluidas')} 
              className={`px-4 py-2 rounded-md font-medium transition-colors ${filtro === 'concluidas' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Concluídas
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </div>
        ) : atividadesFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-lg">
              {filtro === 'todas' ? 'Nenhuma atividade encontrada.' : `Você não tem atividades ${filtro}.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {atividadesFiltradas.map((ativ) => (
              <ActivityCard 
                key={ativ.id} 
                atividade={ativ} 
                formatarData={formatarData} 
              />
            ))}
          </div>
        )}

        {/* --- OS BOTÕES DE PAGINAÇÃO QUE ESTAVAM FALTANDO! --- */}
        {!loading && (temAnterior || temProxima) && (
          <div className="flex justify-center items-center gap-4 mt-12 border-t border-gray-200 pt-8">
            <button
              onClick={() => carregarAtividades(paginaAtual - 1)}
              disabled={!temAnterior}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${temAnterior ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              ← Anterior
            </button>
            <span className="text-gray-600 font-medium">
              Página {paginaAtual}
            </span>
            <button
              onClick={() => carregarAtividades(paginaAtual + 1)}
              disabled={!temProxima}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${temProxima ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Próxima →
            </button>
          </div>
        )}
      </main>

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