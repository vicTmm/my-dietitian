import { describe, it, expect } from 'vitest';
import { createProfile, meals, generateGroceries, mealForDay } from './data';
import { liviaMeals, liviaGuidance, liviaPlanName, liviaPlanNote } from './livia-plan';
import { migrateLiviaPlan, migrateLiviaRoutine } from './storage';

describe('prescrição da Lívia', () => {
  it('uses the home-office routine, preserves the prescription and leaves nutrients unknown', () => {
    const profile = createProfile('julia', 'Lívia', 'livia@base.demo');
    expect(profile.meals.map(m => m.time)).toEqual(['08:10', '12:30', '16:00', '20:00']);
    expect(profile.meals.every(m => m.nutritionMissing)).toBe(true);
    expect(profile.supplements).toEqual([]);
    expect(profile.archivedPlan?.meals).toHaveLength(6);
    expect(profile.meals.flatMap(meal => meal.ingredients).some(item => /iogurte|bold|ovo/i.test(item.name))).toBe(false);
    expect(mealForDay(profile.meals[1], 1).title).toContain('Carne moída');
    expect(mealForDay(profile.meals[1], 4).title).toContain('atum');

  });
  it('migrates an untouched demo and preserves personal history, training and extra groceries', () => {
    const old = {...createProfile('victor', 'Lívia', ''), id: 'julia', plannedDays: 7,
      days: {'2026-11-07': {water: 500, supplements: [], checkin: true}}};
    old.groceries.push({id: 'extra', name: 'Extra', quantity: 1, unit: 'un', category: 'Despensa', manual: true, checked: true});
    const db = {version: 1 as const, profiles: [old], session: 'julia'};
    const result = migrateLiviaPlan(db);
    expect(result.session).toBe('julia');
    expect(result.profiles[0].days).toBe(old.days);
    expect(result.profiles[0].meals).toHaveLength(4);
    expect(result.profiles[0].groceries.some(g => g.name.includes('Bold'))).toBe(false);
    expect(result.profiles[0].groceries.find(g => g.id === 'extra')?.checked).toBe(true);
    expect(migrateLiviaPlan(result).profiles[0]).toBe(result.profiles[0]);
  });
  it('preserves customized plans and other profiles', () => {
    const victor = createProfile('victor', 'Victor', '');
    const customized = {...victor, id: 'julia', meals: structuredClone(meals)};
    customized.meals[0].ingredients[0].quantity = 99;
    const result = migrateLiviaPlan({version: 1, profiles: [victor, customized], session: null});
    expect(result.profiles[0]).toBe(victor);
    expect(result.profiles[1]).toBe(customized);
  });
});

describe('weekly shopping and upgrades', () => {
  it('sums actual daily recipes, repeats a week and preserves manual shopping during migration', () => {
    const profile = createProfile('julia', 'Lívia', '');
    const list = generateGroceries(profile.meals, 7);
    const pasta = list.find(item => item.name === 'Macarrão (cru)');
    expect(pasta?.quantity).toBe(180);
    expect(generateGroceries(profile.meals, 14).find(item => item.id === pasta?.id)?.quantity).toBe(360);
    const old = {...profile, planSource: 'livia-2026-01-20', meals: structuredClone(liviaMeals), planName: liviaPlanName, planNote: liviaPlanNote, planGuidance: liviaGuidance};
    old.meals[0].description = 'Personalização anterior';
    old.groceries.push({id:'manual',name:'Extra',quantity:1,unit:'un',category:'Despensa',manual:true,checked:true});
    const result = migrateLiviaRoutine({version:1,profiles:[old],session:'julia'});
    const updated = result.profiles[0];
    expect(updated.archivedPlan?.meals[0].description).toBe('Personalização anterior');
    expect(updated.days).toBe(old.days);
    expect(updated.groceries.find(item => item.id === 'manual')?.checked).toBe(true);
    expect(updated.planSource).toBe('livia-home-office-v1');
    expect(migrateLiviaRoutine(result).profiles[0]).toBe(updated);
  });
});
