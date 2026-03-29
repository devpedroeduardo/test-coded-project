# 🎓 Plataforma de Atividades Escolares

Uma aplicação web Full-Stack desenvolvida para modernizar e facilitar a interação acadêmica entre Professores e Alunos. A plataforma oferece um ambiente seguro e escalável onde professores podem gerenciar tarefas, enviar materiais de apoio e avaliar respostas, enquanto os alunos têm um painel centralizado para acompanhar pendências, enviar resoluções com anexos e visualizar feedbacks.

---

## 🚀 Tecnologias e Ecossistema

O projeto foi construído separando as responsabilidades entre Front-end (SPA) e Back-end (API RESTful), orquestrados através de containers Docker para garantir consistência desde o desenvolvimento até a produção.

### Back-end (API)
* **Framework Core:** Python 3.12 + Django 4.2
* **API REST:** Django REST Framework (DRF)
* **Autenticação:** JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
* **Documentação Viva:** Swagger UI Automático via `drf-spectacular`
* **Qualidade de Software:** 100% de Cobertura de Testes Automatizados (`pytest`, `pytest-django`, `coverage`)
* **Banco de Dados:** SQLite (com ORM estruturado para migração imediata para PostgreSQL)

### Front-end (Interface)
* **Core:** React 19 (via Vite)
* **Estilização:** Tailwind CSS v4 (Utility-first e totalmente responsivo)
* **Roteamento:** React Router DOM v7
* **Comunicação de Rede:** Axios + `jwt-decode`
* **UX/UI:** React Hot Toast (Notificações) e Skeletons de carregamento assíncrono

### Infraestrutura
* Docker & Docker Compose
* Suporte nativo a volumes para persistência de dados e arquivos de mídia (Uploads)

---

## 🧠 Decisões Técnicas e Arquitetura

Para demonstrar uma visão focada em resiliência, escalabilidade e manutenção de longo prazo, as seguintes decisões foram implementadas:

1. **Gestão de Estado e Autorização Client-Side:**
   Em vez de sobrecarregar a API com requisições extras ou depender de erros HTTP `403 Forbidden` para gerenciar rotas, o Front-end intercepta o JWT e o decodifica localmente (`jwt-decode`). Isso permite que a aplicação saiba instantaneamente o *Role* do usuário (Professor ou Aluno) de forma síncrona, ditando a renderização da interface e melhorando a performance percebida (UX).

2. **Programação Defensiva contra Mutações de Payload (Paginação):**
   O consumo da API no Front-end foi blindado para aceitar tanto listas diretas (formato padrão do Django) quanto objetos estruturados `{ count, next, results }` (formato paginado). Isso previne *crashes* silenciosos (telas brancas) caso a configuração de paginação da API seja alterada para lidar com alto volume de dados no futuro.

3. **Arquitetura de Uploads via `Multipart/Form-Data`:**
   Para suportar o envio de arquivos reais (materiais de apoio de professores e resoluções em PDF/Imagens dos alunos), a comunicação entre Client e Server abandonou o padrão `application/json` nas rotas de criação. Implementou-se a API nativa `FormData` do JavaScript, integrando-a com o `MEDIA_ROOT` e `MEDIA_URL` do Django dentro do container Docker.

4. **Dashboard Otimizado no Banco de Dados:**
   A rota estatística do Professor não trafega centenas de respostas para fazer cálculos matemáticos na memória do servidor Python. Foram utilizadas agregações do ORM do Django (`Avg`, `Count`) delegando a carga para o Banco de Dados, que devolve totais e médias já processados.

5. **Documentação como Contrato (Swagger):**
   A adoção do `drf-spectacular` garante a geração do *Schema OpenAPI* em tempo real. Qualquer alteração nos *serializers* reflete automaticamente na interface `/docs/`, mantendo o contrato Front/Back perfeitamente sincronizado sem intervenção manual.

---

## 🚧 Desafios Enfrentados e Resoluções

Durante o ciclo de desenvolvimento, alguns cenários exigiram refatorações estratégicas:

* **Sincronismo de Dependências no Docker:** * *Contexto:* Adições de bibliotecas Python geravam erros de `ModuleNotFoundError` devido ao cache agressivo de *layers* do Docker.
  * *Solução:* Ajuste na ordem de cópia do `requirements.txt` no `Dockerfile` e utilização dos comandos de composição `--build --force-recreate`, garantindo a reconstrução limpa da imagem.

* **Payloads Mistos (Texto + Arquivo) no React:**
  * *Contexto:* O envio de inputs do tipo `file` através do estado do React frequentemente gerava requisições malformadas ou *null bytes* no Django.
  * *Solução:* Substituição do envio tradicional JSON pela construção iterativa de um objeto `FormData`, adicionando a chave `arquivo` dinamicamente apenas quando o usuário anexa um documento.

---

## ⚙️ Como Executar o Projeto (Localmente)

O projeto é 100% conteinerizado. O único pré-requisito é ter o **Docker** e o **Docker Compose** instalados na sua máquina.

**1. Clone o repositório:**
```bash
git clone [https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git](https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git)
cd NOME_DO_REPOSITORIO

2. Suba a infraestrutura completa:
Na raiz do projeto (onde o arquivo docker-compose.yml está localizado), rode o comando abaixo para construir as imagens e subir os serviços de Front-end e Back-end simultaneamente:

```bash  
docker compose up -d --build

3. Acesse a Aplicação:

# Front-end (Interface): http://localhost:5173 (ou porta mapeada do Vite)

# Back-end (API Base): http://localhost:8000

# Swagger (Documentação da API): http://localhost:8000/docs/

💡 Dica de Avaliação: Para testar a aplicação populada, acesse o bash do container backend executando docker compose exec backend bash. Em seguida, rode python manage.py createsuperuser e utilize o painel /admin/ no navegador para cadastrar os primeiros Usuários e Turmas.

## 🧪 Qualidade e Testes Automatizados

 A API conta com uma suíte rigorosa de testes unitários e de integração, atingindo a marca de 100% de cobertura nas regras de negócio (limite de respostas, bloqueio de turmas, prazos e permissões).

 Para rodar os testes e visualizar o relatório de cobertura, execute o comando abaixo com os containers em execução:

```bash 
docker compose exec backend pytest --cov=. --cov-report=term-missing

##📡 Endpoints da API (Resumo)

Autenticação:

POST /auth/login/ - Gera e retorna o Token JWT.

Atividades (Professores):

GET /me/atividades/ - Lista as atividades criadas pelo professor.

POST /atividades/ - Cria uma nova atividade (suporta FormData com anexo).

GET /atividades/{id}/respostas/ - Lista as respostas enviadas pelos alunos.

PATCH /respostas/{id}/ - Envia Nota (0 a 10) e Feedback para a resposta do aluno.

Respostas (Alunos):

GET /me/atividades/ - Lista as atividades disponíveis para a turma do aluno.

GET /me/respostas/ - Lista as resoluções enviadas pelo próprio aluno.

POST /respostas/ - Envia uma resolução para uma atividade (suporta FormData com anexo).