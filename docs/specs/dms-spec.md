# Especificacao - Document Management System

## 1. Objetivo

Entregar um sistema web simples de gestao de documentos que permita envio, listagem e download de arquivos por usuario, com armazenamento local de arquivos e metadados mantidos em memoria nesta fase.

## 2. Escopo

### Dentro do escopo

- Upload de documento via API HTTP.
- Listagem de documentos por usuario.
- Download de documento por identificador.
- Integracao frontend com backend via prefixo /api (proxy Vite).
- Armazenamento local dos binarios em backend/storage usando multer com diskStorage.
- Metadados em memoria durante a execucao do processo backend.

### Fora do escopo

- Banco de dados persistente de metadados.
- Armazenamento em nuvem, S3 ou servicos externos.
- Versionamento de documentos.
- Autenticacao/autorizacao robusta (OAuth, JWT, RBAC).
- Compartilhamento de documentos entre usuarios.
- Exclusao e edicao de documentos (nesta fase inicial).

## 3. Requisitos funcionais

| ID | Requisito | Criterio objetivo |
| --- | --- | --- |
| RF-01 | O sistema deve permitir upload de um documento por requisicao | Recebe multipart/form-data com 1 arquivo e retorna metadados com id |
| RF-02 | O sistema deve registrar metadados do documento apos upload | id, originalName, size, uploadedAt, owner, storedName, mimeType |
| RF-03 | O sistema deve listar documentos do usuario solicitante | Retorna colecao de metadados filtrada por owner |
| RF-04 | O sistema deve permitir download por id | Retorna binario do arquivo com cabecalho de attachment |
| RF-05 | O sistema deve retornar erro quando documento nao existir | Retorno HTTP 404 com mensagem de erro |
| RF-06 | O sistema deve validar ausencia de arquivo no upload | Retorno HTTP 400 com erro de validacao |
| RF-07 | O sistema deve validar identificacao do usuario | Requisicoes sem owner retornam HTTP 400 |
| RF-08 | O backend deve expor endpoint de saude | GET /health retorna status ok |

Observacao de contrato de usuario nesta fase:

- O owner sera informado por cabecalho HTTP X-Owner-Id para manter a gestao simples por usuario sem autenticacao completa.

## 4. Requisitos nao funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Backend em Node.js + Express CommonJS |
| RNF-02 | Upload com multer usando diskStorage no filesystem local |
| RNF-03 | Diretorio de armazenamento: backend/storage |
| RNF-04 | Metadados mantidos em memoria (sem persistencia entre reinicios) |
| RNF-05 | Configuracao por variaveis de ambiente (12-Factor) |
| RNF-06 | Arquitetura em camadas: routes -> controllers -> services -> repositories |
| RNF-07 | Respostas de erro padronizadas em JSON |
| RNF-08 | Codigo orientado a simplicidade (KISS/YAGNI), sem abstracoes prematuras |

## 5. Modelo de dados (metadados do documento)

Entidade: DocumentMetadata

| Campo | Tipo | Obrigatorio | Descricao |
| --- | --- | --- | --- |
| id | string | Sim | Identificador unico logico do documento |
| originalName | string | Sim | Nome original enviado pelo cliente |
| storedName | string | Sim | Nome fisico gravado no disco pelo multer |
| mimeType | string | Sim | Tipo MIME informado no upload |
| size | number | Sim | Tamanho em bytes |
| uploadedAt | string (ISO 8601) | Sim | Data/hora do upload |
| owner | string | Sim | Identificador do usuario dono |
| storagePath | string | Sim | Caminho local do arquivo no backend |

Regras de dados:

- id deve ser unico no processo.
- owner nao pode ser vazio.
- size deve ser maior que 0.
- uploadedAt gerado no backend.
- storagePath sempre aponta para arquivo em backend/storage.

## 6. Contratos de API

### 6.1 POST /upload

Finalidade:

- Enviar documento e registrar metadados.

Entrada:

- Metodo: POST
- Content-Type: multipart/form-data
- Cabecalho obrigatorio: X-Owner-Id
- Campo de arquivo: file

Resposta de sucesso:

- Status: 201
- Body JSON:
  - id
  - originalName
  - storedName
  - mimeType
  - size
  - uploadedAt
  - owner

Erros:

- 400: arquivo ausente
- 400: X-Owner-Id ausente ou invalido
- 500: falha inesperada no processamento

### 6.2 GET /documents

Finalidade:

- Listar metadados do usuario solicitante.

Entrada:

- Metodo: GET
- Cabecalho obrigatorio: X-Owner-Id

Resposta de sucesso:

- Status: 200
- Body JSON:
  - documents: array de DocumentMetadata

Erros:

