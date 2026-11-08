import { describe, expect, it } from "vitest";
import {
  completedSets,
  emptyTraining,
  exerciseRecords,
  finishWorkout,
  startWorkout,
  validRoutine,
  volume,
} from "./model";
import type { Routine } from "./model";
const routine: Routine = {
  id: "r1",
  name: "Treino A",
  days: [1],
  exercises: [
    { id: "e1", name: "Agachamento", sets: 2, reps: 8, kg: 20, rest: 60 },
  ],
};
describe("training lifecycle", () => {
  it("keeps planned and incomplete sets out of volume and records", () => {
    const active = startWorkout(routine, []);
    expect(volume(active)).toBe(0);
    expect(exerciseRecords([active])).toEqual([]);
    active.exercises[0].sets[0].done = true;
    expect(volume(active)).toBe(160);
    expect(completedSets(active)).toHaveLength(1);
    const data = finishWorkout({ ...emptyTraining(), active, restUntil: 123 });
    expect(data.active).toBeNull();
    expect(data.restUntil).toBeNull();
    expect(data.history[0].finishedAt).toBeTruthy();
    expect(exerciseRecords(data.history)).toEqual([
      { name: "Agachamento", kg: 20, reps: 8 },
    ]);
  });
  it("rejects an empty workout instead of inventing a completed session", () => {
    expect(() => finishWorkout(emptyTraining())).toThrow();
    expect(() =>
      finishWorkout({ ...emptyTraining(), active: startWorkout(routine, []) }),
    ).toThrow();
  });
  it("uses only completed sets from the latest session, and snapshots the routine", () => {
    const previous = startWorkout(routine, []);
    previous.exercises[0].sets[0] = {
      ...previous.exercises[0].sets[0],
      kg: 25,
      reps: 9,
      done: true,
    };
    previous.exercises[0].sets[1].kg = 999;
    const next = startWorkout(routine, [previous]);
    expect(next.exercises[0].sets.map((s) => s.kg)).toEqual([25, 20]);
    expect(next.exercises[0].sets.every((s) => !s.done)).toBe(true);
    next.exercises[0].name = "Renamed";
    expect(routine.exercises[0].name).toBe("Agachamento");
  });
  it("recalculates records from the remaining history after deletion", () => {
    const first = startWorkout(routine, []);
    first.exercises[0].sets[0].done = true;
    const second = structuredClone(first);
    second.exercises[0].sets[0].kg = 30;
    expect(exerciseRecords([first, second])[0].kg).toBe(30);
    expect(exerciseRecords([first])[0].kg).toBe(20);
  });
  it("rejects malformed plans including non-finite and fractional set counts", () => {
    expect(validRoutine(routine)).toBe(true);
    for (const patch of [
      { sets: 0 },
      { sets: 1.5 },
      { kg: NaN },
      { kg: -1 },
      { reps: 0 },
      { rest: 901 },
    ])
      expect(
        validRoutine({
          ...routine,
          exercises: [{ ...routine.exercises[0], ...patch }],
        }),
      ).toBe(false);
    expect(validRoutine({ ...routine, name: "   " })).toBe(false);
  });
});
