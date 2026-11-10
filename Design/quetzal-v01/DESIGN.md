# My Dietitian — identidade quetzal, v01

Proposta de identidade criada em 2026-11-06. Referência solicitada: quetzal da Likiro; linguagem de ilustração e organização do kit: Vinky. Nome definitivo do produto e nome do personagem ainda não definidos. Likiro identifica a referência, não renomeia este projeto.

## Conceito

Um companheiro para organizar a rotina: refeições, compras, dinheiro e hábitos. Expressivo e acolhedor, sem tratar o adulto como criança. A ave conecta os módulos; sua presença deve orientar, acolher e celebrar pequenos avanços.

## Arquivo principal

`assets/quetzal-principal-v01.png`: ilustração raster com fundo transparente. Preservar o original como referência visual para novas poses. Não é um vetor editável por partes. O prompt de geração está em `PROMPT.md`; as decisões de implementação estão neste documento e em `tokens.json` / `tokens.css`.

## Construção do personagem

Cabeça e corpo verdes; asas verde-floresta; pequeno topete de penas; peito coral; bico e pés amarelos; duas penas longas na cauda. Olhos claros e expressivos, contorno escuro e volumes simplificados. Uma asa cumprimenta. Manter essas características em futuras poses, usando sempre o PNG principal como referência.

Não transformar asas em mãos humanas. Não adicionar roupas ou acessórios permanentes a cada módulo. Preservar o comprimento e a leitura da cauda. Para avatar pequeno, produzir futuramente uma composição dedicada de cabeça e topete; não reduzir o corpo inteiro a favicon.

## Paleta proposta para a interface

As cores abaixo são tokens do sistema, não amostras exatas de todos os pixels da ilustração.

| Papel | Cor | Aplicação |
|---|---|---|
| Papel | `#F8F7F2` | Fundo principal |
| Superfície | `#FFFFFF` | Áreas de conteúdo |
| Tinta | `#142D25` | Texto principal e contornos |
| Floresta | `#145C43` | Ação principal, com texto branco |
| Esmeralda | `#19A775` | Ilustração e detalhes decorativos |
| Lima | `#B6D85A` | Pequenos acentos, com texto tinta |
| Coral | `#D9574F` | Peito do personagem e acentos |
| Ouro | `#F2BE42` | Bico, pés e destaques, com texto tinta |
| Texto secundário | `#53665D` | Legendas e metadados |

Não usar coral automaticamente para gasto: despesa normal não é erro. Estados precisam de texto ou ícone além de cor. Reservar verde-floresta para ação e confirmação; esmeralda não é fundo para texto branco pequeno.

## Tipografia e composição

Direção herdada da Vinky: Bricolage Grotesque 600–800 em títulos; Inter 400–600 em controles, texto e dados. Configuração disponível nos tokens; arquivos de fonte não incluídos neste kit. Usar fallback de sistema até instalar as fontes. Valores monetários e quantidades usam numerais tabulares.

Texto base 16 px, entrelinha 1,5. Espaçamentos 4, 8, 12, 16, 24, 32 e 48 px. Controles com altura mínima 44 px. Cantos de controles 10 px; superfícies 16 px. Usar hierarquia de títulos e espaço antes de adicionar contêineres. Um CTA principal por etapa. Foco visível, contraste de texto verificado na implementação e suporte a movimento reduzido.

## Presença nos módulos

| Módulo | Papel do mascote | Exemplo de voz |
|---|---|---|
| Planejamento alimentar | Acolher no primeiro planejamento | “Vamos organizar suas refeições da semana?” |
| Lista de compras | Apresentar a lista consolidada | “Sua lista está pronta para conferir.” |
| Controle financeiro | Explicar o resumo de gastos | “Veja quanto entrou e quanto saiu neste mês.” |
| Hábitos | Incentivar continuidade sem culpa | “Hoje é uma nova oportunidade de continuar.” |

Exibir a pose principal em boas-vindas e estados vazios. Em tabelas, lançamentos e formulários, priorizar os dados. Celebrações devem ser breves e opcionais. Não usar vergonha, peso corporal como valor moral ou punição por interromper sequências.

## Implementação

1. Copiar `assets/quetzal-principal-v01.png` para o diretório público da aplicação e preservar este original.
2. Importar `tokens.css` ou mapear `tokens.json` para o sistema visual escolhido.
3. Renderizar com proporção original, `object-fit: contain` e margem livre mínima de 8% da largura da imagem. Usar superfície clara para preservar a leitura do contorno escuro.
4. Informar dimensões intrínsecas ao componente de imagem para evitar deslocamento de layout. Se a imagem for apenas decorativa, usar texto alternativo vazio; se identificar o personagem, usar “Mascote quetzal”.
5. Revisar no celular antes de adotar. O PNG principal não substitui logo, favicon, avatar ou sprite de animação; esses são derivados futuros.

## Referências e escopo

- Produto: https://github.com/vicTmm/my-dietitian — repositório consultado com README inicial.
- Inspiração funcional: https://github.com/DuarteSantos8/openGym — acompanhamento de treinos e peso; não foi copiado código para este kit.
- Referências locais consultadas: `rewards-app/Design/references/likiro-quetzal.png`, `rewards-app/Design/brandkit/mascote/vinky-cool-estudo-01.png` e documentação da marca Vinky.

Entrega de identidade para implementação futura. Não inclui aplicativo, telas implementadas, publicação ou animações. Novas poses devem ser comparadas com a imagem principal para verificar consistência.
