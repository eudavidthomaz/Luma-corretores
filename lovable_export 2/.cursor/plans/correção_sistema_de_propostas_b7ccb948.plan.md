---
name: Correção Sistema de Propostas
overview: "Corrigir problemas críticos no sistema de propostas: salvamento, exibição no frontend, implementar upload de contratos e restaurar o fluxo completo de aprovação e assinatura."
todos:
  - id: fix-proposal-save
    content: Corrigir salvamento de propostas em EditProposalPage.tsx - adicionar validações, melhorar tratamento de erros e garantir que itens são criados corretamente
    status: pending
  - id: fix-proposal-display
    content: Corrigir exibição de propostas no frontend - verificar query useProposals, adicionar refetch automático e melhorar tratamento de erros
    status: pending
  - id: fix-signature-flow
    content: Corrigir fluxo de assinatura na edge function - validar base64, melhorar tratamento de erros de upload e verificar políticas RLS
    status: pending
  - id: implement-contract-upload
    content: Implementar upload de arquivo de contrato (PDF/DOC) - criar componente ContractFileUpload, hook useUploadContractFile e adicionar campo contract_file_url na tabela
    status: pending
    dependencies:
      - fix-proposal-save
  - id: add-validations
    content: Adicionar validações - proposta com pelo menos 1 item, contrato existente antes de enviar, formato de email válido
    status: pending
    dependencies:
      - fix-proposal-save
      - fix-proposal-display
  - id: test-complete-flow
    content: Testar fluxo completo - criação, exibição, aprovação pública, assinatura e upload de comprovante
    status: pending
    dependencies:
      - fix-proposal-save
      - fix-proposal-display
      - fix-signature-flow
---

# Plano de Correção e Implementação - Sistema de Propostas

## Problemas Identificados

### 1. Propostas não são salvas

- **Causa provável**: Erros silenciosos na mutation ou problemas de RLS
- **Local**: `src/pages/admin/EditProposalPage.tsx` (linha 163-302)
- **Sintoma**: Propostas criadas não aparecem no banco de dados

### 2. Propostas não aparecem no frontend

- **Causa provável**: Problemas na query ou cache do React Query
- **Local**: `src/hooks/useProposals.ts` (linha 18-40)
- **Sintoma**: Lista de propostas vazia mesmo com dados no banco

### 3. Upload de contrato não implementado

- **Causa**: Funcionalidade nunca foi criada
- **Local**: `src/components/proposals/ContractEditor.tsx`
- **Sintoma**: Apenas edição de texto, sem opção de upload de arquivo

### 4. Fluxo de aprovação/assinatura quebrado

- **Causa provável**: Erros na edge function ou validações faltando
- **Local**: `supabase/functions/proposal-public/index.ts`
- **Sintoma**: Cliente não consegue aprovar ou assinar

## Correções Necessárias

### Fase 1: Corrigir Salvamento de Propostas

**Arquivo**: `src/pages/admin/EditProposalPage.tsx`

1. **Melhorar tratamento de erros**:

- Adicionar validação explícita de `profile_id` antes de salvar
- Verificar se `public_token` é gerado automaticamente pelo banco
- Adicionar logs detalhados para debug

2. **Corrigir criação de itens**:

- Garantir que itens só sejam criados após proposta ser salva com sucesso
- Adicionar rollback em caso de erro ao criar itens
- Validar que `proposal_id` existe antes de inserir itens

3. **Melhorar feedback ao usuário**:

- Mostrar erros específicos do Supabase
- Adicionar loading states mais claros

### Fase 2: Corrigir Exibição no Frontend

**Arquivo**: `src/hooks/useProposals.ts`

1. **Verificar query**:

- Garantir que `profile_id` está sendo passado corretamente
- Adicionar tratamento de erro mais robusto
- Verificar se RLS está permitindo SELECT

2. **Adicionar refetch automático**:

- Invalidar cache após criar/atualizar proposta
- Adicionar refetchOnWindowFocus

**Arquivo**: `src/pages/admin/AdminProposals.tsx`

1. **Melhorar estado de loading**:

- Mostrar skeleton enquanto carrega
- Tratar estado de erro explicitamente

