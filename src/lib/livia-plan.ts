import type { Meal } from './data';

// Transcrição da prescrição de Elen Menezes, 20/01/2026. Sem estimativas nutricionais.
const meal = (id: string, time: string, name: string, description: string, ingredients: Meal['ingredients'], alternative: string): Meal => ({
  id, time, name, title: name, description, ingredients, alternative,
  kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, nutritionMissing: true,
  image: `/images/${id === 'lunch' ? 'lunch' : id === 'dinner' ? 'dinner' : 'snack'}.jpg`,
});
const item = (name: string, quantity: number, unit: string, category: string): Meal['ingredients'][number] => ({ name, quantity, unit, category });
export const liviaPlanName = 'Lívia · prescrição de 20/01/2026';
export const liviaPlanNote = 'Elen Menezes · 6 refeições. Água: 2–3 litros/dia (meta inicial: 2,5 L). Calorias e macros não informados no documento. Compras consideram a opção principal; quantidades são as prescritas, sem conversão para peso cru. Vegetais à vontade e temperos devem ser acrescentados conforme a escolha.';
export const liviaGuidance = [
  'Metas de alimentação: seguir mais de 90% do planejamento; uma refeição livre em um dia do fim de semana; não pular refeições; mastigar bem; comer sem TV, computador ou celular; mais vegetais e proteínas e menos carboidratos; comprar os produtos do plano; manter diário alimentar.',
  'Atividade física, conforme orientação profissional: pelo menos 30 minutos, 5 vezes por semana; pelo menos 20 dias no mês; usar mais escadas e fazer atividades ao ar livre nos fins de semana.',
  'Vegetais A (à vontade no almoço e jantar): abobrinha, acelga, agrião, aipo, alface, almeirão, aspargo, berinjela, bertalha, brócolis, couve, chicória, couve-flor, espinafre, jiló, maxixe, palmito, pepino, pimentão, rabanete, repolho e tomate.',
  'Vegetais B: abóbora, beterraba, cenoura, chuchu, ervilha-verde, nabo, quiabo, petit-pois e vagem. Almoço: 60 g (4 colheres de sopa). Jantar: 100 g (5 colheres de sopa).',
  'Não ingerir líquidos durante as refeições. Aguardar 30 minutos após almoço e jantar para a bebida prescrita. Usar temperos naturais; evitar temperos prontos. Quando usar farinha de trigo ou maisena na preparação, reduzir uma colher de sopa do arroz prescrito. Não retirar nem acrescentar refeições ou alimentos prescritos.',
  'O documento orienta evitar açúcar, doces, tortas, sorvetes, refrigerantes, frituras, empanados e álcool. Café, chá verde, chá branco, mate e limonada: à vontade com sucralose ou estévia. Preferir carnes brancas e magras, queijos magros e laticínios desnatados; moderar sal e molhos prontos; ler os rótulos.',
  'Ao comer fora: comer com calma; preferir buffet ou restaurante a quilo; começar com fruta e salada; escolher saladas cruas ou no vapor e carnes grelhadas; dispensar couvert; preferir acompanhamentos leves e molhos vermelhos para massas. Levar lanches para o trabalho. Levar este planejamento à próxima consulta.',
  'Metas de medidas registradas no PDF para 30 dias: “Peso ponderal de 5 kg”, manter massa magra, perder 4–5 kg de gordura e média de 1.000 g de peso por semana. São metas do documento de janeiro de 2026, não metas atuais calculadas pela plataforma.',
];
export const liviaMeals: Meal[] = [
  meal('breakfast', '05:30', 'Desjejum', 'Crepioca: 2 ovos + 40 g de goma de tapioca + 30 g de queijo minas; temperos a gosto e 1 xícara de café preto.', [
    item('Ovos', 2, 'un', 'Proteínas'), item('Goma para tapioca', 40, 'g', 'Despensa'), item('Queijo minas', 30, 'g', 'Laticínios'), item('Café preto', 1, 'xícara', 'Despensa'),
  ], 'Na crepioca: substituir o queijo por 30 g de creme de ricota ou cottage. Preparo: bater ovos e goma, dourar dos dois lados em frigideira com um pouco de azeite, rechear e dobrar; temperar a gosto com tomate, cebola, orégano, salsinha, cebolinha ou cúrcuma. Opção 2: 2 ovos mexidos + ½ mamão papaia ou 1 banana prata + 1 colher de sopa de chia ou aveia + 1 colher de sopa de mel + 1 xícara de café preto. Opção 3: 100 g de iogurte zero ou 160 g de iogurte desnatado + 100 g de fruta.'),
  meal('collation', '09:00', 'Colação', '1 barra de proteína Bold, no sabor de preferência.', [item('Barra de proteína Bold', 1, 'un', 'Despensa')], '1 porção de iogurte proteico OU 1 scoop de whey protein + 2 castanhas-do-pará. Marcas de whey citadas: Evolution 2W, Black Skull 4HD, Elite Dymatize, Cellucor, Universal, Optimun, Bio Whey Performance e Gaspari.'),
  meal('lunch', '12:00', 'Almoço', 'Vegetais A à vontade + 60 g de vegetal B + azeite + 70 g de arroz + 100 g de carne vermelha. Suco cítrico: 200 ml, 30 minutos depois.', [
    item('Vegetal B (escolher na lista)', 60, 'g', 'Hortifruti'), item('Azeite extravirgem', 1, 'colher de sobremesa', 'Despensa'), item('Arroz branco ou integral (porção do plano)', 70, 'g', 'Grãos e sementes'), item('Carne vermelha', 100, 'g', 'Proteínas'), item('Suco de fruta cítrica', 200, 'ml', 'Bebidas'),
  ], 'Carboidrato: 70 g de arroz branco/integral ou macarrão integral (2 colheres de sopa cheias), OU 120 g de batata, aipim ou inhame. Proteína: 100 g de carne vermelha OU 120 g de frango OU 150 g de peixe. Salada: alface, tomate, pepino e palmito; pode acrescentar brócolis ou couve-flor. Usar azeite e temperos naturais.'),
  meal('snack', '16:00', 'Lanche', '1 porção de cappuccino diet ou light.', [item('Cappuccino diet ou light', 1, 'porção', 'Bebidas')], 'Demais opções apresentadas no lanche: 1 fatia de bolo de milho (100 g) + 1 xícara de café preto ou chá de hortelã; 40 g de biscoito de polvilho + 1 copo de chá verde gelado zero; 1 xícara de leite de amêndoas + 1 xícara de corn flakes; 160 g de iogurte natural sem lactose + 100 g de morangos ou mirtilos; 1 banana + 1 colher de sopa de chia + 1 colher de sopa de whey protein + canela em pó a gosto. O PDF distribui essas opções entre as páginas 4–6, sem numeração.'),
  meal('dinner', '20:00', 'Jantar', 'Vegetais A à vontade + 100 g de vegetal B + azeite + 120 g de frango. Bebida: 200 ml, 30 minutos depois.', [
    item('Vegetal B (escolher na lista)', 100, 'g', 'Hortifruti'), item('Azeite extravirgem', 1, 'colher de sobremesa', 'Despensa'), item('Frango', 120, 'g', 'Proteínas'), item('Suco de limão ou mate zero ou Ice Tea', 200, 'ml', 'Bebidas'),
  ], 'Proteína: 120 g de frango OU 160 g de peixe (tilápia, dourado, namorado ou atum) OU 4 claras. Salada como no almoço. Opção 2, denominada “shake proteico low carb” no PDF: 100 g de iogurte natural sem lactose + 5 morangos congelados + 50 ml de leite vegetal + 5 pedras de gelo + 1 colher de sopa de eritritol ou sucralose a gosto. Bater tudo até ficar homogêneo, beber imediatamente, sem coar. Opção 3: 10 biscoitos de arroz com guacamole (quantidade de guacamole não informada).'),
  meal('supper', '23:00', 'Ceia', '1 taça de gelatina zero + 2 ameixas secas.', [item('Gelatina zero', 1, 'taça', 'Despensa'), item('Ameixa seca', 2, 'un', 'Hortifruti')], 'Manter a gelatina e substituir as 2 ameixas secas por 2 rodelas de abacaxi OU 5 damascos.'),
];

// Preferências relatadas pelo usuário; não fazem parte da prescrição de janeiro.
export const liviaFoodPreferences = {
  avoid: ['Iogurte', 'Ovo cozido', 'Laticínios com lactose'],
  occasional: ['Barra de proteína Bold'],
  favorites: ['Frango teriyaki', 'Estrogonofe', 'Poke', 'Carne moída com purê de batata', 'Arroz e feijão', 'Macarrão ao molho gorgonzola', 'Macarrão com maionese e atum'],
};
