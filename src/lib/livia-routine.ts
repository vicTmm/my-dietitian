import type { Ingredient, Meal } from './data';

export const routineSource = 'livia-home-office-v1';
export const routineName = 'Lívia · rotina prática e variada';
export const routineNote = 'Rascunho de organização alimentar para home office, com ingredientes zero lactose. Horários flexíveis e quantidades ilustrativas para compras; não são uma nova prescrição nem equivalências do PDF. Ajustar porções e metas com a nutricionista. Calorias e macros ainda não calculados.';
export const routineGuidance = [
  'Rotina: acorda às 8h e começa a trabalhar. Café da manhã pronto na véspera; almoço às 12h30; trabalho das 13h30 até 17h–17h30. Treino atualmente à noite. Os quatro horários são pontos de organização, não obrigação de comer sem fome nem limite de refeições.',
  'Na noite anterior: separar o café da manhã refrigerado, passar a marmita congelada para a geladeira e deixar os acompanhamentos separados. De manhã, pegar o café preto já programado e o café da manhã pronto. Sanduíches e potes são sugestões para experimentar; as preferências de recheio ainda podem ser ajustadas.',
  'Preparo em duas etapas: no domingo, preparar bases para segunda a quarta; na quarta à noite, repor para quinta a domingo. Cozinhar arroz, feijão, frango sem molho, carne moída e legumes; dividir em recipientes rasos. Separar os molhos para dar sabores diferentes à mesma base. Congelar as porções que não serão consumidas em até 3 dias.',
  'Conservação: refrigerar perecíveis prontamente, em até 2 horas (1 hora se o ambiente estiver acima de 32 °C). Manter a geladeira a 4 °C ou menos. Descongelar na geladeira; aquecer as marmitas até 74 °C no centro. Preparar o sanduíche e a massa fria na véspera e mantê-los refrigerados; montar saladas e poke perto de comer, com frango ou peixe bem cozido.',
  'Intolerância à lactose: usar leite, creme de leite e outros laticínios rotulados zero lactose. Não usar iogurte, inclusive zero lactose. Não presumir que um queijo é zero lactose por ser maturado. No molho de gorgonzola, usar apenas queijo azul rotulado zero lactose; sem esse produto, fazer molho de creme zero lactose com ervas. Conferir rótulos também de pães, molhos e barras.',
  'Enjoo com Mounjaro, especialmente no dia da aplicação: ter arroz, frango simples e legumes cozidos prontos, sem depender de molhos. Experimentar volumes menores, comer devagar e parar ao sentir saciedade; evitar preparações gordurosas se piorarem os sintomas. Não usar um dia de enjoo como dia de jejum. Hidratar-se em pequenos goles conforme tolerância; não alterar a dose por conta própria.',
  'Se o enjoo for persistente ou atrapalhar a alimentação, conversar com quem prescreveu Mounjaro. Vômitos repetidos ou dificuldade para manter líquidos pedem avaliação; dor abdominal forte e persistente exige atendimento imediato.',
  'Treino à noite: manter o lanche acessível ao terminar o trabalho; adaptar horário do jantar ao treino e ao conforto digestivo. Para testar treino no almoço, combinar uma janela que inclua deslocamento, treino, banho e refeição. A marmita pronta remove o tempo de cozinhar, mas não garante que tudo caiba entre 12h30 e 13h30. Não fixamos treino nem dia de aplicação sem essa informação.',
  'Compras: o ciclo começa na segunda-feira e repete após domingo; selecionar 7 dias para a semana inteira. Quantidades de arroz, massa e carnes na lista são de ingredientes crus; atum é drenado. São estimativas culinárias por pessoa, não metas nutricionais. Água: manter como referência o intervalo de 2–3 L do documento, salvo orientação individual diferente. Bold não entra na compra recorrente.',
];
export const routineSources = [
  { title: 'Mounjaro: efeitos e manejo do enjoo (Lilly)', url: 'https://mounjaro.lilly.com/side-effects' },
  { title: 'Intolerância à lactose: alimentação (NIDDK)', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/lactose-intolerance/eating-diet-nutrition' },
  { title: 'Preparo e conservação dos alimentos (FDA)', url: 'https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling' },
];
const i = (name: string, quantity: number, unit = 'g', category = 'Despensa'): Ingredient => ({name, quantity, unit, category});
const chicken = () => i('Peito de frango (cru)', 150, 'g', 'Proteínas');
const rice = () => i('Arroz (cru)', 40, 'g', 'Grãos e sementes');
const veg = () => i('Legumes para cozinhar', 100, 'g', 'Hortifruti');
const cream = () => i('Creme de leite zero lactose', 30, 'g', 'Laticínios');
const recipe = (id: string, title: string, ingredients: Ingredient[], preparation: string): Meal => ({
  id, title, name: title, time: '', description: title, ingredients, alternative: preparation,
  kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, nutritionMissing: true,
  image: '',
});
const recipes = {
  teriyaki: recipe('teriyaki', 'Frango teriyaki, arroz e brócolis', [chicken(), rice(), i('Brócolis',100,'g','Hortifruti'),i('Molho teriyaki (conferir rótulo)',10)], 'Aquecer frango, arroz e brócolis já preparados; acrescentar o molho ao servir. Se houver enjoo, usar a mesma base sem molho.'),
  stroganoff: recipe('stroganoff', 'Estrogonofe zero lactose com arroz e legumes', [chicken(),rice(),veg(),cream(),i('Passata de tomate',40),i('Champignon',30)], 'Adicionar passata, champignon e creme zero lactose ao frango da base. Preparar na etapa de cozinha e porcionar com arroz; legumes separados. No enjoo, preferir a base sem creme.'),
  poke: recipe('poke', 'Poke de frango cozido, arroz, pepino e cenoura', [chicken(),rice(),i('Pepino',60,'g','Hortifruti'),i('Cenoura',60,'g','Hortifruti'),i('Molho de soja (conferir rótulo)',5,'ml')], 'Usar frango bem cozido, nunca cru. Deixar arroz e frango preparados; lavar e cortar os vegetais e montar perto da refeição. Levar molho separado. No enjoo, trocar a montagem fria pela base aquecida com legumes cozidos.'),
  beef: recipe('beef', 'Carne moída com purê de batata e legumes', [i('Carne moída magra (crua)',150,'g','Proteínas'),i('Batata',180,'g','Hortifruti'),i('Leite zero lactose',40,'ml','Laticínios'),veg(),i('Passata de tomate',40)], 'Preparar carne com passata e temperos naturais; fazer purê com leite zero lactose. Porcionar e refrigerar ou congelar. Aquecer completamente antes de comer.'),
  beans: recipe('beans', 'Arroz e feijão com frango e legumes', [chicken(),rice(),i('Feijão (cru)',30,'g','Grãos e sementes'),veg()], 'Aquecer os componentes já porcionados. Usar temperos naturais que ela tolere e servir sem necessidade de cozinhar na hora.'),
  tuna: recipe('tuna', 'Macarrão com atum e maionese', [i('Macarrão (cru)',60,'g','Grãos e sementes'),i('Atum em água (drenado)',100,'g','Proteínas'),i('Maionese industrializada (conferir ausência de lactose)',10),i('Cenoura',60,'g','Hortifruti'),i('Tomate',60,'g','Hortifruti')], 'Na véspera, cozinhar a massa, resfriar prontamente e misturar ao atum drenado e à maionese industrializada. Manter refrigerado; acrescentar os vegetais perto de servir. Se maionese piorar o enjoo, trocar pelo prato simples de frango e arroz; atualizar compras se mudar o cardápio.'),
  blue: recipe('blue', 'Macarrão ao molho de queijo azul zero lactose com frango', [i('Macarrão (cru)',60,'g','Grãos e sementes'),chicken(),cream(),i('Queijo azul rotulado zero lactose (opcional)',20,'g','Laticínios'),veg()], 'Preparar molho com creme zero lactose e, apenas se disponível, queijo azul rotulado zero lactose. Sem esse produto, omitir o queijo e usar ervas. Nunca usar gorgonzola comum presumindo tolerância. Aquecer massa e frango já prontos; molho separado. Preferir outra opção se o molho piorar o enjoo.'),
};
const oats = recipe('oats', 'Aveia de véspera com leite zero lactose e banana', [i('Aveia',30,'g','Grãos e sementes'),i('Leite zero lactose',170,'ml','Laticínios'),i('Banana',1,'un','Hortifruti'),i('Café preto',1,'xícara','Bebidas')], 'Misturar aveia e leite zero lactose em pote tampado e refrigerar na véspera. Deixar a banana separada para adicionar ao pegar o pote; café já programado. Alternativa para experimentar: sanduíche de frango pronto na véspera. Não contém iogurte.');
const sandwich = recipe('sandwich', 'Sanduíche de frango pronto + café preto', [i('Pão sem lactose (conferir rótulo)',2,'fatia','Padaria'),i('Peito de frango (cru)',80,'g','Proteínas'),i('Cenoura',30,'g','Hortifruti'),i('Café preto',1,'xícara','Bebidas')], 'Na véspera, montar com frango já cozido e desfiado e cenoura; guardar tampado na geladeira. Pela manhã, só pegar. Pode aquecer se preferir. O frango cru listado é estimativa de compra, não quantidade do recheio já cozido.');
const snack = recipe('snack', 'Fruta + leite zero lactose, já separados', [i('Banana',1,'un','Hortifruti'),i('Leite zero lactose',170,'ml','Laticínios')], 'Separar na geladeira para a pausa da tarde. Alternativa: sanduíche de frango da véspera ou outra fruta que ela goste; ajustar compras se trocar. Se o volume incomodar, consumir em momentos menores. Barra não é obrigatória; se usar eventualmente, conferir lactose no rótulo.');
const lunchWeek = [recipes.teriyaki, recipes.beef, recipes.stroganoff, recipes.poke, recipes.tuna, recipes.beans, recipes.blue];
const dinnerWeek = [recipes.beans, recipes.teriyaki, recipes.beef, recipes.stroganoff, recipes.poke, recipes.tuna, recipes.beans];
function rotation(id: string, name: string, time: string, options: Meal[]): Meal {
  const weeklyOptions = options.map(option => ({...structuredClone(option), id, name, time}));
  return {...weeklyOptions[0], weeklyOptions};
}
export const routineMeals: Meal[] = [
  rotation('breakfast','Café da manhã','08:10',[oats,sandwich,oats,sandwich,oats,sandwich,sandwich]),
  rotation('lunch','Almoço','12:30',lunchWeek),
  {...snack,id:'snack',name:'Lanche da tarde',time:'16:00',image:''},
  rotation('dinner','Jantar','20:00',dinnerWeek),
];
