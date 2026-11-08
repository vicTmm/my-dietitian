import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { download } from "../../lib/storage";
import { Button } from "../../components/ui/button";
import type { TrainingData } from "./model";
import { exportCsv, importCsv, mergeTraining, parseTraining } from "./transfer";
export function DataTools({
  data,
  change,
  profileId,
  notify,
}: {
  data: TrainingData;
  change: (fn: (d: TrainingData) => TrainingData) => void;
  profileId: string;
  notify: (s: string) => void;
}) {
  const [preview, setPreview] = useState<TrainingData | null>(null),
    [cloud, setCloud] = useState<{
      revision: number;
      data: TrainingData;
    } | null>(null),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [restore, setRestore] = useState(false),
    [message, setMessage] = useState("");
  async function remote(action: "read" | "send") {
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || auth.user?.id !== profileId)
        throw Error("Entre na conta deste perfil para sincronizar.");
      if (action === "read") {
        const { data: row, error } = await supabase
          .from("training_snapshots")
          .select("data,revision")
          .eq("user_id", profileId)
          .maybeSingle();
        if (error) throw error;
        setCloud(
          row
            ? {
                revision: row.revision,
                data: parseTraining(JSON.stringify(row.data)),
              }
            : null,
        );
        setLoaded(true);
        setMessage(
          row
            ? "Versão da nuvem consultada. Escolha como combinar seus dados."
            : "Nenhum treino na nuvem ainda. Você pode enviar seus registros.",
        );
      } else {
        const payload = {
          user_id: profileId,
          data,
          revision: (cloud?.revision || 0) + 1,
        };
        const result = cloud
          ? await supabase
              .from("training_snapshots")
              .update(payload)
              .eq("user_id", profileId)
              .eq("revision", cloud.revision)
              .select("revision")
          : await supabase
              .from("training_snapshots")
              .insert(payload)
              .select("revision");
        if (result.error) throw result.error;
        if (!result.data?.length)
          throw Error(
            "Outro dispositivo alterou os dados. Consulte a nuvem novamente antes de enviar.",
          );
        setCloud({ revision: payload.revision, data: structuredClone(data) });
        setMessage(
          "Treinos enviados. No outro dispositivo, consulte e incorpore a versão da nuvem.",
        );
      }
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Não foi possível sincronizar. Confira a conexão e a configuração do serviço.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>Seus dados de treino</h2>
      <div className="training-actions">
        <Button
          variant="outline"
          onClick={() =>
            download(
              "numa-treinos.json",
              JSON.stringify(data, null, 2),
              "application/json",
            )
          }
        >
          Backup JSON
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            download("numa-treinos.csv", exportCsv(data), "text/csv")
          }
        >
          Exportar planilha CSV
        </Button>
      </div>
      <label className="training-field">
        Importar JSON Numa ou CSV Strong / Hevy / FitNotes (kg)
        <input
          type="file"
          accept=".json,.csv"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setPreview(null);
            if (f.size > 10_000_000) {
              notify("Arquivo acima de 10 MB.");
              return;
            }
            try {
              const raw = await f.text();
              setPreview(
                f.name.toLowerCase().endsWith(".json")
                  ? parseTraining(raw)
                  : importCsv(raw),
              );
            } catch (err) {
              notify(
                err instanceof Error
                  ? err.message
                  : "Não foi possível importar.",
              );
            }
          }}
        />
      </label>
      {preview && (
        <div className="training-confirm">
          <p>
            Importar {preview.routines.length} rotinas, {preview.history.length}{" "}
            sessões e {preview.weights.length} registros de peso? Registros
            existentes com o mesmo identificador serão preservados. O treino em
            andamento não será substituído.
          </p>
          <Button
            onClick={() => {
              change((d) => mergeTraining(d, preview));
              setPreview(null);
              notify("Dados incorporados.");
            }}
          >
            Confirmar importação
          </Button>
          <Button variant="ghost" onClick={() => setPreview(null)}>
            Cancelar
          </Button>
        </div>
      )}
      <h3>Entre dispositivos</h3>
      <p>
        Sincronização manual por conta. Consulte a nuvem, incorpore os registros
        e envie a versão atualizada. Backups completos preservam o treino em
        andamento.
      </p>
      {!supabase ? (
        <p>
          Disponível quando uma conta conectada e o serviço de sincronização
          estiverem configurados. Por enquanto, use o backup JSON para
          transferir os registros.
        </p>
      ) : (
        <>
          <Button
            disabled={busy}
            variant="outline"
            onClick={() => remote("read")}
          >
            Consultar nuvem
          </Button>
          {loaded && (
            <Button disabled={busy} onClick={() => remote("send")}>
              Enviar versão deste dispositivo
            </Button>
          )}
          {cloud && (
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => {
                change((d) => mergeTraining(d, cloud.data));
                setMessage(
                  "Registros da nuvem incorporados. Alterações de registros já existentes foram preservadas neste dispositivo.",
                );
              }}
            >
              Incorporar registros da nuvem
            </Button>
          )}
          {cloud && (
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => setRestore(true)}
            >
              Restaurar versão da nuvem
            </Button>
          )}
          {restore && cloud && (
            <div className="training-confirm">
              <p>
                Substituir os treinos deste dispositivo pelo backup da nuvem?
                Uma cópia dos dados atuais será baixada antes da restauração.
              </p>
              <Button
                onClick={() => {
                  download(
                    "numa-antes-de-restaurar.json",
                    JSON.stringify(data, null, 2),
                    "application/json",
                  );
                  change(() => structuredClone(cloud.data));
                  setRestore(false);
                  setMessage("Versão da nuvem restaurada.");
                }}
              >
                Confirmar restauração
              </Button>
              <Button variant="ghost" onClick={() => setRestore(false)}>
                Cancelar
              </Button>
            </div>
          )}
          <p role="status">{busy ? "Conectando…" : message}</p>
        </>
      )}
    </section>
  );
}
