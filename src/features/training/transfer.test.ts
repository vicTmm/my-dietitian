import { describe, it, expect } from "vitest";
import {
  emptyTraining,
  startWorkout,
  finishWorkout,
  volume,
  exerciseRecords,
} from "./model";
import { parseTraining, importCsv, mergeTraining, csvRows } from "./transfer";
const r = {
  id: "r",
  name: "A",
  days: [1],
  exercises: [
    { id: "e", name: "Exercício", sets: 2, reps: 10, kg: 20, rest: 60 },
  ],
};
describe("expanded training data", () => {
  it("rejects malformed imported sessions before changing user data", () => {
    const d = emptyTraining();
    expect(parseTraining(JSON.stringify(d))).toEqual(d);
    expect(() =>
      parseTraining(
        JSON.stringify({ ...d, history: [{ id: "x", exercises: [] }] }),
      ),
    ).toThrow();
    expect(() =>
      parseTraining(
        JSON.stringify({ ...d, weights: [{ date: "bad", kg: 70 }] }),
      ),
    ).toThrow();
  });
  it("excludes warmups and cardio from volume and strength records", () => {
    const w = startWorkout(r, []);
    w.exercises[0].sets.forEach((s) => (s.done = true));
    w.exercises[0].sets[0].kind = "warmup";
    expect(volume(w)).toBe(200);
    w.exercises[0].mode = "cardio";
    expect(volume(w)).toBe(0);
    expect(exerciseRecords([w])).toEqual([]);
    expect(() => finishWorkout({ ...emptyTraining(), active: w })).toThrow(
      /duração/,
    );
    w.exercises[0].sets.forEach((s) => (s.seconds = 60));
    expect(
      finishWorkout({ ...emptyTraining(), active: w }).history,
    ).toHaveLength(1);
  });
  it("parses quoted exercise names and rejects partial invalid imports", () => {
    expect(csvRows('a,b\n"a,b","c"')).toEqual([
      ["a", "b"],
      ["a,b", "c"],
    ]);
    const raw = 'Date,Exercise,Weight,Reps\n2026-11-06,"Row, dumbbell",20,10';
    const imported = importCsv(raw);
    expect(imported.history[0].exercises[0].name).toBe("Row, dumbbell");
    expect(() => importCsv(raw + "\n2026-11-06,Row,-20,10")).toThrow();
  });
  it("deduplicates repeat imports and preserves the active workout", () => {
    const imported = importCsv(
      "Date,Exercise,Weight,Reps\n2026-11-06,Row,20,10",
    );
    const local = { ...emptyTraining(), active: startWorkout(r, []) };
    const merged = mergeTraining(mergeTraining(local, imported), imported);
    expect(merged.history).toHaveLength(1);
    expect(merged.active).toEqual(local.active);
  });
});
