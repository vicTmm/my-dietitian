export type Exercise = {
  catalogId?: string;
  muscle?: string;
  mode?: "strength" | "timed" | "cardio";
  superset?: string;
  id: string;
  name: string;
  sets: number;
  reps: number;
  kg: number;
  rest: number;
};
export type Routine = {
  id: string;
  name: string;
  days: number[];
  exercises: Exercise[];
};
export type SetEntry = {
  id: string;
  reps: number;
  kg: number;
  done: boolean;
  kind?: "normal" | "warmup" | "drop" | "restpause";
  seconds?: number;
  km?: number;
  rpe?: number;
  rir?: number;
};
export type WorkoutExercise = {
  catalogId?: string;
  muscle?: string;
  mode?: "strength" | "timed" | "cardio";
  superset?: string;
  id: string;
  name: string;
  rest: number;
  sets: SetEntry[];
};
export type Workout = {
  id: string;
  routineId: string;
  name: string;
  startedAt: string;
  finishedAt?: string;
  exercises: WorkoutExercise[];
};
export type WeighIn = { date: string; kg: number };
export type TrainingData = {
  version: 1;
  scheduling?: "weekly" | "rotation";
  routines: Routine[];
  active: Workout | null;
  history: Workout[];
  weights: WeighIn[];
  restUntil: number | null;
};
export const emptyTraining = (): TrainingData => ({
  version: 1,
  routines: [],
  active: null,
  history: [],
  weights: [],
  restUntil: null,
});
export const uid = () => crypto.randomUUID();
export const newExercise = (): Exercise => ({
  id: uid(),
  name: "",
  sets: 3,
  reps: 10,
  kg: 0,
  rest: 60,
});
export function validRoutine(r: Routine) {
  return Boolean(
    r.name.trim() &&
    r.exercises.length &&
    r.exercises.every(
      (e) =>
        e.name.trim() &&
        Number.isInteger(e.sets) &&
        e.sets >= 1 &&
        e.sets <= 30 &&
        Number.isInteger(e.reps) &&
        e.reps >= 1 &&
        e.reps <= 1000 &&
        Number.isFinite(e.kg) &&
        e.kg >= 0 &&
        e.kg <= 2000 &&
        Number.isInteger(e.rest) &&
        e.rest >= 0 &&
        e.rest <= 900,
    ),
  );
}
export function startWorkout(
  routine: Routine,
  history: Workout[],
  now = new Date().toISOString(),
): Workout {
  if (!validRoutine(routine))
    throw new Error("Revise os exercícios da rotina.");
  const previous = history
    .filter((w) => w.routineId === routine.id)
    .sort((a, b) =>
      (b.finishedAt || b.startedAt).localeCompare(a.finishedAt || a.startedAt),
    )[0];
  return {
    id: uid(),
    routineId: routine.id,
    name: routine.name,
    startedAt: now,
    exercises: routine.exercises.map((e) => {
      const last = previous?.exercises.find((p) => p.id === e.id);
      return {
        catalogId: e.catalogId,
        muscle: e.muscle,
        mode: e.mode,
        superset: e.superset,
        id: e.id,
        name: e.name,
        rest: e.rest,
        sets: Array.from({ length: e.sets }, (_, i) => ({
          kind: last?.sets[i]?.kind,
          seconds: last?.sets[i]?.seconds,
          km: last?.sets[i]?.km,
          id: uid(),
          reps: last?.sets[i]?.done ? last.sets[i].reps : e.reps,
          kg: last?.sets[i]?.done ? last.sets[i].kg : e.kg,
          done: false,
        })),
      };
    }),
  };
}
export const completedSets = (w: Workout) =>
  w.exercises.flatMap((e) => e.sets).filter((s) => s.done);
export const volume = (w: Workout) =>
  w.exercises
    .filter((e) => !e.mode || e.mode === "strength")
    .flatMap((e) => e.sets)
    .filter((s) => s.done && s.kind !== "warmup")
    .reduce((sum, s) => sum + s.kg * s.reps, 0);
export function finishWorkout(
  data: TrainingData,
  now = new Date().toISOString(),
): TrainingData {
  if (!data.active || !completedSets(data.active).length)
    throw new Error("Conclua pelo menos uma série antes de salvar.");
  if (
    data.active.exercises.some(
      (e) =>
        (e.mode === "timed" || e.mode === "cardio") &&
        e.sets.some(
          (s) => s.done && !(Number.isFinite(s.seconds) && s.seconds! > 0),
        ),
    )
  )
    throw new Error(
      "Informe a duração de cada série concluída por tempo ou cardio.",
    );
  return {
    ...data,
    history: [{ ...data.active, finishedAt: now }, ...data.history],
    active: null,
    restUntil: null,
  };
}
export function exerciseRecords(history: Workout[]) {
  const map = new Map<string, { name: string; kg: number; reps: number }>();
  for (const w of history)
    for (const e of w.exercises)
      for (const s of e.sets) {
        if (!s.done || s.kind === "warmup" || (e.mode && e.mode !== "strength"))
          continue;
        const key = e.name.trim().toLocaleLowerCase("pt-BR");
        const prev = map.get(key);
        if (!prev || s.kg > prev.kg || (s.kg === prev.kg && s.reps > prev.reps))
          map.set(key, { name: e.name, kg: s.kg, reps: s.reps });
      }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
