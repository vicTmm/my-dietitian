import { Fragment, useEffect, useState } from "react";
import type { Profile } from "../../lib/data";
import { localDate } from "../../lib/data";
import { Button } from "../../components/ui/button";
import { download } from "../../lib/storage";
import {
  completedSets,
  emptyTraining,
  exerciseRecords,
  finishWorkout,
  newExercise,
  startWorkout,
  uid,
  validRoutine,
  volume,
} from "./model";
import type { Routine, TrainingData, Workout } from "./model";
import "./training.css";
import {
  Catalog,
  ExerciseOptions,
  SetOptions,
  Analytics,
  Schedule,
  HistoryEditor,
  cloneRoutine,
} from "./Advanced";
import { DataTools } from "./DataTools";
const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const number = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
type Props = {
  profile: Profile;
  update: (change: (p: Profile) => Profile) => void;
  notify: (message: string) => void;
};
export default function Training({ profile, update, notify }: Props) {
  const data = profile.training || emptyTraining();
  const [tab, setTab] = useState<
    "routines" | "session" | "history" | "stats" | "catalog" | "data"
  >("routines");
  const [historyEdit, setHistoryEdit] = useState<Workout | null>(null);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [confirm, setConfirm] = useState<{
    label: string;
    run: () => void;
  } | null>(null);
  function change(fn: (d: TrainingData) => TrainingData) {
    update((p) => ({ ...p, training: fn(p.training || emptyTraining()) }));
  }
  const records = exerciseRecords(data.history);
  function start(r: Routine) {
    if (data.active) {
      setTab("session");
      return;
    }
    change((d) => ({
      ...d,
      active: startWorkout(r, d.history),
      restUntil: null,
    }));
    setTab("session");
  }
  function save(r: Routine) {
    change((d) => ({
      ...d,
      routines: d.routines.some((x) => x.id === r.id)
        ? d.routines.map((x) => (x.id === r.id ? r : x))
        : [...d.routines, r],
    }));
    setEditing(null);
    notify("Rotina salva.");
  }
  return (
    <div className="training">
      <header className="training-heading">
        <div>
          <h1>Meus treinos</h1>
          <p>Planeje sua rotina e acompanhe o que você treinou.</p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            download(
              "treinos.json",
              JSON.stringify(data, null, 2),
              "application/json",
            )
          }
        >
          Exportar treinos
        </Button>
      </header>
      <nav className="training-tabs" aria-label="Seções de treinos">
        {(
          [
            ["routines", "Rotinas"],
            ["session", data.active ? "Treino em andamento" : "Treinar"],
            ["history", "Histórico"],
            ["stats", "Evolução"],
            ["catalog", "Exercícios"],
            ["data", "Dados e sincronização"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => {
              setTab(id);
              setEditing(null);
              setConfirm(null);
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "catalog" && (
        <Catalog
          add={(e) => {
            setEditing({ id: uid(), name: "", days: [], exercises: [e] });
            setTab("routines");
          }}
        />
      )}
      {tab === "data" && (
        <DataTools
          data={data}
          change={change}
          profileId={profile.id}
          notify={notify}
        />
      )}
      {historyEdit && tab === "history" && (
        <HistoryEditor
          workout={historyEdit}
          cancel={() => setHistoryEdit(null)}
          save={(w) => {
            change((d) => ({
              ...d,
              history: d.history.map((x) => (x.id === w.id ? w : x)),
            }));
            setHistoryEdit(null);
            notify("Histórico corrigido. Recordes recalculados.");
          }}
        />
      )}
      {confirm && (
        <div className="training-confirm" role="alert">
          <p>{confirm.label}</p>
          <Button
            variant="danger"
            onClick={() => {
              confirm.run();
              setConfirm(null);
            }}
          >
            Confirmar exclusão
          </Button>
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Cancelar
          </Button>
        </div>
      )}
      {tab === "routines" &&
        (editing ? (
          <RoutineEditor
            key={editing.id}
            initial={editing}
            save={save}
            cancel={() => setEditing(null)}
          />
        ) : (
          <>
            <div className="training-toolbar">
              <h2>Suas rotinas</h2>
              <Button
                onClick={() =>
                  setEditing({
                    id: uid(),
                    name: "",
                    days: [],
                    exercises: [newExercise()],
                  })
                }
              >
                Criar rotina
              </Button>
            </div>
            <Schedule data={data} change={change} start={start} />
            {!data.routines.length && (
              <div className="training-empty">
                <h3>Seu primeiro treino começa com uma rotina.</h3>
                <p>
                  Adicione os exercícios do seu treino, séries, repetições e
                  intervalos. Você pode escolher os dias ou deixar a rotina
                  livre.
                </p>
              </div>
            )}
            {data.routines.map((r) => (
              <article className="training-routine" key={r.id}>
                <div>
                  <h3>{r.name}</h3>
                  <p>
                    {r.days.length
                      ? r.days.map((i) => days[i]).join(" · ")
                      : "Dias livres"}{" "}
                    · {r.exercises.length} exercícios
                  </p>
                  <p>{r.exercises.map((e) => e.name).join(" / ")}</p>
                </div>
                <div className="training-actions">
                  <Button onClick={() => start(r)}>
                    {data.active ? "Retomar treino" : "Iniciar treino"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(structuredClone(r))}
                  >
                    Editar {r.name}
                  </Button>
                  <Button variant="ghost" onClick={() => save(cloneRoutine(r))}>
                    Duplicar rotina
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setConfirm({
                        label: `Excluir a rotina “${r.name}”? O histórico e o treino em andamento serão preservados.`,
                        run: () =>
                          change((d) => ({
                            ...d,
                            routines: d.routines.filter((x) => x.id !== r.id),
                          })),
                      })
                    }
                  >
                    Excluir rotina
                  </Button>
                </div>
              </article>
            ))}
          </>
        ))}
      {tab === "session" &&
        (data.active ? (
          <>
            <div className="training-toolbar">
              <div>
                <h2>{data.active.name}</h2>
                <p>
                  {completedSets(data.active).length} séries concluídas ·{" "}
                  {number(volume(data.active))} kg de volume registrado
                </p>
              </div>
              <RestTimer
                until={data.restUntil}
                skip={() => change((d) => ({ ...d, restUntil: null }))}
              />
            </div>
            {data.active.exercises.map((e) => (
              <section className="training-exercise" key={e.id}>
                <h3>{e.name}</h3>
                <p>
                  Intervalo: {e.rest} s
                  {e.superset
                    ? ` · Superset ${e.superset}: alterne os exercícios deste grupo`
                    : ""}
                  {e.mode && e.mode !== "strength"
                    ? " · Preencha a duração abaixo da série"
                    : ""}
                </p>
                <div className="training-set-head">
                  <span>Série</span>
                  <span>Carga (kg)</span>
                  <span>Repetições</span>
                  <span>Feita</span>
                </div>
                {e.sets.map((s, i) => (
                  <Fragment key={s.id}>
                    <div className="training-set">
                      <span>{i + 1}</span>
                      <input
                        aria-label={`${e.name}, série ${i + 1}, carga`}
                        type="number"
                        min="0"
                        max="2000"
                        step="0.25"
                        value={s.kg}
                        onChange={(ev) => {
                          const kg = ev.target.valueAsNumber;
                          if (Number.isFinite(kg) && kg >= 0 && kg <= 2000)
                            change((d) => patchSet(d, e.id, s.id, { kg }));
                        }}
                      />
                      <input
                        aria-label={`${e.name}, série ${i + 1}, repetições`}
                        type="number"
                        min="1"
                        max="1000"
                        value={s.reps}
                        onChange={(ev) => {
                          const reps = ev.target.valueAsNumber;
                          if (
                            Number.isInteger(reps) &&
                            reps >= 1 &&
                            reps <= 1000
                          )
                            change((d) => patchSet(d, e.id, s.id, { reps }));
                        }}
                      />
                      <input
                        type="checkbox"
                        aria-label={`Concluir ${e.name}, série ${i + 1}`}
                        checked={s.done}
                        disabled={
                          (e.mode === "timed" || e.mode === "cardio") &&
                          !s.seconds &&
                          !s.done
                        }
                        onChange={() =>
                          change((d) => ({
                            ...patchSet(d, e.id, s.id, { done: !s.done }),
                            restUntil:
                              !s.done &&
                              e.rest &&
                              (!e.superset ||
                                data.active?.exercises
                                  .filter((x) => x.superset === e.superset)
                                  .at(-1)?.id === e.id)
                                ? Date.now() + e.rest * 1000
                                : null,
                          }))
                        }
                      />
                    </div>
                    <SetOptions
                      s={s}
                      mode={e.mode}
                      change={(patch) =>
                        change((d) => patchSet(d, e.id, s.id, patch))
                      }
                      duplicate={() =>
                        change((d) => ({
                          ...d,
                          active: d.active
                            ? {
                                ...d.active,
                                exercises: d.active.exercises.map((x) =>
                                  x.id === e.id
                                    ? {
                                        ...x,
                                        sets: [
                                          ...x.sets,
                                          { ...s, id: uid(), done: false },
                                        ],
                                      }
                                    : x,
                                ),
                              }
                            : null,
                        }))
                      }
                      remove={() =>
                        change((d) => ({
                          ...d,
                          active: d.active
                            ? {
                                ...d.active,
                                exercises: d.active.exercises.map((x) =>
                                  x.id === e.id
                                    ? {
                                        ...x,
                                        sets: x.sets.filter(
                                          (a) => a.id !== s.id,
                                        ),
                                      }
                                    : x,
                                ),
                              }
                            : null,
                        }))
                      }
                    />
                  </Fragment>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    change((d) => ({
                      ...d,
                      active: d.active
                        ? {
                            ...d.active,
                            exercises: d.active.exercises.map((x) =>
                              x.id === e.id
                                ? {
                                    ...x,
                                    sets: [
                                      ...x.sets,
                                      {
                                        id: uid(),
                                        kg: 0,
                                        reps: 10,
                                        done: false,
                                      },
                                    ],
                                  }
                                : x,
                            ),
                          }
                        : null,
                    }))
                  }
                >
                  Adicionar série
                </Button>
              </section>
            ))}
            <p>
              Ao finalizar, apenas as séries marcadas entram nos totais. As
              demais ficam registradas como não concluídas.
            </p>
            <div className="training-actions">
              <Button
                disabled={
                  !completedSets(data.active).length ||
                  data.active.exercises.some(
                    (e) =>
                      (e.mode === "timed" || e.mode === "cardio") &&
                      e.sets.some((s) => s.done && !s.seconds),
                  )
                }
                onClick={() => {
                  change((d) => finishWorkout(d));
                  setTab("history");
                  notify("Treino salvo no histórico.");
                }}
              >
                Finalizar treino
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setConfirm({
                    label: "Descartar este treino em andamento?",
                    run: () =>
                      change((d) => ({ ...d, active: null, restUntil: null })),
                  })
                }
              >
                Descartar treino
              </Button>
            </div>
          </>
        ) : (
          <div className="training-empty">
            <h2>Nenhum treino em andamento</h2>
            <p>
              Escolha uma rotina para começar. Suas séries ficam salvas enquanto
              você treina.
            </p>
            <Button onClick={() => setTab("routines")}>Ver rotinas</Button>
          </div>
        ))}
      {tab === "history" && (
        <>
          <h2>Histórico de treinos</h2>
          {!data.history.length && (
            <p className="training-empty">
              Seus treinos concluídos aparecerão aqui.
            </p>
          )}
          {data.history.map((w) => (
            <details className="training-history" key={w.id}>
              <summary>
                <strong>{w.name}</strong>
                <span>
                  {date(w.startedAt)} · {completedSets(w).length} séries ·{" "}
                  {number(volume(w))} kg
                </span>
              </summary>
              {w.exercises.map((e) => (
                <div key={e.id}>
                  <h3>{e.name}</h3>
                  <p>
                    {e.sets
                      .map(
                        (s, i) =>
                          `Série ${i + 1}: ${e.mode === "timed" || e.mode === "cardio" ? `${s.seconds || 0} s${e.mode === "cardio" ? ` · ${s.km || 0} km` : ""}` : `${number(s.kg)} kg × ${s.reps}`}${s.done ? "" : " (não concluída)"}`,
                      )
                      .join(" · ")}
                  </p>
                </div>
              ))}
              <Button variant="outline" onClick={() => setHistoryEdit(w)}>
                Editar treino
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setConfirm({
                    label: `Excluir o treino “${w.name}” de ${date(w.startedAt)}? Os recordes serão recalculados.`,
                    run: () =>
                      change((d) => ({
                        ...d,
                        history: d.history.filter((x) => x.id !== w.id),
                      })),
                  })
                }
              >
                Excluir treino
              </Button>
            </details>
          ))}
        </>
      )}
      {tab === "stats" && (
        <>
          <h2>Evolução nos treinos</h2>
          <p>
            {data.history.length} treinos concluídos ·{" "}
            {data.history.reduce((n, w) => n + completedSets(w).length, 0)}{" "}
            séries · {number(data.history.reduce((n, w) => n + volume(w), 0))}{" "}
            kg de volume total
          </p>
          <h3>Melhores cargas registradas</h3>
          <p>
            Maior carga por exercício; em caso de empate, maior número de
            repetições. Carga externa de 0 kg representa exercícios sem carga
            adicionada.
          </p>
          {!records.length ? (
            <p className="training-empty">
              Conclua um treino para acompanhar seus registros.
            </p>
          ) : (
            <ul className="training-records">
              {records.map((r) => (
                <li key={r.name}>
                  <strong>{r.name}</strong>
                  <span>
                    {number(r.kg)} kg × {r.reps}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Analytics data={data} />
          <WeightLog data={data} change={change} />
        </>
      )}
    </div>
  );
}
function patchSet(
  d: TrainingData,
  exerciseId: string,
  setId: string,
  patch: Partial<Workout["exercises"][number]["sets"][number]>,
): TrainingData {
  return {
    ...d,
    active: d.active
      ? {
          ...d.active,
          exercises: d.active.exercises.map((e) =>
            e.id === exerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) =>
                    s.id === setId ? { ...s, ...patch } : s,
                  ),
                }
              : e,
          ),
        }
      : null,
  };
}
function RestTimer({
  until,
  skip,
}: {
  until: number | null;
  skip: () => void;
}) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    setNow(Date.now());
    if (!until) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [until]);
  if (!until) return null;
  const left = Math.max(0, Math.ceil((until - now) / 1000));
  return (
    <div className="training-rest">
      <span role="timer">
        {left
          ? `Descanso: ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`
          : "Intervalo concluído"}
      </span>
      <Button variant="outline" onClick={skip}>
        {left ? "Pular descanso" : "Fechar intervalo"}
      </Button>
    </div>
  );
}
function RoutineEditor({
  initial,
  save,
  cancel,
}: {
  initial: Routine;
  save: (r: Routine) => void;
  cancel: () => void;
}) {
  const [r, setR] = useState(initial);
  const [catalogOpen, setCatalogOpen] = useState(false);
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        if (validRoutine(r))
          save({
            ...r,
            name: r.name.trim(),
            exercises: r.exercises.map((e) => ({ ...e, name: e.name.trim() })),
          });
      }}
    >
      <h2>{initial.name ? "Editar rotina" : "Criar rotina"}</h2>
      <label className="training-field">
        Nome da rotina
        <input
          required
          maxLength={100}
          value={r.name}
          onChange={(e) => setR({ ...r, name: e.target.value })}
        />
      </label>
      <fieldset className="training-days">
        <legend>Dias da semana (opcional)</legend>
        {days.map((d, i) => (
          <label key={d}>
            <input
              type="checkbox"
              checked={r.days.includes(i)}
              onChange={() =>
                setR({
                  ...r,
                  days: r.days.includes(i)
                    ? r.days.filter((x) => x !== i)
                    : [...r.days, i].sort(),
                })
              }
            />
            {d}
          </label>
        ))}
      </fieldset>
      <Button
        type="button"
        variant="outline"
        onClick={() => setCatalogOpen(!catalogOpen)}
      >
        {catalogOpen ? "Fechar biblioteca" : "Adicionar da biblioteca"}
      </Button>
      {catalogOpen && (
        <Catalog
          add={(e) => {
            setR({
              ...r,
              exercises: [...r.exercises.filter((x) => x.name.trim()), e],
            });
            setCatalogOpen(false);
          }}
        />
      )}
      {r.exercises.map((e, i) => (
        <fieldset className="training-editor" key={e.id}>
          <legend>Exercício {i + 1}</legend>
          <label className="training-field">
            Nome do exercício
            <input
              required
              maxLength={100}
              value={e.name}
              onChange={(ev) =>
                setR({
                  ...r,
                  exercises: r.exercises.map((x) =>
                    x.id === e.id ? { ...x, name: ev.target.value } : x,
                  ),
                })
              }
            />
          </label>
          <div className="training-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={i === 0}
              onClick={() => {
                const list = [...r.exercises];
                [list[i - 1], list[i]] = [list[i], list[i - 1]];
                setR({ ...r, exercises: list });
              }}
            >
              Mover para cima
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={i === r.exercises.length - 1}
              onClick={() => {
                const list = [...r.exercises];
                [list[i + 1], list[i]] = [list[i], list[i + 1]];
                setR({ ...r, exercises: list });
              }}
            >
              Mover para baixo
            </Button>
          </div>
          <ExerciseOptions
            e={e}
            change={(patch) =>
              setR({
                ...r,
                exercises: r.exercises.map((x) =>
                  x.id === e.id ? { ...x, ...patch } : x,
                ),
              })
            }
          />
          <div className="training-numbers">
            {(
              [
                ["sets", "Séries", 1, 30, 1],
                ["reps", "Repetições", 1, 1000, 1],
                ["kg", "Carga (kg)", 0, 2000, 0.25],
                ["rest", "Descanso (s)", 0, 900, 1],
              ] as const
            ).map(([key, label, min, max, step]) => (
              <label className="training-field" key={key}>
                {label}
                <input
                  required
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={Number.isNaN(e[key]) ? "" : e[key]}
                  onChange={(ev) =>
                    setR({
                      ...r,
                      exercises: r.exercises.map((x) =>
                        x.id === e.id
                          ? { ...x, [key]: ev.target.valueAsNumber }
                          : x,
                      ),
                    })
                  }
                />
              </label>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            disabled={r.exercises.length === 1}
            onClick={() =>
              setR({
                ...r,
                exercises: r.exercises.filter((x) => x.id !== e.id),
              })
            }
          >
            Remover exercício {i + 1}
          </Button>
        </fieldset>
      ))}
      <div className="training-actions">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            setR({ ...r, exercises: [...r.exercises, newExercise()] })
          }
        >
          Adicionar exercício
        </Button>
        <Button disabled={!validRoutine(r)}>Salvar rotina</Button>
        <Button type="button" variant="ghost" onClick={cancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
function WeightLog({
  data,
  change,
}: {
  data: TrainingData;
  change: (fn: (d: TrainingData) => TrainingData) => void;
}) {
  const [day, setDay] = useState(localDate);
  const [kg, setKg] = useState("");
  return (
    <section className="training-weight">
      <h3>Peso corporal</h3>
      <p>
        Um registro por dia. Salvar na mesma data substitui o valor anterior.
      </p>
      <form
        className="training-actions"
        onSubmit={(ev) => {
          ev.preventDefault();
          const value = Number(kg);
          if (
            !day ||
            day > localDate() ||
            !Number.isFinite(value) ||
            value <= 0 ||
            value > 500
          )
            return;
          change((d) => ({
            ...d,
            weights: [
              ...d.weights.filter((w) => w.date !== day),
              { date: day, kg: value },
            ].sort((a, b) => b.date.localeCompare(a.date)),
          }));
          setKg("");
        }}
      >
        <label className="training-field">
          Data
          <input
            type="date"
            required
            max={localDate()}
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
        <label className="training-field">
          Peso (kg)
          <input
            required
            type="number"
            min="0.1"
            max="500"
            step="0.1"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
          />
        </label>
        <Button>Registrar peso</Button>
      </form>
      {!data.weights.length ? (
        <p>Nenhum peso registrado.</p>
      ) : (
        <ul className="training-records">
          {data.weights.map((w) => (
            <li key={w.date}>
              <span>{date(w.date + "T12:00:00")}</span>
              <strong>{number(w.kg)} kg</strong>
              <Button
                variant="ghost"
                aria-label={`Remover peso de ${date(w.date + "T12:00:00")}`}
                onClick={() =>
                  change((d) => ({
                    ...d,
                    weights: d.weights.filter((x) => x.date !== w.date),
                  }))
                }
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