- 400: X-Owner-Id ausente ou invalido
- 500: falha inesperada

### 6.3 GET /documents/:id/download

Finalidade:

- Baixar binario do documento pelo id.

Entrada:

- Metodo: GET
- Parametro de rota: id
- Cabecalho obrigatorio: X-Owner-Id

Resposta de sucesso:

- Status: 200
- Content-Type: conforme mimeType armazenado
- Content-Disposition: attachment; filename="<originalName>"
- Body: binario do arquivo

Erros:

- 400: X-Owner-Id ausente ou invalido
- 404: documento nao encontrado para o owner informado
- 500: falha de leitura do arquivo

### 6.4 GET /health

Finalidade:

- Sinal de saude da aplicacao.

Resposta:

- Status: 200
- Body JSON: { status: "ok" }

## 7. Decisoes arquiteturais e riscos

Decisoes:

- Separacao estrita de responsabilidades:
  - routes: roteamento e composicao de middlewares
  - controllers: validacao de entrada e mapeamento HTTP
  - services: regras de negocio e orquestracao
  - repositories: metadados em memoria e acesso a arquivo local
- Multer com diskStorage para garantir gravacao local obrigatoria.
- Identificacao de usuario por X-Owner-Id para manter escopo simples.
- Frontend consome backend via /api conforme proxy em frontend/vite.config.js.

Riscos:

- Perda de metadados ao reiniciar backend (memoria volatil).
- Acumulo de arquivos em backend/storage sem politica de limpeza.
- Concorrencia alta pode pressionar I/O local.
- Sem autenticacao real, X-Owner-Id pode ser forjado em ambiente nao controlado.
- Divergencia eventual entre arquivo em disco e metadado em memoria em caso de falhas parciais.

Mitigacoes iniciais:

- Validar existencia fisica no download.
- Estruturar tratamento de erro transacional simples no upload.
- Definir limites de upload e mensagens claras de erro.
- Documentar comportamento de nao persistencia nesta fase.

## 8. Plano de execucao em etapas

### Etapa 1. Estruturar backend por camadas

Arquivos a criar/alterar:

- backend/src/app.js
- backend/src/routes/*
- backend/src/controllers/*
- backend/src/services/*
- backend/src/repositories/*

Criterios de aceite:

- Fluxo de dependencia respeita routes -> controllers -> services -> repositories.
- App sobe e mantem GET /health funcional.
- Rotas de documentos registradas sem quebrar seed existente.

### Etapa 2. Implementar upload com multer diskStorage

Arquivos a criar/alterar:

- backend/src/routes/*
- backend/src/controllers/*
- backend/src/services/*
- backend/src/repositories/*
- backend/storage/*

Criterios de aceite:

- POST /upload grava arquivo localmente.
- Metadado completo e retornado com status 201.
- Erros de validacao retornam 400.

### Etapa 3. Implementar listagem por usuario

Arquivos a criar/alterar:

- backend/src/routes/*
- backend/src/controllers/*
- backend/src/services/*
- backend/src/repositories/*

Criterios de aceite:

- GET /documents retorna apenas documentos do X-Owner-Id informado.
- Sem owner, retorna 400.
- Resposta mantem contrato estavel de metadados.

### Etapa 4. Implementar download por id com controle de owner

Arquivos a criar/alterar:

- backend/src/routes/*
- backend/src/controllers/*
- backend/src/services/*
- backend/src/repositories/*

Criterios de aceite:

- GET /documents/:id/download retorna binario quando owner e id conferem.
- Documento inexistente retorna 404.
- Cabecalhos de download corretos (tipo e nome do arquivo).

### Etapa 5. Testes backend (node:test)

Arquivos a criar/alterar:

- backend/test/app.test.js

Criterios de aceite:

- Cobertura minima de happy path e erros para upload/list/list-download.
- Testes executam com npm test sem dependencias extras.
- Testes validam isolamento por owner.

### Etapa 6. Integracao frontend minima

Arquivos a criar/alterar:

- frontend/src/App.jsx
- frontend/src/components/*
- frontend/src/services/*
- frontend/vite.config.js

Criterios de aceite:

- Usuario consegue enviar, listar e baixar documentos pela UI.
- Frontend usa /api e nao URL hardcoded de backend.
- Erros de API aparecem com mensagens claras.

### Etapa 7. Hardening e documentacao final

Arquivos a criar/alterar:

- docs/specs/dms-spec.md
- README.md

Criterios de aceite:

- Documentacao descreve variaveis de ambiente, fluxo e limitacoes.
- Contratos de API e modelo de dados estao consistentes com implementacao.
- Restricoes do projeto (local storage + metadados em memoria) explicitadas.