### Fase 3: Implementar Upload de Contrato

**Novo componente**: `src/components/proposals/ContractFileUpload.tsx`

1. **Criar componente de upload**:

- Permitir upload de PDF, DOC, DOCX
- Mostrar preview do arquivo
- Opção de remover arquivo

2. **Integrar com ContractEditor**:

- Adicionar tab "Upload" ao lado de "Editar"
- Salvar URL do arquivo no campo `contract_content` ou novo campo `contract_file_url`
- Permitir escolher entre texto ou arquivo

3. **Storage**:

- Usar bucket `proposal-files` existente
- Criar hook `useUploadContractFile` similar a outros uploads

**Arquivo**: `src/pages/admin/EditProposalPage.tsx`

1. **Adicionar estado para arquivo**:

- `contractFileUrl` para URL do arquivo
- `contractFile` para arquivo selecionado

2. **Modificar salvamento**:

- Se arquivo foi enviado, salvar URL
- Se texto foi editado, salvar texto

**Arquivo**: `supabase/migrations/` (nova migration)

1. **Adicionar campo opcional**:

- `contract_file_url TEXT` na tabela `proposals`
- Migration para adicionar coluna

### Fase 4: Corrigir Fluxo de Aprovação/Assinatura

**Arquivo**: `supabase/functions/proposal-public/index.ts`

1. **Corrigir handleSignContract**:

- Verificar se `base64Data` está sendo extraído corretamente (linha 384)
- Adicionar validação de tamanho da assinatura
- Melhorar tratamento de erros de upload

2. **Verificar políticas RLS**:

- Garantir que políticas permitem criação de contratos
- Verificar se bucket `proposal-files` existe e tem permissões corretas

**Arquivo**: `src/pages/PublicProposalPage.tsx`

1. **Melhorar tratamento de erros**:

- Mostrar mensagens de erro mais claras
- Adicionar retry para operações críticas

2. **Corrigir fluxo de estados**:

- Garantir que transições de estado são corretas
- Adicionar validações antes de mudar de step

### Fase 5: Melhorias Gerais

1. **Validações**:

- Validar que proposta tem pelo menos 1 item antes de enviar
- Validar que contrato (texto ou arquivo) existe antes de enviar
- Validar formato de email do cliente

2. **Testes**:

- Testar criação de proposta completa
- Testar fluxo público de aprovação
- Testar assinatura e upload de comprovante

3. **Documentação**:

- Adicionar comentários em código complexo
- Documentar fluxo de estados da proposta

## Arquivos a Modificar

### Frontend

- `src/pages/admin/EditProposalPage.tsx` - Corrigir salvamento
- `src/hooks/useProposals.ts` - Corrigir query
- `src/pages/admin/AdminProposals.tsx` - Melhorar exibição
- `src/components/proposals/ContractEditor.tsx` - Adicionar upload
- `src/components/proposals/ContractFileUpload.tsx` - **NOVO**
- `src/hooks/useUploadContractFile.ts` - **NOVO**
- `src/pages/PublicProposalPage.tsx` - Corrigir fluxo

### Backend

- `supabase/functions/proposal-public/index.ts` - Corrigir assinatura
- `supabase/migrations/` - Adicionar campo `contract_file_url`

### Storage

- Verificar se bucket `proposal-files` existe
- Verificar políticas de acesso

## Ordem de Implementação

1. **Fase 1** - Corrigir salvamento (crítico)
2. **Fase 2** - Corrigir exibição (crítico)
3. **Fase 4** - Corrigir fluxo de assinatura (crítico)
4. **Fase 3** - Implementar upload de contrato (nova funcionalidade)
5. **Fase 5** - Melhorias e testes

## Validações Pós-Implementação

- [ ] Proposta é salva no banco de dados
- [ ] Proposta aparece na lista do admin
- [ ] Link público funciona e mostra proposta
- [ ] Cliente consegue aprovar proposta
- [ ] Cliente consegue preencher dados e assinar
- [ ] Assinatura é salva corretamente
- [ ] Upload de comprovante funciona
- [ ] Upload de contrato (PDF/DOC) funciona (se implementado)