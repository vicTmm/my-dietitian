import { liviaFoodPreferences } from "./livia-plan";
import { createProfile, meals, generateGroceries } from "./data";
import type { Profile } from "./data";
const KEY = "base:v1";
type Database = {
  version: 1;
  profileNamesVersion?: 1;
  profiles: Profile[];
  session: string | null;
};
// Keep legacy IDs so existing plans, workouts and sessions remain associated.
const demoNames: Record<string, { name: string; email: string }> = {
  victor: { name: "Victor Hugo Araujo", email: "victor@base.demo" },
  julia: { name: "Lívia Sardenberg", email: "livia@base.demo" },
};
export function migrateProfileNames(db: Database): Database {
  if (db.profileNamesVersion === 1) return db;
  return {
    ...db,
    profileNamesVersion: 1,
    profiles: db.profiles.map((profile) => {
      const identity = demoNames[profile.id];
      if (!identity) return profile;
      return {
        ...profile,
        name: identity.name,
        email: profile.email === "julia@base.demo" ? identity.email : profile.email,
      };
    }),
  };
}
export function migrateLiviaPlan(db: Database): Database {
  return { ...db, profiles: db.profiles.map(profile => {
    if (profile.id !== 'julia' || profile.planSource ||
        profile.planName !== 'Meu plano de base' ||
        profile.planNote !== 'Plano demonstrativo. Substitua pelas orientações do seu nutricionista.' ||
        JSON.stringify(profile.meals) !== JSON.stringify(meals)) return profile;
    const prescribed = createProfile(profile.id, profile.name, profile.email);
    const demoSupplements = createProfile('demo', '', '').supplements;
    const groceries = generateGroceries(prescribed.meals, profile.plannedDays);
    return { ...profile, meals: prescribed.meals, planName: prescribed.planName,
      planNote: prescribed.planNote, planSource: prescribed.planSource,
      planGuidance: prescribed.planGuidance, planSources: prescribed.planSources, archivedPlan: prescribed.archivedPlan, foodPreferences: prescribed.foodPreferences,
      supplements: JSON.stringify(profile.supplements) === JSON.stringify(demoSupplements) ? [] : profile.supplements,
      groceries: [...groceries.map(item => ({ ...item, checked: profile.groceries.some(old => old.id === item.id && old.checked) })), ...profile.groceries.filter(item => item.manual)] };
  }) };
}
export function migrateLiviaRoutine(db: Database): Database {
  return { ...db, profiles: db.profiles.map(profile => {
    if (profile.id !== 'julia' || profile.planSource !== 'livia-2026-01-20') return profile;
    const routine = createProfile(profile.id, profile.name, profile.email);
    return {...profile, meals: routine.meals, planName: routine.planName, planNote: routine.planNote,
      planSource: routine.planSource, planGuidance: routine.planGuidance, planSources: routine.planSources,
      foodPreferences: routine.foodPreferences,
      archivedPlan: {name: profile.planName, note: profile.planNote, meals: structuredClone(profile.meals), guidance: profile.planGuidance},
      history: [...profile.history, {name: profile.planName, date: new Date().toLocaleDateString('sv-SE')}],
      groceries: [...generateGroceries(routine.meals, profile.plannedDays), ...profile.groceries.filter(item => item.manual)]};
  }) };
}
export function withFoodPreferences(db: Database): Database {
  return { ...db, profiles: db.profiles.map(profile => profile.id === 'julia' && !profile.foodPreferences
    ? { ...profile, foodPreferences: structuredClone(liviaFoodPreferences) } : profile) };
}
export function readDatabase(): Database {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const value = JSON.parse(raw);
      if (value.version === 1 && Array.isArray(value.profiles))
        return withFoodPreferences(migrateLiviaRoutine(migrateLiviaPlan(migrateProfileNames(value))));
    }
  } catch {
    /* Recover demo if storage is corrupted. */
  }
  return {
    version: 1,
    profileNamesVersion: 1,
    profiles: [
      createProfile("victor", "Victor Hugo Araujo", "victor@base.demo"),
      createProfile("julia", "Lívia Sardenberg", "livia@base.demo"),
    ],
    session: null,
  };
}
export function writeDatabase(db: Database) {
  localStorage.setItem(KEY, JSON.stringify(db));
}
export function download(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
