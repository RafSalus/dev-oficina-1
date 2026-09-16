# Dev Oficina

Projeto configurado com **Vite** e executado dentro do container Docker `dev-oficina`.

---

## 📁 Estrutura do Projeto

```text
dev-oficina/
├── public/              # Arquivos públicos e estáticos
│   └── favicon.svg      # Ícone do projeto
├── src/                 # Código-fonte da aplicação
│   ├── main.js          # Ponto de entrada JavaScript
│   └── style.css        # Estilos globais
├── .gitignore           # Arquivos ignorados pelo Git
├── index.html           # Página HTML principal
├── package.json         # Dependências e scripts do projeto
├── vite.config.js       # Configuração do Vite (porta 5173, polling para Docker)
└── README.md            # Documentação
```

---

## 🐳 Informações do Container Docker

- **Nome do Container**: `dev-oficina`
- **Diretório Mapeado**: `/home/rafael/projetos/dev-oficina` ➡️ `/workspace`
- **Portas Mapeadas**:
  - `5173:5173` (Servidor de desenvolvimento Vite)
  - `4173:4173` (Servidor de preview do Vite)
  - `3000:3000` (Porta adicional / API)

---

## 🚀 Como Iniciar o Servidor

### Opção 1: Diretamente pelo host via Docker Exec
```bash
docker exec -it dev-oficina npm run dev
```

### Opção 2: Entrando no terminal do container
```bash
docker exec -it dev-oficina bash
npm run dev
```

### Opção 3: No VS Code Dev Containers
Abra o terminal integrado no VS Code conectado ao container e execute:
```bash
npm run dev
```

O servidor estará acessível em:
- Localmente: `http://localhost:5173`
- Rede local: `http://<seu-ip-local>:5173`
