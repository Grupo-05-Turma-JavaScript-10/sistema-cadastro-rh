# 🤝 Colab+ | Sistema de Gestão de RH

![Badge Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow) ![Badge NestJS](https://img.shields.io/badge/Backend-NestJS-red) ![Badge TS](https://img.shields.io/badge/Language-TypeScript-blue) ![Badge Database](https://img.shields.io/badge/Database-MySQL-orange)

> **Colab+** é uma API RESTful desenvolvida para modernizar a gestão de Recursos Humanos. O sistema integra autenticação de usuários, cadastro de colaboradores e uma **inteligência de cálculo de folha de pagamento** baseada em variáveis mensais.

---

## 🚀 Funcionalidades Principais

- **🔐 Autenticação e Segurança:** Gestão de usuários com login e vínculo direto ao perfil do colaborador.
- **📋 Gestão de Colaboradores:** CRUD completo com validação de dados sensíveis (CPF, Email).
- **👔 Gestão de Cargos:** Organização hierárquica da empresa.
- **💰 Cálculo Automático de Salários:** Lógica de negócio inteligente que processa o salário líquido considerando:
  - Salário Base (vinculado ao contrato);
  - Horas Trabalhadas no mês;
  - Bônus e Gratificações;
  - Descontos (INSS, atrasos, etc).
- **🗄️ Banco de Dados Relacional:** Estrutura robusta utilizando MySQL e TypeORM com relacionamentos integrados.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi desenvolvido seguindo as melhores práticas do mercado:

- **[Node.js](https://nodejs.org/)** - Runtime JavaScript.
- **[NestJS](https://nestjs.com/)** - Framework para construção de APIs escaláveis e modulares.
- **[TypeScript](https://www.typescriptlang.org/)** - Superset do JavaScript para tipagem estática e segura.
- **[TypeORM](https://typeorm.io/)** - ORM para interação com o banco de dados MySQL.
- **[MySQL](https://www.mysql.com/)** - Banco de dados relacional.
- **[Class Validator](https://github.com/typestack/class-validator)** - Validação de dados de entrada (DTOs).

---

## 🗂️ Modelagem de Dados (DER)

O sistema foi arquitetado com base em 3 entidades principais, garantindo integridade e segurança:

### 1. Usuario (`tb_usuarios`)
Responsável pelo acesso ao sistema.
- **idUsuario:** Identificador único.
- **nome:** Nome de exibição.
- **senha:** Hash criptografado.
- **foto:** URL da imagem de perfil (suporta até 5000 caracteres para links longos).

### 2. Colaborador (`tb_colaboradores`)
Contém os dados contratuais e de RH.
- **id:** Identificador único.
- **nome:** Nome civil completo.
- **cpf:** Cadastro de Pessoa Física (Formato: `000.000.000-00` - 14 caracteres).
- **email:** Email corporativo.
- **salario:** Salário base contratual (Precisão Decimal 10,2).
- **data_admissao:** Data de registro na empresa.
- **status:** Indicador de atividade (Ativo/Inativo).
- **Cargo_id:** Chave estrangeira para a tabela de Cargos.
- **Usuario_id:** Chave estrangeira para vínculo de login (Relacionamento 1:1).

### 3. Cargo (`tb_cargos`)
Define a hierarquia e funções.
- **id:** Identificador único.
- **nome:** Título do cargo (ex: Desenvolvedor, Analista de RH).
- **descricao:** Detalhamento das atribuições.

---

## 🔌 Rotas da API (Exemplos)

### 👤 Colaboradores
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/colaboradores` | Lista todos os colaboradores ativos |
| `POST` | `/colaboradores` | Cadastra um novo funcionário |
| `PUT` | `/colaboradores/:id` | Atualiza dados (ex: promoção de cargo) |
| `POST` | `/colaboradores/:id/calcular-salario` | **Feature:** Calcula o holerite do mês |

**Exemplo de Payload para Cálculo de Salário:**
```json
POST /colaboradores/1/calcular-salario
{
  "horasTrabalhadas": 220,
  "bonus": 500.00,
  "descontos": 150.50
}

**Resposta do Sistema:**
```json
{
  "nome": "João da Silva",
  "salarioBase": 3000.00,
  "totalReceber": 3349.50
}

# 🏁 Como Rodar o Projeto

## 📋 Pré-requisitos
- Node.js instalado
- MySQL Workbench ou Docker rodando

## 🚀 Passo a Passo

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/seu-usuario/colab-plus.git
```

### 2️⃣ Instale as dependências
```bash
cd sistema-cadastro-rh
npm install
```

### 3️⃣ Configure o Banco de Dados
Crie o banco de dados vazio:
```sql
CREATE DATABASE db_rh;
```


## Configuração via .env

Crie um arquivo `.env` na raiz do projeto e configure suas credenciais do MySQL no arquivo `.env` copiando o arquivo `.env.example`:

- Desenvolvimento (MySQL):
  - DB_MODE=dev
  - DB_HOST=localhost
  - DB_PORT=3306
  - DB_USER=root
  - DB_PASS=root
  - DB_NAME=db_rh

- Produção (Postgres):
  - DB_MODE=prod
  - DATABASE_URL=postgres://usuario:senha@host:5432/nome_db

Copie o arquivo `.env.example` para `.env`, ajuste os valores e rode:
```bash
cp .env.example .env
npm run start:dev
```
### 4️⃣ Execute o projeto
```bash
# Modo de desenvolvimento (com Watch mode)
npm run start:dev
```

## Seeds (popular dados de exemplo)
```bash
npm run seed
```
Insere cargos básicos, usuário admin e um colaborador de exemplo. Use após configurar corretamente o `.env`.

### 📜 Swagger (Documentação da API)
- Após iniciar, acesse no navegador:
  - http://localhost:4000/swagger (porta padrão 4000)
  - Se você alterou `PORT` no `.env`, use: `http://localhost:<PORT>/swagger`
- A raiz `/` também redireciona automaticamente para `/swagger`.

