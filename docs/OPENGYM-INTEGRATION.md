# Treinos Numa

Referência funcional: openGym, consultado em 2026-11-06. Implementação própria em React/TypeScript. Esta versão não oferece paridade integral com openGym.

## Disponível

- Rotinas editáveis, cópia, reordenação de exercícios, dias da semana e rotação na ordem das rotinas.
- Biblioteca local com 876 exercícios, busca por nome/músculo, filtros por equipamento e músculo. Fotos de posições e instruções em inglês, conforme a fonte.
- Exercícios personalizados, força, duração e cardio. Grupos de superset identificados por uma letra/nome; descanso ao concluir série do último exercício do grupo.
- Séries normais, aquecimento, drop set e rest-pause, RPE/RIR opcionais, duplicação e remoção de séries. Os tipos classificam registros; não geram prescrição automática.
- Sessão persistida por perfil, retomada e cargas anteriores. Séries de cardio/duração exigem tempo preenchido para finalizar.
- Histórico com edição de nome, data, valores e séries; recordes recalculados. Aquecimentos e cardio não entram no volume de força ou recordes de carga.
- Gráficos de carga máxima, volume e peso corporal, valores em tabela expansível e mapa frente/costas da distribuição de séries por músculo cadastrado.
- Exportação JSON/CSV, importação JSON validada com prévia, importação CSV de força por cabeçalhos de Strong/Hevy/FitNotes em kg. Formatos/linhas incompatíveis são rejeitados antes da gravação. CSV não substitui o backup JSON completo.
- Importação mescla novos identificadores e preserva registros locais existentes, inclusive treino ativo. Reimportar a mesma sessão CSV não a duplica.
- Sincronização manual por conta: consultar snapshot, incorporar novos registros, enviar versão local ou restaurar backup remoto após confirmação e download de segurança. Revisão otimista impede sobrescrever uma alteração concorrente. Não há mesclagem automática por campo.

## Ativação da nuvem

Este workspace não possui `.env` com credenciais Supabase. Por isso a nuvem não foi ativada nem testada contra um banco real.

1. Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` conforme `.env.example`.
2. Aplicar `supabase/migrations/202611060001_training_snapshots.sql` no projeto Supabase.
3. Entrar com uma conta real nos dois dispositivos. Perfis de demonstração continuam locais.
4. Em Dados e sincronização, consultar a nuvem e enviar/restaurar explicitamente. Para propagar correções ou exclusões existentes, usar restauração; incorporação preserva versões locais.

A tabela usa RLS por `auth.uid()`, acesso apenas autenticado e revisão para conflitos. Validar isolamento entre duas contas antes de liberar produção.

## Fontes e licenças

Catálogo e fotos: https://github.com/yuhonas/free-exercise-db, Unlicense, aviso em `public/exercises/LICENSE.md`. JSON local; fotos externas precisam de internet. As fotos não são animações e o catálogo não é o mesmo catálogo do openGym.

Geometria do mapa: MuscleMap por Melih Colpan (MIT), convertida para paths no openGym. Somente a geometria foi reutilizada, com licença preservada em `public/exercises/MuscleMap-NOTICE.md`.

Nenhuma mídia Gym Visual do openGym foi copiada. Essas animações exigem licença própria para uso na Numa.

## Limites

Integrações com relógios/apps nativos, coach/admin, progressão automática de cargas, planos de exemplo, estimativa de recuperação e importação de mídias pessoais não estão nesta implementação. Supersets são agrupamentos explícitos, sem guia automático que alterne telas. O mapa representa séries registradas, não recuperação ou diagnóstico.

## Verificação

Testes unitários para ciclo de treino, volume, recordes, importação inválida, CSV com aspas, deduplicação e preservação de treino ativo. Fluxos Playwright de treino/retomada/isolamento e biblioteca/tempo/edição/gráficos em desktop e mobile.
