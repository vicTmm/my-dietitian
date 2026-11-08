import { emptyTraining, validRoutine, uid } from "./model";
import type { TrainingData, Workout, Routine } from "./model";
const object = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);
const text = (x: unknown) =>
  typeof x === "string" && x.length > 0 && x.length <= 500;
const num = (x: unknown, min = 0, max = 2000) =>
  typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;
const date = (x: unknown) =>
  typeof x === "string" && Number.isFinite(Date.parse(x));
function exercise(x: unknown): boolean {
  return (
    object(x) &&
    text(x.id) &&
    text(x.name) &&
    num(x.rest, 0, 900) &&
    (!x.mode || ["strength", "timed", "cardio"].includes(String(x.mode))) &&
    ["muscle", "catalogId", "superset"].every(
      (k) => x[k] === undefined || typeof x[k] === "string",
    )
  );
}
function workout(x: unknown): boolean {
  return (
    object(x) &&
    text(x.id) &&
    text(x.routineId) &&
    text(x.name) &&
    date(x.startedAt) &&
    (x.finishedAt === undefined || date(x.finishedAt)) &&
    Array.isArray(x.exercises) &&
    x.exercises.every(
      (e) =>
        object(e) &&
        exercise(e) &&
        Array.isArray(e.sets) &&
        e.sets.every(
          (s) =>
            object(s) &&
            text(s.id) &&
            num(s.kg) &&
            num(s.reps, 1, 1000) &&
            Number.isInteger(s.reps) &&
            typeof s.done === "boolean" &&
            ["seconds", "km", "rpe", "rir"].every(
              (k) =>
                s[k] === undefined ||
                num(s[k], 0, k === "seconds" ? 86400 : k === "km" ? 1000 : 10),
            ) &&
            (!s.kind ||
              ["normal", "warmup", "drop", "restpause"].includes(
                String(s.kind),
              )),
        ),
    )
  );
}
export function parseTraining(raw: string): TrainingData {
  const d: unknown = JSON.parse(raw);
  if (
    !object(d) ||
    d.version !== 1 ||
    !Array.isArray(d.routines) ||
    !d.routines.every(
      (r) =>
        object(r) &&
        text(r.id) &&
        text(r.name) &&
        Array.isArray(r.days) &&
        r.days.every((n) => Number.isInteger(n) && n >= 0 && n <= 6) &&
        Array.isArray(r.exercises) &&
        r.exercises.every(exercise) &&
        validRoutine(r as unknown as Routine),
    ) ||
    !Array.isArray(d.history) ||
    !d.history.every(workout) ||
    !(d.active === null || workout(d.active)) ||
    !Array.isArray(d.weights) ||
    !d.weights.every(
      (w) =>
        object(w) &&
        typeof w.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(w.date) &&
        date(w.date) &&
        num(w.kg, 0.1, 500),
    ) ||
    !(d.restUntil === null || num(d.restUntil, 0, 1e16))
  )
    throw Error("Arquivo de treino inválido. Nenhum dado foi alterado.");
  return d as unknown as TrainingData;
}
export function mergeTraining(
  local: TrainingData,
  incoming: TrainingData,
): TrainingData {
  const merge = <T extends { id: string }>(a: T[], b: T[]) => [
    ...a,
    ...b.filter((x) => !a.some((y) => y.id === x.id)),
  ];
  return {
    ...local,
    routines: merge(local.routines, incoming.routines),
    history: merge(local.history, incoming.history).sort((a, b) =>
      b.startedAt.localeCompare(a.startedAt),
    ),
    weights: [
      ...local.weights,
      ...incoming.weights.filter(
        (w) => !local.weights.some((x) => x.date === w.date),
      ),
    ].sort((a, b) => b.date.localeCompare(a.date)),
  };
}
export function csvRows(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '"') {
      if (quoted && raw[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if (c === "\n" && !quoted) {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quoted) throw Error("CSV com aspas incompletas.");
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}
export function importCsv(raw: string): TrainingData {
  const [head, ...rows] = csvRows(raw.replace(/^\uFEFF/, ""));
  if (!head) throw Error("CSV vazio.");
  const h = head.map((s) => s.trim().toLowerCase());
  const col = (...keys: string[]) =>
    keys.map((k) => h.indexOf(k)).find((i) => i >= 0) ?? -1;
  const di = col("date", "start_time"),
    ei = col("exercise name", "exercise_title", "exercise"),
    ki = col("weight", "weight (kg)", "weight_kg"),
    ri = col("reps"),
    ni = col("workout name", "title");
  if ([di, ei, ki, ri].includes(-1))
    throw Error(
      "Cabeçalhos não reconhecidos. Use CSV do Strong, Hevy ou FitNotes com carga em kg.",
    );
  const groups = new Map<string, Workout>();
  for (const row of rows.filter((r) => r.some(Boolean))) {
    const d = new Date(row[di]);
    const kg = Number(row[ki]),
      reps = Number(row[ri]);
    if (
      !Number.isFinite(d.getTime()) ||
      !row[ei] ||
      !row[ki]?.trim() ||
      !row[ri]?.trim() ||
      !num(kg) ||
      !num(reps, 1, 1000) ||
      !Number.isInteger(reps)
    )
      throw Error(
        "Linha inválida ou modalidade não suportada neste CSV. Nenhum dado foi importado.",
      );
    const name = ni >= 0 ? row[ni] : "Treino importado",
      key = d.toISOString() + name;
    let w = groups.get(key);
    if (!w) {
      w = {
        id: "csv:" + key,
        routineId: "imported",
        name,
        startedAt: d.toISOString(),
        finishedAt: d.toISOString(),
        exercises: [],
      };
      groups.set(key, w);
    }
    let e = w.exercises.find((x) => x.name === row[ei]);
    if (!e) {
      e = { id: uid(), name: row[ei], rest: 60, sets: [] };
      w.exercises.push(e);
    }
    const optional = (keys: string[], max: number) => {
      const i = col(...keys);
      if (i < 0 || !row[i]?.trim()) return undefined;
      const v = Number(row[i]);
      if (!num(v, 0, max)) throw Error("Valor inválido no CSV.");
      return v;
    };
    const modeIndex = col("mode");
    if (modeIndex >= 0) {
      const mode = row[modeIndex];
      if (!["strength", "timed", "cardio"].includes(mode))
        throw Error("Modalidade inválida.");
      e.mode = mode as typeof e.mode;
    }
    const kindIndex = col("set type", "set_type");
    const kind = kindIndex >= 0 ? row[kindIndex] : undefined;
    if (kind && !["normal", "warmup", "drop", "restpause"].includes(kind))
      throw Error("Tipo de série não suportado.");
    const doneIndex = col("done");
    e.sets.push({
      id: uid(),
      kg,
      reps,
      done: doneIndex < 0 || row[doneIndex] === "true",
      seconds: optional(["seconds", "duration_seconds"], 86400),
      km: optional(["distance km", "distance_km"], 1000),
      rpe: optional(["rpe"], 10),
      rir: optional(["rir"], 10),
      kind: kind as (typeof e.sets)[number]["kind"],
    });
  }
  return { ...emptyTraining(), history: [...groups.values()] };
}
export function exportCsv(d: TrainingData) {
  const quote = (v: unknown) =>
    '"' + String(v ?? "").replaceAll('"', '""') + '"';
  return [
    [
      "Date",
      "Workout Name",
      "Exercise Name",
      "Weight",
      "Reps",
      "Seconds",
      "Distance km",
      "Set Type",
      "RPE",
      "RIR",
      "Done",
      "Mode",
    ],
    ...d.history.flatMap((w) =>
      w.exercises.flatMap((e) =>
        e.sets.map((s) => [
          w.startedAt,
          w.name,
          e.name,
          s.kg,
          s.reps,
          s.seconds,
          s.km,
          s.kind || "normal",
          s.rpe,
          s.rir,
          s.done,
          e.mode || "strength",
        ]),
      ),
    ),
  ]
    .map((r) => r.map(quote).join(","))
    .join("\n");
}
