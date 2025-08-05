# Next-Agenda

Sistema de **agendamento médico** desenvolvido com Next.js 15, oferecendo uma solução completa para clínicas gerenciarem seus agendamentos, médicos e pacientes. O sistema possui interface moderna com design **mobile-first** e funcionalidades avançadas como dashboard analítico, sistema de assinatura com Stripe e autenticação segura.

## Tecnologias Principais

O projeto foi desenvolvido com as seguintes tecnologias:

- **Next.js 15** - Framework React com App Router
- **Drizzle ORM** - ORM TypeScript-first para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **React 19** - Biblioteca para interfaces
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes UI modernos
- **Zod** - Validação de schemas
- **Better Auth** - Sistema de autenticação
- **Stripe** - Processamento de pagamentos
- **React Query** - Gerenciamento de estado do servidor
- **Recharts** - Gráficos e visualizações

## Banco de Dados

O projeto utiliza **Drizzle ORM** para gerenciar a persistência de dados com PostgreSQL. O sistema possui as seguintes entidades principais:

![Image](https://github.com/user-attachments/assets/6953d9af-b3d8-46ff-bd57-8365c5105cbb)

## Funcionalidades

### 🏥 Gestão de Clínicas

- Cadastro e configuração de clínicas
- Sistema multi-tenant por clínica

### 👨‍⚕️ Gestão de Médicos

- Cadastro de médicos com especialidades
- Configuração de horários de disponibilidade
- Definição de preços por consulta
- Visualização em cards organizados

### 👥 Gestão de Pacientes

- Cadastro completo de pacientes
- Informações pessoais e de contato
- Histórico de consultas

### 📅 Sistema de Agendamentos

- Criação de agendamentos
- Seleção de médico, paciente e horário
- Validação de disponibilidade
- Histórico completo de consultas

### 📊 Dashboard Analítico

- Métricas de receita total
- Estatísticas de agendamentos
- Gráficos de consultas por período
- Top médicos e especialidades
- Filtros por período

### 💳 Planos de Assinatura

- Integração com Stripe
- Planos de assinatura
- Processamento de pagamentos
- Webhooks para sincronização

### 🔐 Autenticação e Segurança

- Sistema de login/registro
- Sessões seguras
- Proteção de rotas
- Validação de permissões

### 📷 Telas da aplicação

![Image](https://github.com/user-attachments/assets/000fb294-6fb3-4e29-9638-1599aeb6d618)

![Image](https://github.com/user-attachments/assets/7911179d-d98c-43fb-ac87-5cf769504f0e)

![Image](https://github.com/user-attachments/assets/2c9d2c2a-31ac-4e4f-a1fb-0f6913f22c32)

![Image](https://github.com/user-attachments/assets/8a520866-3b21-4d00-a0ab-0e922f27aa61)

## Como Rodar o Projeto

### 1. Clone o repositório

```sh
git clone https://github.com/seu-usuario/next-agenda.git
cd next-agenda
```

### 2. Instale as dependências

```sh
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo .env na raiz do projeto com as seguintes chaves (substitua os valores reais):

```sh
DATABASE_URL=******
AUTH_SECRET=******
DATABASE_URL=******
BETTER_AUTH_SECRET=******
BETTER_AUTH_URL=******
GOOGLE_CLIENT_ID=******
GOOGLE_CLIENT_SECRET=******
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=******
STRIPE_SECRET_KEY=******
STRIPE_ESSENTIAL_PLAN_PRICE_ID=******
STRIPE_WEBHOOK_SECRET=******
NEXT_PUBLIC_APP_URL=******
NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL=******
```

### 4. Configure o banco de dados

```sh
# Execute as migrações
npm run db:generate
npm run db:migrate
```

### 5. Inicie o servidor de desenvolvimento

```sh
npm run dev
```

### 6. Acesse a aplicação

```sh
http://localhost:3000/authentication
```
