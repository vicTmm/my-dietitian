# Base · seu ritmo, sua nutrição

MVP de um hub nutricional para duas pessoas: planejamento e compras, sem exigir diário de consumo. Interface em português, React + TypeScript e backend Python FastAPI.

## Rodar agora

Requer Node 20.19+ (ou 22.12+) e Python 3.10+.

```sh
npm install
npm run dev
```

Abra http://localhost:5173 e escolha **Victor** ou **Júlia**. São perfis demonstrativos sem senha; as informações ficam isoladas por perfil no localStorage deste navegador. Começam com um plano de exemplo e sem registros de hábitos inventados.

## O que funciona

- Visão geral, semana atual, refeição do plano e totais nutricionais planejados.
- Criação, remoção e edição de refeições, horários, porções, ingredientes, macros e opções de troca.
- Nome, notas e histórico de nomes das versões do plano.
- Compras agregadas por ingrediente e unidade para 1–14 dias, itens extras, categorias, busca, filtros, checklist e exportação TXT.
- Água com incrementos de 250/500 ml e desfazer, meta personalizada, suplementos e hábitos editáveis, check-in diário.
- XP calculado pelos registros reais da demonstração, níveis, conquistas e gráfico semanal. Desfazer recalcula pontos.
- Perfis separados, persistência local e exportação JSON dos dados pessoais.
- Layout responsivo, navegação móvel, foco visível, diálogos Radix acessíveis e fonte Manrope local.

Os dados nutricionais são ilustrativos. As imagens de pratos são fotografias ilustrativas do Unsplash e podem diferir das refeições descritas. Substituições não representam equivalência nutricional. Não há cálculo de prescrição ou dosagem de suplementos.

## Python

O frontend funciona sozinho no modo mock. A API Python fornece health check, documentação OpenAPI e cálculo validado de lista de compras sem armazenar informações pessoais.

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn api.index:app --reload --port 8000
```

- `GET /api/health`
- `GET /api/docs`
- `POST /api/shopping-list` com `{ "days": 5, "ingredients": [{ "name": "Banana", "quantity": 1, "unit": "un", "category": "Hortifruti" }] }`

O Vite encaminha `/api` para a porta 8000 no desenvolvimento. O frontend calcula a lista localmente enquanto está no modo mock; a API é uma fundação independente para a evolução.

## Conectar Supabase

1. Crie o projeto e execute `supabase/schema.sql` uma vez no SQL Editor. As cinco tabelas já têm Row Level Security com `auth.uid()`.
2. Copie `.env.example` para `.env.local`. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com a URL e chave pública do projeto. Nunca use `service_role` no frontend.
3. Reinicie o Vite. O login troca automaticamente dos perfis demo para e-mail/senha com cadastro e confirmação de e-mail. Configure as URLs de redirecionamento no painel do Supabase.
4. **A autenticação fica real, mas os dados do plano ainda ficam locais nesta versão.** Conecte o adaptador de persistência (`src/lib/storage.ts` e o estado em `src/App.tsx`) às tabelas. Use a sessão do usuário e RLS, migre os dados locais apenas com escolha explícita e implemente estados de carregamento, erro e conflitos antes de tratar como sincronização em produção.

Não use os perfis demo como isolamento de segurança em um computador compartilhado. Eles servem para testar o MVP; os dados podem ser acessados nas ferramentas do navegador.

## Vercel

Importe o repositório com preset **Vite**, build `npm run build` e saída `dist`. `vercel.json` roteia `/api/*` para a função Python e o restante para a aplicação. `requirements.txt` define as dependências Python. Adicione as variáveis Supabase quando desejar ativar a autenticação. Não há dependência de servidor persistente ou arquivos gravados na função. O deploy não foi publicado nesta implementação.

## Validação

```sh
npm run build
npm test
npx playwright install chromium  # se necessário
npm run test:e2e
.venv/bin/python -m pytest tests/test_api.py
```

Os testes de navegador cobrem desktop e celular: entrada, persistência, edição do plano, substituições, compras, exportação, hábitos, XP e isolamento entre os perfis. Capturas ficam em `test-results/` (não versionadas).

## Organização

- `src/App.tsx`: telas e estado da demonstração.
- `src/components/ui`: componentes no padrão shadcn (Radix, CVA e composição).
- `src/lib/data.ts`: tipos, plano de exemplo e funções de domínio.
- `src/lib/storage.ts`: persistência local versionada e exportação.
- `src/lib/supabase.ts`: cliente opcional.
- `api/index.py`: API FastAPI sem estado.
- `supabase/schema.sql`: modelo relacional e políticas RLS.
- `PRODUCT.md`, `DESIGN.md`: decisões de produto e sistema visual.

Skills aplicadas: find-skills, Impeccable e Vercel React Best Practices. O repositório Papaia indicado não pôde ser lido publicamente; nenhum código foi copiado. O deep research do Gemini não foi fornecido.
