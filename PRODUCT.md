# Numa — plataforma de jornadas e desafios
<!-- impeccable:product-schema 1 -->

## Platform
Web. Protótipo em React + TypeScript + Vite, API Python FastAPI e persistência local. Supabase está preparado no código, mas os dados de rotina ainda não são sincronizados.

## Audience
Pessoas que querem criar consistência em saúde e bem-estar junto de alguém. Dois contextos iniciais: casais que compartilham uma jornada privada e comunidades que participam de desafios conduzidos por um criador, treinador ou influenciador.

## Product Purpose
Ajudar pessoas a transformar uma intenção em uma jornada com começo, ritmo e acompanhamento compartilhado. O produto oferece espaços pessoais e objetivos comuns, sem exigir que todos tenham a mesma rotina.

## Product Model
- **Jornada de casal:** espaço privado de duas pessoas, com metas individuais, combinados compartilhados, check-ins e incentivo mútuo.
- **Desafio de comunidade:** um anfitrião define o tema, período, regras e ritmo; participantes entram, acompanham a própria consistência e celebram progresso coletivo. O formato de 30 dias é uma opção de lançamento, não uma limitação estrutural.
- **Núcleo comum:** jornadas, metas, atividades, check-ins, progresso, privacidade e celebrações. Conteúdo e regras pertencem a cada jornada; nutrição ou treino são possibilidades, não a definição do produto inteiro.

## Core Experience
1. Escolher uma jornada por convite ou participar de um desafio.
2. Entender objetivo, duração, regras, privacidade e compromisso antes de entrar.
3. Definir metas pessoais compatíveis com o tema comum.
4. Registrar uma atividade ou check-in com poucos passos.
5. Ver a própria sequência e o progresso coletivo conforme as regras da jornada.
6. Receber incentivo e celebrar o encerramento, sem transformar uma falta em fracasso moral.

## Challenge Host Experience
O anfitrião cria uma página de desafio com título, contexto, início/fim, atividades aceitas, frequência, critérios de pontuação e regras de privacidade. Pode convidar participantes, publicar orientações, acompanhar adesão e encerrar o desafio. Pagamento, prêmios, sorteios, moderação em escala e gestão de patrocinadores não são premissas do MVP; precisam de validação separada antes de virarem funcionalidades.

## Couple Experience
Uma pessoa cria o espaço e convida a outra. Cada pessoa mantém metas e registros próprios; ambas veem apenas os elementos que decidiram compartilhar. O casal pode definir um compromisso comum e apoiar-se sem comparar corpos, peso ou desempenho.

## Existing Prototype
O protótipo oferece planejamento alimentar, compras, hábitos e o primeiro núcleo de treino (rotinas, registro de séries, histórico, recordes simples e peso corporal), com perfis locais de Lívia Sardenberg e Victor Hugo Araujo. Esses recursos são uma base exploratória para jornadas; ainda não implementam convites, espaços compartilhados, desafios, contas de criador ou sincronização multiusuário. Dados continuam no navegador e não são uma autenticação segura.

## Product Principles
- Participação é voluntária; o progresso deve reconhecer constância, adaptação e retorno.
- Metas individuais coexistem com um propósito comum.
- Transparência antes da entrada: duração, atividades, pontuação, custos e uso dos dados são explícitos.
- Rankings e recompensas são opcionais e nunca expõem dados sensíveis sem escolha clara.
- Sem vergonha, punição por sequência interrompida ou peso corporal como medida de valor pessoal.
- Informação nutricional demonstrativa não é prescrição; sem recomendações clínicas automatizadas.
- Primeiro valide se participantes voltam e se os anfitriões conseguem conduzir uma jornada; depois expanda integrações.

## Brand Commitments
Identidade Numa: gatinha expressiva, com linguagem adulta e acolhedora. O app usa carvão, solar, papel e creme, com Bricolage Grotesque e Inter. O nome de marca não foi verificado em bases de registro, domínios ou redes sociais.

## Success Signals to Validate
- Visitante entende o desafio e as regras antes de participar.
- Conversão de convite/visita para entrada e conclusão do onboarding.
- Participantes ativos ao longo da jornada, retorno semanal e conclusão.
- Anfitrião consegue criar e acompanhar um desafio sem suporte manual constante.
- Casais usam o espaço conjunto sem perda de autonomia individual.

## Reference
- No Zero Days · Gym Rats Challenge, https://nozerodays-nic.vercel.app/ (consultado em 2026-11-06): exemplo de campanha de 30 dias com treinos, pontos, ranking, sorteios semanais, prêmios e preço de entrada anunciado. Referência de mecânica e apresentação, não especificação para copiar.
- openGym, https://github.com/DuarteSantos8/openGym: referência funcional para registro e evolução de treino; não define a proposta central da plataforma.
