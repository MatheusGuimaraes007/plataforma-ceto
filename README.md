# 🚀 Plataforma Ceto Saudável

Uma solução robusta de gerenciamento e automação para desafios de saúde via WhatsApp. A plataforma permite o monitoramento de grupos, agendamento de sequências de mensagens interativas e análise de métricas em tempo real.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com tecnologias modernas do ecossistema JavaScript:

* **Frontend:** [Vue 3](https://vuejs.org/) (Composition API) com [Vite](https://vitejs.dev/).
* **Estilização:** [Tailwind CSS 4](https://tailwindcss.com/).
* **Backend as a Service:** [Supabase](https://supabase.com/) (Autenticação e Banco de Dados PostgreSQL).
* **Gráficos:** [Chart.js](https://www.chartjs.org/) para visualização de dados do dashboard.
* **Roteamento:** [Vue Router](https://router.vuejs.org/) com guardas de autenticação.
* **Deploy:** Configurado para [Vercel](https://vercel.com/) com suporte a SPA.

## ✨ Funcionalidades Principais

* **📊 Dashboard Inteligente:** Visualização em tempo real do total de grupos, membros ativos e distribuição de pessoas por semana do desafio.
* **👥 Gerenciamento de Grupos:** Controle total sobre o status dos grupos (Ativo, Inativo, Finalizado), edição de datas de início e integração com links do WhatsApp.
* **📚 Biblioteca de Mensagens:** Criação de pacotes de mensagens complexos, incluindo textos formatados, imagens, vídeos, documentos, áudios e enquetes interativas.
* **📅 Cronograma Automatizado:** Agendamento preciso de envios por dia do desafio e horário, com suporte a dias de preparação.
* **🔐 Segurança:** Sistema de login seguro baseado em código de acesso persistente via LocalStorage.

## 📂 Estrutura do Projeto

O projeto utiliza uma arquitetura baseada em **Composables**, separando a lógica de negócio da interface:

* **`/src/components`**: Componentes de UI e telas principais como Dashboard, Grupos e Mensagens.
* **`/src/composables`**: Lógica reativa para interação com Supabase, autenticação e operações de CRUD.
* **`/src/router`**: Definição de rotas e proteção de acesso para usuários autenticados.
* **`/src/assets`**: Ativos estáticos como o ícone da plataforma.

---
*Desenvolvido por **Matheus Guimarães***
