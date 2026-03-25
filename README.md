
<img width="308" height="96" alt="Captura de tela de 2026-02-11 21-12-58" src="https://github.com/user-attachments/assets/ea045ab3-8619-43b8-8954-5074e20c7b07" />

# 🔐 void2FA CLI

![GitHub repo size](https://img.shields.io/github/repo-size/diegoarauj0/void2FA-cli?style=for-the-badge)
![GitHub License](https://img.shields.io/github/license/diegoarauj0/void2FA-cli?style=for-the-badge)
![GitHub package.json version](https://img.shields.io/github/package-json/v/diegoarauj0/void2FA-cli?style=for-the-badge)

![typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/Sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![NodeJs](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

Interface de linha de comando (CLI) para gerenciar contas de autenticação de dois fatores (2FA – TOTP/HOTP), gerar códigos temporários e copiá-los automaticamente para a área de transferência.


## 📋 Requisitos

- 🟢 Node.js 20+
- 🔑 Um sistema de chaveiro compatível com keytar no seu sistema operacional 

## 📦 Instalação

```bash
npm install -g void2fa
```

## 🚀 Comandos Disponíveis

**Fundamentais**
- `ping` — Mostra a versão, o modo dev e responde “Pong!” para verificar a instalação.
- `create [name] [issuer] [secret]` — Cria uma conta via argumentos ou prompt interativo; configure algoritmo (`--algorithm/-a`), contador inicial (`--counter/-c`), período TOTP (`--period/-p`), tipo (`--type/-t`), dígitos (`--digits/-d`) e codificação (`--encoding/-e`).
- `edit [query]` — Atualiza uma conta por ID/nome ou selecionando interativamente; use `--name/-n`, `--issuer/-i`, `--secret/-s`, `--algorithm/-a`, `--encoding/-e`, `--digits/-d`, `--period/-p`, `--counter/-c` e `--type/-t` para mudar campos específicos.
- `delete [query]` — Remove uma conta após seleção e confirmação; pode receber ID/nome ou abrir o prompt para escolher qual conta excluir.

**Consultas e códigos**
- `list` — Mostra todas as contas salvas em uma tabela; adicione `--show-secret/-s` para incluir segredos e códigos atuais (use com cautela).
- `search [query]` — Procura por ID, nome ou issuer; deixe o argumento de fora para abrir o seletor interativo e use `--show-secret/-s`, `--json/-j` ou `--yaml/-y` para ajustar a saída.
- `code [query]` — Copia o código TOTP/HOTP selecionado para a área de transferência (ou imprime com `--raw/-r`); aceita `--watch/-w` (TOTP apenas), `--next/-n`, `--no-auto/-a` para evitar incremento automático do contador HOTP, e `--no-clipboard/-c` para impedir cópia. A ausência de `query` abre o seletor, e `--watch` e `--next` não podem ser usados juntos.

## ⚙️ Opções Úteis do Comando code

- `-r, --raw` — Imprime apenas o código, útil para scripts.
- `-n, --next` — Aguarda o próximo ciclo do TOTP antes de gerar (não compatível com `--watch`).
- `-w, --watch` — Atualiza continuamente os códigos TOTP (não funciona com HOTP).
- `-a, --no-auto` — Não incrementa automaticamente o contador HOTP quando o código é gerado.
- `-c, --no-clipboard` — Impede a cópia automática para a área de transferência.

## 🔒 Dados e Segurança

Claro, aqui vai uma versão atualizada alinhada com o uso do SQLite:

- 📁 As contas são armazenadas de forma segura em um banco de dados SQLite local
- 🔐 Os dados sensíveis são criptografados antes de serem persistidos no banco
- 🔑 A chave de criptografia é armazenada com segurança no chaveiro do sistema operacional usando keytar