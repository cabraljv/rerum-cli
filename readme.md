# Rerum Generative CLI

## Pre-requisitos

- Node.js 20+ verificar [nvm](https://github.com/nvm-sh/nvm) para gerenciamento de versões do node
- Git

## Instalação

```bash
git clone https://github.com/cabraljv/rerum-cli.git
cd rerum-cli
npm install
npm run build
```


## Uso

Basta criar um novo diretório `projects` e criar o link para o comando rerum-cli

```bash
mkdir projects # a partir do diretório raiz do projeto rerum-cli
npm link
cd projects
```

## Comandos

-  `npx rerum-cli create -t <vue | dbmapping> -n <name>`
-  `npx rerum-cli generate -i <odl-dir>`

