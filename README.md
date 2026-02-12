
<img width="308" height="96" alt="Captura de tela de 2026-02-11 21-12-58" src="https://github.com/user-attachments/assets/ea045ab3-8619-43b8-8954-5074e20c7b07" />

# 🔐 void2FA CLI

Interface de linha de comando (CLI) para gerenciar contas de autenticação de dois fatores (2FA – TOTP/HOTP), gerar códigos temporários e copiá-los automaticamente para a área de transferência.

![typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## Prints

<img width="1348" height="727" alt="Captura de tela de 2026-02-11 21-13-27" src="https://github.com/user-attachments/assets/2036462a-07a9-49fd-9fdb-6be75dba89fa" />

## 📋 Requisitos

- 🟢 Node.js 20+
- 🔑 Um backend de chaveiro compatível com keytar no seu sistema operacional

## 📦 Instalação

```bash
npm install -g void2fa
```

## 🚀 Comandos Disponíveis

- `ping`:
- ➜ Responde pong! :D
- `create [name] [issuer] [secret]`
- ➜ Cria uma nova conta (ou inicia modo interativo)
- `edit [id]`
- ➜ Atualiza os dados de uma conta (ou modo interativo)
- `delete [id]`
- ➜ Remove uma conta
- `find [id]`
- ➜ Exibe uma conta específica
- `find-all`
- ➜ Lista todas as contas cadastradas
- `code [id]`
- ➜ Gera e/ou copia o código atual da conta

## ⚙️ Opções Úteis do Comando code

- `-r, --raw`
- ➜ Exibe apenas o código
- `-n, --next`
- ➜ Aguarda o próximo ciclo do TOTP antes de gerar
- `-w, --watch`
- ➜ Continua emitindo códigos automaticamente
- `-a, --auto`
- ➜ Incrementa automaticamente o contador HOTP

## 🔒 Dados e Segurança

- 📁 As contas são armazenadas de forma criptografada no arquivo accounts.enc
- 🔐 A chave de criptografia é armazenada com segurança no chaveiro do sistema operacional usando keytar