import { describe, it, expect } from "vitest";
import {
  createProfile,
  generateGroceries,
  meals,
  totals,
  weekDates,
} from "./data";
describe("planning and personal spaces", () => {
  it("aggregates repeated ingredients and multiplies by days", () => {
    const list = generateGroceries(meals, 5);
    expect(list.find((g) => g.name === "Banana")?.quantity).toBe(10);
    expect(list.find((g) => g.name === "Aveia")?.quantity).toBe(250);
    expect(list.find((g) => g.name === "Tomate")?.quantity).toBe(10);
    expect(list.every((g) => g.checked === false)).toBe(true);
  });
  it("keeps distinct units separate", () => {
    const plan = structuredClone(meals.slice(0, 1));
    plan[0].ingredients = [
      { name: "Leite", quantity: 1, unit: "L", category: "Laticínios" },
      { name: "Leite", quantity: 200, unit: "ml", category: "Laticínios" },
    ];
    expect(generateGroceries(plan, 1)).toHaveLength(2);
  });
  it("normalizes case and whitespace in ingredient keys", () => {
    const plan = structuredClone(meals.slice(0, 1));
    plan[0].ingredients = [
      { name: " Banana ", quantity: 1, unit: "UN", category: "Hortifruti" },
      { name: "banana", quantity: 2, unit: "un", category: "Hortifruti" },
    ];
    expect(generateGroceries(plan, 2)).toHaveLength(1);
    expect(generateGroceries(plan, 2)[0].quantity).toBe(6);
  });
  it("does not share mutable state across profiles", () => {
    const a = createProfile("a", "A", "a@example.com");
    const b = createProfile("b", "B", "b@example.com");
    a.meals[0].ingredients[0].quantity = 999;
    a.groceries[0].checked = true;
    expect(b.meals[0].ingredients[0].quantity).toBe(170);
    expect(b.groceries[0].checked).toBe(false);
    expect(b.days).toEqual({});
  });
  it("calculates planned nutrients", () => {
    expect(totals(meals)).toEqual({
      kcal: 1800,
      protein: 108,
      carbs: 200,
      fat: 63,
      fiber: 31,
    });
  });
  it("returns a Monday to Sunday local week", () => {
    const dates = weekDates();
    expect(dates).toHaveLength(7);
    expect(new Date(dates[0].key + "T12:00:00").getDay()).toBe(1);
    expect(new Date(dates[6].key + "T12:00:00").getDay()).toBe(0);
  });
});
