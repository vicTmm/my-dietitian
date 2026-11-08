import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { newExercise, uid, volume } from "./model";
import BodyMap from "./BodyMap";
import type {
  Exercise,
  Routine,
  TrainingData,
  Workout,
  SetEntry,
} from "./model";
export const muscles: Record<string, string> = {
  abdominals: "Abdômen",
  abductors: "Abdutores",
  adductors: "Adutores",
  biceps: "Bíceps",
  calves: "Panturrilhas",
  chest: "Peito",
  forearms: "Antebraços",
  glutes: "Glúteos",
  hamstrings: "Posteriores",
  lats: "Dorsais",
  "lower back": "Lombar",
  "middle back": "Costas",
  neck: "Pescoço",
  quadriceps: "Quadríceps",
  shoulders: "Ombros",
  traps: "Trapézio",
  triceps: "Tríceps",
};
type Entry = {
  id: string;
  name: string;
  primaryMuscles: string[];
  equipment: string | null;
  instructions: string[];
  images: string[];
  category: string;
};
export function Catalog({ add }: { add: (e: Exercise) => void }) {
  const [items, setItems] = useState<Entry[]>([]),
    [query, setQuery] = useState(""),
    [muscle, setMuscle] = useState(""),
    [equipment, setEquipment] = useState(""),
    [selected, setSelected] = useState<Entry | null>(null),
    [error, setError] = useState(""),
    [limit, setLimit] = useState(30);
  useEffect(() => {
    const c = new AbortController();
    fetch("/exercises/catalog.json", { signal: c.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setItems)
      .catch((e) => {
        if (e.name !== "AbortError")
          setError(
            "Não foi possível carregar o catálogo. Reabra esta seção para tentar novamente.",
          );
      });
    return () => c.abort();
  }, []);
  const results = items.filter(
    (e) =>
      (!muscle || e.primaryMuscles.includes(muscle)) &&
      (!equipment || e.equipment === equipment) &&
      `${e.name} ${e.primaryMuscles.map((m) => muscles[m]).join(" ")}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  return (
    <section>
      <h2>Biblioteca de exercícios</h2>
      <p>
        Fotos de execução e instruções do catálogo aberto Free Exercise DB.
        Nomes e instruções da fonte estão em inglês.
      </p>
      <div className="training-filters">
        <label>
          Buscar
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(30);
            }}
            placeholder="Nome ou músculo"
          />
        </label>
        <label>
          Músculo
          <select
            value={muscle}
            onChange={(e) => {
              setMuscle(e.target.value);
              setLimit(30);
            }}
          >
            <option value="">Todos</option>
            {Object.entries(muscles).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Equipamento
          <select
            value={equipment}
            onChange={(e) => {
              setEquipment(e.target.value);
              setLimit(30);
            }}
          >
            <option value="">Todos</option>
            {Array.from(new Set(items.map((e) => e.equipment).filter(Boolean)))
              .sort()
              .map((e) => (
                <option key={e!}>{e}</option>
              ))}
          </select>
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      <p>
        {items.length
          ? `${results.length} exercícios encontrados`
          : !error
            ? "Carregando catálogo…"
            : ""}
      </p>
      {selected && (
        <article className="exercise-detail">
          <div className="training-toolbar">
            <h3>{selected.name}</h3>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelected(null)}
            >
              Fechar detalhes
            </Button>
          </div>
          <div className="exercise-photos">
            {selected.images.map((im, i) => (
              <img
                key={im}
                loading="lazy"
                src={`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${im}`}
                alt={`${selected.name}: posição ${i + 1}`}
                onError={(e) => {
                  e.currentTarget.alt =
                    "Foto indisponível. Consulte as instruções abaixo.";
                }}
              />
            ))}
          </div>
          <ol>
            {selected.instructions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <Button
            type="button"
            onClick={() =>
              add({
                ...newExercise(),
                name: selected.name,
                catalogId: selected.id,
                muscle: selected.primaryMuscles[0],
                mode: selected.category === "cardio" ? "cardio" : "strength",
              })
            }
          >
            Usar este exercício
          </Button>
        </article>
      )}
      <div className="catalog-list">
        {results.slice(0, limit).map((e) => (
          <button type="button" key={e.id} onClick={() => setSelected(e)}>
            <strong>{e.name}</strong>
            <span>
              {e.primaryMuscles.map((m) => muscles[m] || m).join(", ")} ·{" "}
              {e.equipment || "Sem equipamento"}
            </span>
          </button>
        ))}
      </div>
      {!results.length && items.length > 0 && (
        <p>Nenhum exercício corresponde aos filtros.</p>
      )}
      {results.length > limit && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setLimit(limit + 30)}
        >
          Mostrar mais exercícios
        </Button>
      )}
      <p className="small muted">
        Fonte:{" "}
        <a
          href="https://github.com/yuhonas/free-exercise-db"
          target="_blank"
          rel="noreferrer"
        >
          Free Exercise DB
        </a>{" "}
        · domínio público (Unlicense). Fotos precisam de conexão.
      </p>
    </section>
  );
}
export function ExerciseOptions({
  e,
  change,
}: {
  e: Exercise;
  change: (p: Partial<Exercise>) => void;
}) {
  return (
    <div className="training-filters">
      <label>
        Tipo
        <select
          value={e.mode || "strength"}
          onChange={(v) => change({ mode: v.target.value as Exercise["mode"] })}
        >
          <option value="strength">Força</option>
          <option value="timed">Duração</option>
          <option value="cardio">Cardio</option>
        </select>
      </label>
      <label>
        Músculo
        <select
          value={e.muscle || ""}
          onChange={(v) => change({ muscle: v.target.value })}
        >
          <option value="">Não informado</option>
          {Object.entries(muscles).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label>
        Grupo de superset
        <input
          value={e.superset || ""}
          maxLength={20}
          placeholder="Ex.: A (opcional)"
          onChange={(v) => change({ superset: v.target.value })}
        />
      </label>
    </div>
  );
}
export function SetOptions({
  s,
  mode,
  change,
  remove,
  duplicate,
}: {
  s: SetEntry;
  mode?: string;
  change: (p: Partial<SetEntry>) => void;
  remove: () => void;
  duplicate: () => void;
}) {
  return (
    <div className="set-options">
      <label>
        Tipo de série
        <select
          value={s.kind || "normal"}
          onChange={(e) => change({ kind: e.target.value as SetEntry["kind"] })}
        >
          <option value="normal">Normal</option>
          <option value="warmup">Aquecimento</option>
          <option value="drop">Drop set</option>
          <option value="restpause">Rest-pause</option>
        </select>
      </label>
      {(mode === "timed" || mode === "cardio") && (
        <label>
          Duração (s)
          <input
            type="number"
            min="1"
            max="86400"
            value={s.seconds || ""}
            onChange={(e) =>
              change({
                seconds: Math.max(0, Math.min(86400, Number(e.target.value))),
              })
            }
          />
        </label>
      )}
      {mode === "cardio" && (
        <label>
          Distância (km)
          <input
            type="number"
            min="0"
            max="1000"
            step="0.01"
            value={s.km || ""}
            onChange={(e) =>
              change({
                km: Math.max(0, Math.min(1000, Number(e.target.value))),
              })
            }
          />
        </label>
      )}
      <label title="Esforço percebido, de 1 a 10">
        RPE
        <input
          type="number"
          min="1"
          max="10"
          step="0.5"
          value={s.rpe ?? ""}
          onChange={(e) =>
            change({
              rpe:
                e.target.value === ""
                  ? undefined
                  : Math.max(1, Math.min(10, Number(e.target.value))),
            })
          }
        />
      </label>
      <label title="Repetições em reserva, de 0 a 10">
        RIR
        <input
          type="number"
          min="0"
          max="10"
          value={s.rir ?? ""}
          onChange={(e) =>
            change({
              rir:
                e.target.value === ""
                  ? undefined
                  : Math.max(
                      0,
                      Math.min(10, Math.round(Number(e.target.value))),
                    ),
            })
          }
        />
      </label>
      <Button type="button" variant="ghost" onClick={duplicate}>
        Duplicar série
      </Button>
      <Button type="button" variant="ghost" onClick={remove}>
        Remover série
      </Button>
    </div>
  );
}
export function Trend({
  title,
  points,
  unit,
}: {
  title: string;
  points: { label: string; value: number }[];
  unit: string;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <section className="training-trend">
      <h3>{title}</h3>
      {!points.length ? (
        <p>Registre sessões para acompanhar esta evolução.</p>
      ) : (
        <>
          <svg
            viewBox="0 0 600 140"
            role="img"
            aria-label={`${title}: ${points.map((p) => `${p.label}: ${p.value.toFixed(1)} ${unit}`).join("; ")}`}
          >
            <line x1="15" y1="125" x2="585" y2="125" stroke="var(--line)" />
            <polyline
              points={points
                .map(
                  (p, i) =>
                    `${15 + (i * 570) / Math.max(1, points.length - 1)},${125 - (p.value / max) * 110}`,
                )
                .join(" ")}
              fill="none"
              stroke="var(--emerald)"
              strokeWidth="3"
            />
            {points.map((p, i) => (
              <circle
                key={i}
                cx={15 + (i * 570) / Math.max(1, points.length - 1)}
                cy={125 - (p.value / max) * 110}
                r="4"
                fill="var(--emerald)"
              />
            ))}
          </svg>
          <details>
            <summary>Ver valores ({unit})</summary>
            {points.map((p, i) => (
              <p key={i}>
                {p.label}: {p.value.toLocaleString("pt-BR")} {unit}
              </p>
            ))}
          </details>
        </>
      )}
    </section>
  );
}
export function Analytics({ data }: { data: TrainingData }) {
  const names = Array.from(
    new Set(data.history.flatMap((w) => w.exercises.map((e) => e.name))),
  ).sort();
  const [selected, setSelected] = useState("");
  const name = selected || names[0];
  const history = [...data.history].sort((a, b) =>
    a.startedAt.localeCompare(b.startedAt),
  );
  const loads = history.flatMap((w) => {
    const sets = w.exercises
      .filter((e) => e.name === name && (!e.mode || e.mode === "strength"))
      .flatMap((e) => e.sets)
      .filter((s) => s.done && s.kind !== "warmup");
    return sets.length
      ? [
          {
            label: new Date(w.startedAt).toLocaleDateString("pt-BR"),
            value: Math.max(...sets.map((s) => s.kg)),
          },
        ]
      : [];
  });
  const muscleSets: Record<string, number> = {};
  data.history.forEach((w) =>
    w.exercises.forEach((e) => {
      if (e.muscle)
        muscleSets[e.muscle] =
          (muscleSets[e.muscle] || 0) +
          e.sets.filter((s) => s.done && s.kind !== "warmup").length;
    }),
  );
  return (
    <>
      <div className="training-filters">
        <label>
          Exercício
          <select
            value={name || ""}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Selecione</option>
            {names.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <Trend title="Carga máxima por sessão" points={loads} unit="kg" />
      <Trend
        title="Volume por sessão"
        points={history.map((w) => ({
          label: new Date(w.startedAt).toLocaleDateString("pt-BR"),
          value: volume(w),
        }))}
        unit="kg"
      />
      <Trend
        title="Peso corporal ao longo do tempo"
        points={[...data.weights]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((w) => ({ label: w.date, value: w.kg }))}
        unit="kg"
      />
      <section className="muscle-map">
        <h3>Distribuição muscular</h3>
        <BodyMap counts={muscleSets} />
        <p>Séries concluídas por grupo cadastrado, sem aquecimentos.</p>
        {Object.entries(muscles).map(([k, v]) => (
          <div key={k}>
            <span>{v}</span>
            <meter
              min="0"
              max={Math.max(1, ...Object.values(muscleSets))}
              value={muscleSets[k] || 0}
            />
            <strong>{muscleSets[k] || 0}</strong>
          </div>
        ))}
      </section>
    </>
  );
}
export function Schedule({
  data,
  change,
  start,
}: {
  data: TrainingData;
  change: (fn: (d: TrainingData) => TrainingData) => void;
  start: (r: Routine) => void;
}) {
  const last = data.history[0]?.routineId;
  const next =
    data.routines[
      (data.routines.findIndex((r) => r.id === last) + 1) %
        Math.max(1, data.routines.length)
    ];
  const today = data.routines.filter((r) =>
    r.days.includes(new Date().getDay()),
  );
  return (
    <section className="training-schedule">
      <label>
        Organização
        <select
          value={data.scheduling || "weekly"}
          onChange={(e) =>
            change((d) => ({
              ...d,
              scheduling: e.target.value as TrainingData["scheduling"],
            }))
          }
        >
          <option value="weekly">Dias da semana</option>
          <option value="rotation">Rotação A → B → C</option>
        </select>
      </label>
      {(data.scheduling === "rotation" ? (next ? [next] : []) : today).map(
        (r) => (
          <Button
            type="button"
            key={r.id}
            variant="outline"
            onClick={() => start(r)}
          >
            {data.scheduling === "rotation" ? "Próximo" : "Hoje"}: {r.name}
          </Button>
        ),
      )}
      {data.scheduling !== "rotation" && !today.length && (
        <p>
          Nenhuma rotina programada para hoje. Você pode iniciar qualquer rotina
          abaixo.
        </p>
      )}
    </section>
  );
}
export function HistoryEditor({
  workout,
  save,
  cancel,
}: {
  workout: Workout;
  save: (w: Workout) => void;
  cancel: () => void;
}) {
  const [w, setW] = useState(() => structuredClone(workout));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (w.name.trim()) save({ ...w, name: w.name.trim() });
      }}
      className="history-editor"
    >
      <h2>Editar treino concluído</h2>
      <label>
        Nome
        <input
          required
          value={w.name}
          onChange={(e) => setW({ ...w, name: e.target.value })}
        />
      </label>
      <label>
        Data
        <input
          type="date"
          required
          value={w.startedAt.slice(0, 10)}
          onChange={(e) => {
            if (e.target.value)
              setW({
                ...w,
                startedAt: e.target.value + "T12:00:00.000Z",
                finishedAt: e.target.value + "T13:00:00.000Z",
              });
          }}
        />
      </label>
      {w.exercises.map((e) => (
        <section key={e.id}>
          <h3>{e.name}</h3>
          {e.sets.map((s, i) => (
            <div className="training-filters" key={s.id}>
              <label>
                Série {i + 1}: carga
                <input
                  type="number"
                  min="0"
                  max="2000"
                  step="0.25"
                  required
                  value={s.kg}
                  onChange={(ev) =>
                    setW({
                      ...w,
                      exercises: w.exercises.map((x) =>
                        x.id === e.id
                          ? {
                              ...x,
                              sets: x.sets.map((a) =>
                                a.id === s.id
                                  ? { ...a, kg: Number(ev.target.value) }
                                  : a,
                              ),
                            }
                          : x,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Repetições
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={s.reps}
                  onChange={(ev) =>
                    setW({
                      ...w,
                      exercises: w.exercises.map((x) =>
                        x.id === e.id
                          ? {
                              ...x,
                              sets: x.sets.map((a) =>
                                a.id === s.id
                                  ? { ...a, reps: Number(ev.target.value) }
                                  : a,
                              ),
                            }
                          : x,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Concluída
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={() =>
                    setW({
                      ...w,
                      exercises: w.exercises.map((x) =>
                        x.id === e.id
                          ? {
                              ...x,
                              sets: x.sets.map((a) =>
                                a.id === s.id ? { ...a, done: !a.done } : a,
                              ),
                            }
                          : x,
                      ),
                    })
                  }
                />
              </label>
              <SetOptions
                s={s}
                mode={e.mode}
                change={(patch) =>
                  setW({
                    ...w,
                    exercises: w.exercises.map((x) =>
                      x.id === e.id
                        ? {
                            ...x,
                            sets: x.sets.map((a) =>
                              a.id === s.id ? { ...a, ...patch } : a,
                            ),
                          }
                        : x,
                    ),
                  })
                }
                remove={() =>
                  setW({
                    ...w,
                    exercises: w.exercises.map((x) =>
                      x.id === e.id
                        ? { ...x, sets: x.sets.filter((a) => a.id !== s.id) }
                        : x,
                    ),
                  })
                }
                duplicate={() =>
                  setW({
                    ...w,
                    exercises: w.exercises.map((x) =>
                      x.id === e.id
                        ? { ...x, sets: [...x.sets, { ...s, id: uid() }] }
                        : x,
                    ),
                  })
                }
              />
            </div>
          ))}
        </section>
      ))}
      <Button
        type="submit"
        disabled={
          !w.name.trim() ||
          w.exercises.some(
            (e) =>
              (e.mode === "timed" || e.mode === "cardio") &&
              e.sets.some((s) => s.done && !s.seconds),
          )
        }
      >
        Salvar correções
      </Button>
      <Button type="button" variant="ghost" onClick={cancel}>
        Cancelar edição
      </Button>
    </form>
  );
}
export function cloneRoutine(r: Routine): Routine {
  return {
    ...structuredClone(r),
    id: uid(),
    name: r.name + " (cópia)",
    exercises: r.exercises.map((e) => ({ ...e, id: uid() })),
  };
}
