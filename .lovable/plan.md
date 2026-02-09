

# Clean URLs para saibamais.app - Roteamento no React

## Diagnóstico

O arquivo `_redirects` funciona com Netlify, mas **Lovable Cloud não processa essas regras** da mesma forma. A rota `saibamais.app/after` chega ao React Router como `/after`, que não corresponde a nenhuma rota definida (somente `/p/:slug` existe).

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  FLUXO ATUAL (QUEBRADO)                                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Usuário acessa: https://saibamais.app/after
                          │
                          ▼
  _redirects deveria reescrever para: /p/after
                          │
                          ▼
  Mas Lovable Cloud ignora _redirects
                          │
                          ▼
  React Router recebe: /after → Não existe → 404!
```

## Solução

Implementar a lógica de Clean URLs diretamente no React, com dois componentes:

1. **Componente `CleanUrlRedirect`** - Detecta domínio alternativo e redireciona
2. **Rota catch-all inteligente** - Substitui a rota 404 padrão

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  FLUXO CORRIGIDO                                                        │
└─────────────────────────────────────────────────────────────────────────┘

  Usuário acessa: https://saibamais.app/after
                          │
                          ▼
  React Router: rota /* (catch-all)
                          │
                          ▼
  CleanUrlRedirect detecta:
  - hostname = saibamais.app ✓
  - path = /after (não é rota reservada)
                          │
                          ▼
  Renderiza <ProfilePage slug="after" />
                          │
                          ▼
  Perfil exibido com sucesso!
```

---

## Arquivos a Criar/Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/routing/CleanUrlHandler.tsx` | **NOVO** - Componente para detectar domínio e rotear |
| `src/App.tsx` | Substituir catch-all `*` pelo handler inteligente |

---

## Implementação

### 1. CleanUrlHandler.tsx (NOVO)

```typescript
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";

// Domínios que usam Clean URLs (sem /p/ prefix)
const CLEAN_URL_DOMAINS = ["saibamais.app", "www.saibamais.app"];

// Rotas reservadas que NÃO devem ser tratadas como slugs
const RESERVED_ROUTES = [
  "/admin",
  "/auth",
  "/chat",
  "/embed",
  "/p/",
  "/g/",
  "/proposta/",
  "/privacy",
  "/terms",
];

export function CleanUrlHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const hostname = window.location.hostname;
  const path = location.pathname;

  // Check if we're on a clean URL domain
  const isCleanUrlDomain = CLEAN_URL_DOMAINS.includes(hostname);

  // Check if the path is a reserved route
  const isReservedRoute = RESERVED_ROUTES.some(
    (route) => path === route || path.startsWith(route)
  );

  // On clean URL domains, block admin/auth routes (security)
  useEffect(() => {
    if (isCleanUrlDomain) {
      if (path.startsWith("/admin") || path === "/auth") {
        navigate("/", { replace: true });
      }
    }
  }, [isCleanUrlDomain, path, navigate]);

  // If on clean URL domain and path is not reserved
  if (isCleanUrlDomain && !isReservedRoute && path !== "/") {
    // Extract slug from path (e.g., /after -> after)
    const slug = path.substring(1); // Remove leading slash
    
    // If slug is valid (no nested paths), render profile
    if (slug && !slug.includes("/")) {
      return <ProfilePage />;
    }
  }

  // Root of clean URL domain redirects to showcase
  if (isCleanUrlDomain && path === "/") {
    // Navigate to showcase profile
    useEffect(() => {
      navigate("/p/afterfotografia", { replace: true });
    }, [navigate]);
    return null;
  }

  // Default: show 404
  return <NotFound />;
}
```

### 2. Atualizar App.tsx

Substituir a rota catch-all pelo novo handler:

```tsx
// Imports...
import { CleanUrlHandler } from "./components/routing/CleanUrlHandler";

// Na seção de rotas:
<Routes>
  {/* ... todas as rotas existentes ... */}
  
  {/* Catch-all inteligente - substitui NotFound simples */}
  <Route path="*" element={<CleanUrlHandler />} />
</Routes>
```

### 3. Atualizar ProfilePage para aceitar slug via URL

O `ProfilePage` já usa `useParams()` para pegar o slug, mas para Clean URLs precisamos extrair do path:

```tsx
// Em ProfilePage.tsx, atualizar para suportar ambos os modos:

export default function ProfilePage() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  
  // Para Clean URLs, extrair slug do pathname
  const cleanSlug = location.pathname.startsWith("/p/") 
    ? null 
    : location.pathname.substring(1);
  
  // Usar paramSlug (/p/:slug) ou cleanSlug (/:slug)
  const slug = paramSlug || cleanSlug;
  
  // ... resto do componente
}
```

---

## Rotas Suportadas Após Implementação

| URL | Domínio | Resultado |
|-----|---------|-----------|
| `saibamais.app/after` | Alternativo | Perfil "after" |
| `saibamais.app/p/after` | Alternativo | Perfil "after" (compatibilidade) |
| `saibamais.app/admin` | Alternativo | Redireciona para `/` (bloqueado) |
| `saibamais.app/` | Alternativo | Redireciona para showcase |
| `ligadafotografia.com/p/after` | Principal | Perfil "after" |
| `ligadafotografia.com/after` | Principal | 404 (mantém comportamento atual) |

---

## Segurança

- Rotas `/admin/*` e `/auth` são bloqueadas no domínio alternativo
- OAuth2 continua funcionando apenas em `ligadafotografia.com`
- Não há exposição de dados sensíveis

---

## Impacto

- Clean URLs funcionarão imediatamente em `saibamais.app`
- Zero impacto no domínio principal
- Compatibilidade retroativa com URLs `/p/:slug`
- O arquivo `_redirects` pode ser mantido como fallback para outros hosts

