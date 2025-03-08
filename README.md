# Sistema de Caixa de Supermercado

Um sistema completo para gerenciamento de caixa de supermercado com funcionalidades avançadas de vendas, pagamentos e controle de estoque.

## Funcionalidades

### Vendas e Pagamentos
- Leitura de código de barras
- Processamento de pagamentos com cartão de débito e crédito
- Opções de parcelamento
- Aplicação de descontos promocionais
- Processamento de cupons de desconto

### Controle de Estoque
- Gerenciamento de inventário
- Adição e remoção de itens
- Aplicação de descontos para itens específicos
- Controle de validade dos produtos
- Alertas para produtos próximos ao vencimento

## Estrutura do Projeto

```
├── backend/                # API e lógica de negócios
│   ├── controllers/        # Controladores da API
│   ├── models/             # Modelos de dados
│   ├── routes/             # Rotas da API
│   ├── services/           # Serviços de negócios
│   ├── utils/              # Utilitários
│   └── server.js           # Ponto de entrada do servidor
├── frontend/               # Interface do usuário
│   ├── public/             # Arquivos estáticos
│   ├── src/                # Código fonte
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   └── App.js          # Componente principal
├── database/               # Scripts e migrações do banco de dados
└── docs/                   # Documentação
```

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Frontend**: React.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)

## Instalação e Configuração

1. Clone o repositório
2. Instale as dependências do backend e frontend
3. Configure as variáveis de ambiente
4. Inicie o servidor de desenvolvimento

## Licença

Este projeto está licenciado sob a licença MIT.