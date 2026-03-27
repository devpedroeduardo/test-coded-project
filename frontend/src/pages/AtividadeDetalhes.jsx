// eslint-disable-next-line react-refresh/only-export-components
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const AtividadeDetalhes = () => {
  const { id } = useParams();
  
  const [isProfessor, setIsProfessor] = useState(false);
  const [respostas, setRespostas] = useState([]);
  const [minhaResposta, setMinhaResposta] = useState(null);
  
  const [textoResposta, setTextoResposta] = useState('');
  const [notas, setNotas] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  const carregarDados = async () => {
    try {
      const res = await api.get(`/atividades/${id}/respostas/`);
      setIsProfessor(true);
      setRespostas(res.data);
      
      const notasIniciais = {};
      const feedbacksIniciais = {};
      res.data.forEach(r => {
        notasIniciais[r.id] = r.nota || '';
        feedbacksIniciais[r.id] = r.feedback || '';
      });
      setNotas(notasIniciais);
      setFeedbacks(feedbacksIniciais);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setIsProfessor(false);
        const resAluno = await api.get('/me/respostas/');
        const respostaEnviada = resAluno.data.find(r => r.atividade === parseInt(id));
        if (respostaEnviada) {
          setMinhaResposta(respostaEnviada);
        }
      } else {
        console.error(error);
        toast.error("Erro ao carregar os dados.");
      }
    }
  };

  useEffect(() => {
    carregarDados();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEnviarResposta = async (e) => {
    e.preventDefault();
    try {
      await api.post('/respostas/', { atividade: id, texto_resposta: textoResposta });
      toast.success('Resposta enviada com sucesso!');
      carregarDados();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data[0] || "Erro ao enviar resposta.");
    }
  };

  const handleCorrigir = async (respostaId) => {
    try {
      await api.patch(`/respostas/${respostaId}/`, {
        nota: notas[respostaId],
        feedback: feedbacks[respostaId]
      });
      toast.success('Nota salva com sucesso!');
      carregarDados();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar nota. Lembre-se que a nota deve ser entre 0 e 10.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Usamos o novo Header aqui */}
      <Header titulo="Painel da Atividade" />

      <main className="p-8 max-w-4xl mx-auto">
        {isProfessor ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Respostas dos Alunos</h3>
            {respostas.length === 0 ? (
              <p className="text-gray-500 italic">Nenhum aluno respondeu ainda.</p>
            ) : null}
            
            <div className="space-y-6">
              {respostas.map(resp => (
                <div key={resp.id} className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                  <div className="mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Resposta do Aluno</span>
                    <p className="text-gray-800 mt-1 text-lg">{resp.texto_resposta}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-gray-200 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nota (0 a 10):</label>
                      <input 
                        type="number" 
                        min="0" max="10" step="0.1"
                        value={notas[resp.id]} 
                        onChange={(e) => setNotas({...notas, [resp.id]: e.target.value})}
                        className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex-grow max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feedback:</label>
                      <input 
                        type="text" 
                        value={feedbacks[resp.id]} 
                        onChange={(e) => setFeedbacks({...feedbacks, [resp.id]: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Deixe um comentário..."
                      />
                    </div>
                    <button 
                      onClick={() => handleCorrigir(resp.id)} 
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors h-[42px]"
                    >
                      Salvar Correção
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Sua Resposta</h3>
            {minhaResposta ? (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
                <div className="mb-6">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">O que você enviou</span>
                  <p className="text-gray-800 mt-2 text-lg bg-white p-4 rounded border border-blue-100">{minhaResposta.texto_resposta}</p>
                </div>
                
                <div className="pt-6 border-t border-blue-200">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Correção do Professor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded border border-blue-100">
                      <span className="block text-xs text-gray-500 mb-1">Nota</span>
                      <span className={`text-2xl font-bold ${minhaResposta.nota !== null ? 'text-green-600' : 'text-gray-400'}`}>
                        {minhaResposta.nota !== null ? minhaResposta.nota : '-'}
                      </span>
                    </div>
                    <div className="bg-white p-4 rounded border border-blue-100">
                      <span className="block text-xs text-gray-500 mb-1">Feedback</span>
                      <span className="text-gray-700 font-medium">
                        {minhaResposta.feedback || <span className="text-gray-400 italic">Aguardando correção...</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnviarResposta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Escreva sua resposta detalhada:</label>
                  <textarea 
                    rows="6" 
                    required 
                    placeholder="Digite sua resposta aqui..." 
                    value={textoResposta} 
                    onChange={(e) => setTextoResposta(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Enviar Resposta
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AtividadeDetalhes;