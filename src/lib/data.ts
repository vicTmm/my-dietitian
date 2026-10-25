export type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
};
export type Meal = {
  id: string;
  time: string;
  name: string;
  title: string;
  description: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: Ingredient[];
  alternative: string;
  image: string;
};
export type Supplement = {
  id: string;
  name: string;
  dose: string;
  time: string;
  note: string;
};
export type Grocery = Ingredient & {
  id: string;
  checked: boolean;
  manual?: boolean;
};
export type Day = { water: number; supplements: string[]; checkin: boolean };
export type Profile = {
  id: string;
  name: string;
  email: string;
  waterGoal: number;
  days: Record<string, Day>;
  meals: Meal[];
  supplements: Supplement[];
  groceries: Grocery[];
  planName: string;
  planNote: string;
  plannedDays: number;
  history: { name: string; date: string }[];
};
const ingredient = (
  name: string,
  quantity: number,
  unit: string,
  category: string,
): Ingredient => ({ name, quantity, unit, category });
export const images = {
  breakfast: "/images/snack.jpg",
  lunch: "/images/lunch.jpg",
  snack: "/images/snack.jpg",
  dinner: "/images/dinner.jpg",
};
export const meals: Meal[] = [
  {
    id: "breakfast",
    time: "08:00",
    name: "Café da manhã",
    title: "Um começo leve",
    description: "Iogurte natural, banana, aveia e chia",
    kcal: 380,
    protein: 18,
    carbs: 52,
    fat: 11,
    fiber: 8,
    ingredients: [
      ingredient("Iogurte natural", 170, "g", "Laticínios"),
      ingredient("Banana", 1, "un", "Hortifruti"),
      ingredient("Aveia", 30, "g", "Grãos e sementes"),
      ingredient("Chia", 10, "g", "Grãos e sementes"),
    ],
    alternative: "2 ovos mexidos + 2 fatias de pão integral + 1 banana",
    image: images.breakfast,
  },
  {
    id: "lunch",
    time: "12:30",
    name: "Almoço",
    title: "Seu prato de todo dia",
    description: "Frango grelhado, arroz, feijão e salada",
    kcal: 620,
    protein: 46,
    carbs: 68,
    fat: 18,
    fiber: 10,
    ingredients: [
      ingredient("Peito de frango", 150, "g", "Proteínas"),
      ingredient("Arroz integral (cru)", 50, "g", "Grãos e sementes"),
      ingredient("Feijão (cru)", 40, "g", "Grãos e sementes"),
      ingredient("Mix de folhas", 60, "g", "Hortifruti"),
      ingredient("Tomate", 1, "un", "Hortifruti"),
      ingredient("Azeite", 10, "ml", "Despensa"),
    ],
    alternative:
      "Peixe grelhado, batata-doce e legumes — ajustar porções com seu plano",
    image: images.lunch,
  },
  {
    id: "snack",
    time: "16:00",
    name: "Lanche da tarde",
    title: "Uma pausa que sustenta",
    description: "Vitamina de banana com aveia e sementes",
    kcal: 320,
    protein: 14,
    carbs: 42,
    fat: 12,
    fiber: 7,
    ingredients: [
      ingredient("Banana", 1, "un", "Hortifruti"),
      ingredient("Leite", 200, "ml", "Laticínios"),
      ingredient("Aveia", 20, "g", "Grãos e sementes"),
      ingredient("Linhaça", 10, "g", "Grãos e sementes"),
    ],
    alternative: "Iogurte natural com fruta e um punhado de castanhas",
    image: images.snack,
  },
  {
    id: "dinner",
    time: "20:00",
    name: "Jantar",
    title: "Fechando o dia bem",
    description: "Omelete com legumes e torradas integrais",
    kcal: 480,
    protein: 30,
    carbs: 38,
    fat: 22,
    fiber: 6,
    ingredients: [
      ingredient("Ovos", 3, "un", "Proteínas"),
      ingredient("Abobrinha", 100, "g", "Hortifruti"),
      ingredient("Tomate", 1, "un", "Hortifruti"),
      ingredient("Pão integral", 2, "fatia", "Padaria"),
    ],
    alternative: "Repetir o almoço, com as porções indicadas no seu plano",
    image: images.dinner,
  },
];
export function generateGroceries(plan: Meal[], days: number): Grocery[] {
  const map = new Map<string, Grocery>();
  for (const meal of plan)
    for (const item of meal.ingredients) {
      const key =
        item.name.trim().toLocaleLowerCase("pt-BR") +
        "|" +
        item.unit.trim().toLocaleLowerCase("pt-BR");
      const old = map.get(key);
      if (old) old.quantity += item.quantity * days;
      else
        map.set(key, {
          ...item,
          quantity: item.quantity * days,
          id: key,
          checked: false,
        });
    }
  return [...map.values()];
}
export function createProfile(
  id: string,
  name: string,
  email: string,
): Profile {
  return {
    id,
    name,
    email,
    waterGoal: 2500,
    days: {},
    meals: structuredClone(meals),
    supplements: [
      {
        id: "s1",
        name: "Vitamina D",
        dose: "Conforme sua prescrição",
        time: "08:00",
        note: "Exemplo. Cadastre apenas o que já foi prescrito.",
      },
      {
        id: "s2",
        name: "Mix de sementes",
        dose: "Chia + linhaça • porção do plano",
        time: "16:00",
        note: "Adicionar à vitamina do lanche.",
      },
    ],
    groceries: generateGroceries(meals, 5),
    planName: "Meu plano de base",
    planNote:
      "Plano demonstrativo. Substitua pelas orientações do seu nutricionista.",
    plannedDays: 5,
    history: [],
  };
}
export const localDate = () => new Date().toLocaleDateString("sv-SE");
export const emptyDay = (): Day => ({
  water: 0,
  supplements: [],
  checkin: false,
});
export function totals(plan: Meal[]) {
  return plan.reduce(
    (a, m) => ({
      kcal: a.kcal + m.kcal,
      protein: a.protein + m.protein,
      carbs: a.carbs + m.carbs,
      fat: a.fat + m.fat,
      fiber: a.fiber + m.fiber,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}
export function weekDates() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      key: d.toLocaleDateString("sv-SE"),
      label: ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"][i],
      day: d.getDate(),
      future: d.toLocaleDateString("sv-SE") > localDate(),
    };
  });
}
