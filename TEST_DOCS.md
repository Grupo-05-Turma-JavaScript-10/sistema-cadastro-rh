# 🧪 Documentação de Testes - Sistema de Cadastro de RH

Este documento detalha a estratégia de Qualidade de Software (QA) e Testes implementada na aplicação **Sistema de Cadastro de RH**, desenvolvida em NestJS. 

A arquitetura de testes foi projetada para garantir **alta confiabilidade**, **prevenção contra regressões** e **validação de segurança** sem comprometer a velocidade de desenvolvimento.

---

## 🎯 Estratégia de Testes

Nós adotamos o padrão da **Pirâmide de Testes**, focando em duas frentes principais:

### 1. Testes Unitários (Regras de Negócio)
Focados em testar o "Coração" do sistema: os `Services`. 
- **Objetivo:** Garantir que cálculos (ex: encargos trabalhistas), lógicas de histórico e criptografia de senhas funcionem perfeitamente.
- **Ferramentas:** `Jest`.
- **Abordagem:** Isolamento total. O banco de dados real NUNCA é acessado. Utilizamos o utilitário `@nestjs/testing` (`getRepositoryToken`) para mockar o TypeORM e simular os retornos.
- **Padrão Utilizado:** **AAA** (Arrange, Act, Assert).

### 2. Testes End-to-End / E2E (Jornada do Usuário & Segurança)
Focados na camada de entrada e saída HTTP: os `Controllers`.
- **Objetivo:** Garantir que o `class-validator` (Pipes) está bloqueando payloads maliciosos, que os `Guards` (JWT/Passport) estão funcionando e que os HTTP Status Codes (200, 201, 400, 404) estão corretos.
- **Ferramentas:** `Supertest` + `Jest`.
- **Abordagem:** Levantamos uma instância "fake" do NestJS na memória (`createNestApplication()`) e disparamos chamadas HTTP. Os serviços de banco de dados são mockados para que o teste seja focado 100% no fluxo da requisição.

---

## 🛠️ Stack de Testes Utilizada

A stack já está inclusa nativamente no ecossistema NestJS, garantindo compatibilidade e longo prazo:

| Ferramenta | Propósito |
| :--- | :--- |
| **Jest** | Test Runner principal, responsável por executar os testes, fazer os `expects` e mockar funções (`jest.fn()`). |
| **Supertest** | Biblioteca para disparar requisições HTTP simuladas nos testes E2E. |
| **@nestjs/testing** | Provedor de Injeção de Dependências focado em ambiente de teste (criação do `TestingModule`). |

---

## 🚀 Como Executar os Testes

Abra o seu terminal na raiz do projeto e utilize os scripts já configurados no `package.json`:

### 1. Rodar os Testes Unitários
Executa todos os arquivos com extensão `.spec.ts` (Os Services).
```bash
npm run test
```

### 2. Rodar os Testes Unitários e Ver o Coverage (Relatório)
Gera uma tabela no terminal mostrando a porcentagem de código que está coberta por testes.
```bash
npm run test:cov
```
*(Dica: Isso também gera uma pasta `/coverage` com um arquivo `index.html`. Abra-o no navegador para ver o relatório visual detalhado linha por linha!)*

### 3. Rodar os Testes E2E (End-to-End)
Executa todos os arquivos com extensão `.e2e-spec.ts` dentro da pasta `/test` (Os Controllers).
```bash
npm run test:e2e
```

---

## 🏗️ Como criar novos testes no futuro?

Se você adicionar um novo módulo no sistema (ex: `FolhaPagamento`), siga este guia de boas práticas:

### Para o Service (`folha.service.spec.ts`):
1. Copie a estrutura base do `usuario.service.spec.ts`.
2. Mocke o repositório do TypeORM usando `mockFolhaRepository = { find: jest.fn(), save: jest.fn() }`.
3. Teste o "Caminho Feliz" (Happy Path) e as "Exceções" (HttpExceptions).

### Para o Controller (`folha.e2e-spec.ts`):
1. Copie a estrutura do `colaborador.e2e-spec.ts` na pasta `/test`.
2. Lembre-se de ativar o ValidationPipe: `app.useGlobalPipes(new ValidationPipe())`.
3. Burl o Guard se necessário usando `.overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })`.
4. Dispare requisições usando o `request(app.getHttpServer())` e valide os Status Codes.

---

## 📊 Status Atual da Cobertura (Coverage)

*   **Services (Regras de Negócio):** ~85% a 100% de cobertura nos arquivos testados. Lógicas críticas de RH (Cálculo de salários, Promoções, JWT) estão blindadas.
*   **Controllers (E2E):** 100% dos controllers possuem suíte E2E testando respostas HTTP e validação de DTO.

*Documentação mantida pela equipe de QA & Engenharia.* 🚀