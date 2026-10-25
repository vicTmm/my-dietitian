import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  Droplets,
  Flame,
  House,
  Leaf,
  LogOut,
  Menu,
  Minus,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBasket,
  Trash2,
  Trophy,
  Utensils,
  Wallet,
  X,
  Heart,
  RefreshCw,
  CalendarDays,
  BookOpen,
  Sun,
  Pill,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import {
  createProfile,
  emptyDay,
  generateGroceries,
  localDate,
  totals,
  weekDates,
} from "./lib/data";
import type { Day, Meal, Profile, Supplement } from "./lib/data";
import { download, readDatabase, writeDatabase } from "./lib/storage";
import { supabase } from "./lib/supabase";
type Page =
  | "today"
  | "plan"
  | "groceries"
  | "routine"
  | "progress"
  | "settings";
const navigation = [
  { id: "today", label: "Visão geral", icon: House },
  { id: "plan", label: "Plano alimentar", icon: Utensils },
  { id: "groceries", label: "Lista de compras", icon: ShoppingBasket },
  { id: "routine", label: "Minha rotina", icon: Sun },
  { id: "progress", label: "Minha evolução", icon: Trophy },
] as const;
const titles: Record<Page, string> = {
  today: "Visão geral",
  plan: "Plano alimentar",
  groceries: "Lista de compras",
  routine: "Minha rotina",
  progress: "Minha evolução",
  settings: "Meu perfil",
};
function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark">
        b<span />
      </span>
      base<span className="logo-dot">.</span>
    </span>
  );
}
function Tag({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}
function MealImage({
  meal,
  className = "",
}: {
  meal: Meal;
  className?: string;
}) {
  return (
    <div className={`meal-image ${className}`}>
      <img
        src={meal.image}
        alt={meal.description}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <Utensils className="image-fallback" size={32} />
    </div>
  );
}
export default function App() {
  const menuRef = useRef<HTMLElement>(null);
  const [db, setDb] = useState(readDatabase);
  const [page, setPage] = useState<Page>("today");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [sessionLoading, setSessionLoading] = useState(Boolean(supabase));
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      writeDatabase(db);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [db]);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const client = supabase;
    function apply(
      user:
        | {
            id: string;
            email?: string;
            user_metadata?: Record<string, unknown>;
          }
        | undefined,
    ) {
      if (!active) return;
      if (user) {
        setDb((old) => {
          const exists = old.profiles.some((p) => p.id === user.id);
          const name = String(
            user.user_metadata?.name ||
              user.email?.split("@")[0] ||
              "Meu perfil",
          );
          return {
            ...old,
            session: user.id,
            profiles: exists
              ? old.profiles
              : [
                  ...old.profiles,
                  createProfile(user.id, name, user.email || ""),
                ],
          };
        });
      } else setDb((old) => ({ ...old, session: null }));
      setSessionLoading(false);
    }
    client.auth
      .getSession()
      .then(({ data, error }) => {
        if (error)
          notify("Não foi possível verificar sua sessão. Entre novamente.");
        apply(data.session?.user);
      })
      .catch(() => {
        setSessionLoading(false);
        notify("Falha de conexão com o Supabase. Tente novamente.");
      });
    const { data } = client.auth.onAuthStateChange((_event, session) =>
      apply(session?.user),
    );
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const previous = document.activeElement as HTMLElement | null;
    const sidebar = menuRef.current;
    const focusable = () =>
      Array.from(
        sidebar?.querySelectorAll<HTMLElement>("button:not([disabled])") || [],
      ).filter((el) => el.getClientRects().length > 0);
    focusable()[0]?.focus();
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(false);
        return;
      }
      if (e.key === "Tab") {
        const items = focusable();
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [menu]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  function notify(message: string) {
    setToast(message);
  }
  const profile = db.profiles.find((p) => p.id === db.session);
  function update(change: (p: Profile) => Profile) {
    setDb((old) => ({
      ...old,
      profiles: old.profiles.map((p) => (p.id === old.session ? change(p) : p)),
    }));
  }
  function updateDay(change: (d: Day) => Day) {
    update((p) => ({
      ...p,
      days: {
        ...p.days,
        [localDate()]: change(p.days[localDate()] || emptyDay()),
      },
    }));
  }
  function go(next: Page) {
    setPage(next);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function logout() {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        notify(error.message);
        return;
      }
    }
    setDb((old) => ({ ...old, session: null }));
    setPage("today");
  }
  const notice = (
    <>
      {toast ? (
        <div role="status" className="toast">
          <CheckCheck size={18} />
          {toast}
          <button aria-label="Dispensar aviso" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      ) : null}
      {storageError ? (
        <div role="alert" className="storage-error">
          Não foi possível salvar neste navegador. Exporte seus dados em Meu
          perfil antes de sair.
        </div>
      ) : null}
    </>
  );
  if (sessionLoading)
    return (
      <div className="loading-screen">
        <Logo />
        <p>Preparando sua base…</p>
      </div>
    );
  if (!profile)
    return (
      <>
        <Login
          profiles={db.profiles}
          onLogin={(id) => {
            setDb((old) => ({ ...old, session: id }));
            setPage("today");
          }}
          notify={notify}
        />
        {notice}
      </>
    );
  const day = profile.days[localDate()] || emptyDay();
  const checked = profile.groceries.filter((g) => g.checked).length;
  const xp = Object.values(profile.days).reduce(
    (n, d) =>
      n +
      (d.checkin ? 40 : 0) +
      (d.water >= profile.waterGoal ? 30 : 0) +
      d.supplements.length * 10,
    0,
  );
  const level = Math.floor(xp / 200) + 1;
  return (
    <div className="app-shell">
      <aside ref={menuRef} className={`sidebar ${menu ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Logo />
          <button
            className="mobile-close"
            aria-label="Fechar navegação"
            onClick={() => setMenu(false)}
          >
            <X />
          </button>
        </div>
        <div className="workspace-label">SEU ESPAÇO, SEU RITMO</div>
        <nav aria-label="Navegação principal">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              onClick={() => go(item.id)}
            >
              <item.icon size={19} />
              <span>{item.label}</span>
              {item.id === "groceries" ? (
                <span className="nav-count">
                  {profile.groceries.length - checked}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="membership">
            <div className="membership-title">
              <ShieldCheck size={22} />
              <span>
                Uma boa base.
                <br />
                <strong>Um dia de cada vez.</strong>
              </span>
            </div>
            <p>O que conta é encontrar um ritmo que cabe na sua vida.</p>
            <span className="membership-stripe" />
          </div>
          <button
            className={`nav-item ${page === "settings" ? "active" : ""}`}
            onClick={() => go("settings")}
          >
            <Settings2 size={19} />
            Configurações
          </button>
          <button className="profile-button" onClick={() => go("settings")}>
            <span className="avatar">{profile.name.slice(0, 1)}</span>
            <span>
              <strong>{profile.name}</strong>
              <small>Seu espaço pessoal</small>
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>
      {menu ? (
        <button
          className="mobile-scrim"
          aria-label="Fechar menu"
          onClick={() => setMenu(false)}
        />
      ) : null}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu"
              aria-label="Abrir navegação"
              onClick={() => setMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span className="desktop-only">Meu espaço</span>
            <ChevronRight className="desktop-only" size={14} />
            <strong>{titles[page]}</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-indicator">
              <span />
              {supabase
                ? "Conta conectada · dados locais"
                : "Modo demonstração"}
            </span>
            <button
              className="top-profile"
              onClick={() => go("settings")}
              aria-label="Abrir meu perfil"
            >
              <span className="avatar avatar-small">
                {profile.name.slice(0, 1)}
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        <main id="main-content" key={page}>
          {page === "today" ? (
            <Dashboard
              profile={profile}
              day={day}
              xp={xp}
              level={level}
              go={go}
              updateDay={updateDay}
              notify={notify}
            />
          ) : null}
          {page === "plan" ? (
            <Plan profile={profile} update={update} notify={notify} go={go} />
          ) : null}
          {page === "groceries" ? (
            <Groceries profile={profile} update={update} notify={notify} />
          ) : null}
          {page === "routine" ? (
            <Routine
              profile={profile}
              day={day}
              update={update}
              updateDay={updateDay}
              notify={notify}
            />
          ) : null}
          {page === "progress" ? (
            <Progress profile={profile} xp={xp} level={level} />
          ) : null}
          {page === "settings" ? (
            <Settings
              profile={profile}
              update={update}
              notify={notify}
              logout={logout}
            />
          ) : null}
          <footer className="page-footer">
            <span>
              base. <span>Menos controle. Mais constância.</span>
            </span>
            <span>Dados ilustrativos · personalize com seu plano</span>
          </footer>
        </main>
      </div>
      {notice}
    </div>
  );
}
function Login({
  profiles,
  onLogin,
  notify,
}: {
  profiles: Profile[];
  onLogin: (id: string) => void;
  notify: (s: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [signup, setSignup] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    try {
      const result = signup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) notify(result.error.message);
      else if (signup && !result.data.session)
        notify("Conta criada. Confirme seu e-mail para entrar.");
    } catch {
      notify("Não foi possível conectar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login">
      <section className="login-story">
        <Logo />
        <div>
          <div className="login-symbol">
            <Leaf size={44} />
            <span>+ um bom hábito</span>
          </div>
          <h1>
            Comer bem.
            <br />
            Viver leve.
            <br />
            <em>Ter uma base.</em>
          </h1>
          <p>
            Seu plano, suas compras e pequenas conquistas.
            <br />
            Tudo no seu ritmo.
          </p>
        </div>
        <span>FEITO PARA A VIDA REAL.</span>
      </section>
      <section className="login-panel">
        <div className="login-form">
          <Tag>Seu próximo bom hábito começa aqui</Tag>
          <h2>Bem-vindo à sua base.</h2>
          <p className="muted">Um espaço para cuidar de você, sem complicar.</p>
          {supabase ? (
            <form onSubmit={submit}>
              <label>
                E-mail
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Senha
                <input
                  type="password"
                  autoComplete={signup ? "new-password" : "current-password"}
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <Button disabled={busy} type="submit">
                {busy ? "Conectando…" : signup ? "Criar minha conta" : "Entrar"}
                <ArrowRight size={17} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSignup(!signup)}
              >
                {signup ? "Já tenho uma conta" : "Criar uma conta"}
              </Button>
              <p className="small muted">
                Autenticação Supabase. Os dados do plano continuam neste
                navegador nesta versão.
              </p>
            </form>
          ) : (
            <>
              <div className="demo-login-note">
                <ShieldCheck size={19} />
                <span>
                  Demonstração pronta para explorar.
                  <br />
                  <strong>Escolha um perfil para começar.</strong>
                </span>
              </div>
              <div className="profile-options">
                {profiles
                  .filter((p) => ["victor", "julia"].includes(p.id))
                  .map((p, i) => (
                    <button key={p.id} onClick={() => onLogin(p.id)}>
                      <span className={`avatar ${i ? "avatar-yellow" : ""}`}>
                        {p.name[0]}
                      </span>
                      <span>
                        <strong>{p.name}</strong>
                        <small>
                          {i
                            ? "Uma base só sua"
                            : "Seu planejamento começa aqui"}
                        </small>
                      </span>
                      <ArrowRight size={20} />
                    </button>
                  ))}
              </div>
              <p className="login-disclaimer">
                Perfis demonstrativos, sem senha. Cada espaço salva seus dados
                separadamente neste navegador.
              </p>
            </>
          )}
          <div className="login-promise">
            <Heart size={16} />
            Planejar melhor. Cobrar menos de si.
          </div>
        </div>
      </section>
    </div>
  );
}
function Heading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
function SectionTitle({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {detail ? <p>{detail}</p> : null}
      </div>
      {children}
    </div>
  );
}
function Water({
  profile,
  day,
  updateDay,
  notify,
}: {
  profile: Profile;
  day: Day;
  updateDay: (f: (d: Day) => Day) => void;
  notify: (s: string) => void;
}) {
  const percent = Math.min(
    100,
    Math.round((day.water / profile.waterGoal) * 100),
  );
  return (
    <section className="water-panel panel">
      <div className="panel-title">
        <h2>
          <Droplets size={19} />
          Água, sem esquecer
        </h2>
        <Tag tone="blue">{percent}%</Tag>
      </div>
      <div className="water-value">
        {(day.water / 1000).toLocaleString("pt-BR", {
          maximumFractionDigits: 2,
        })}
        <span>/ {(profile.waterGoal / 1000).toLocaleString("pt-BR")} L</span>
      </div>
      <div
        className="water-glasses"
        aria-label={`${day.water} de ${profile.waterGoal} mililitros`}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`glass ${i < Math.floor(percent / 12.5) ? "filled" : ""}`}
          >
            <span />
          </div>
        ))}
      </div>
      <p>
        {percent >= 100
          ? "Sua meta de hoje está completa. Boa!"
          : "Uma pausa, um copo. Vai no seu tempo."}
      </p>
      <div className="water-actions">
        <Button
          variant="outline"
          size="icon"
          aria-label="Remover 250 ml"
          disabled={day.water === 0}
          onClick={() =>
            updateDay((d) => ({ ...d, water: Math.max(0, d.water - 250) }))
          }
        >
          <Minus size={17} />
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            updateDay((d) => ({ ...d, water: d.water + 250 }));
            notify("250 ml adicionados à sua água de hoje.");
          }}
        >
          <Plus size={16} />
          250 ml
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            updateDay((d) => ({ ...d, water: d.water + 500 }));
            notify("500 ml adicionados à sua água de hoje.");
          }}
        >
          + 500 ml
        </Button>
      </div>
    </section>
  );
}
function Dashboard({
  profile,
  day,
  xp,
  level,
  go,
  updateDay,
  notify,
}: {
  profile: Profile;
  day: Day;
  xp: number;
  level: number;
  go: (p: Page) => void;
  updateDay: (f: (d: Day) => Day) => void;
  notify: (s: string) => void;
}) {
  const date = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const hour = new Date().getHours();
  const ordered = [...profile.meals].sort((a, b) =>
    a.time.localeCompare(b.time),
  );
  const next =
    ordered.find((m) => m.time >= new Date().toTimeString().slice(0, 5)) ||
    ordered[ordered.length - 1];
  const macro = totals(profile.meals);
  return (
    <>
      <Heading
        title={`${hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"}, ${profile.name}.`}
        subtitle="Uma boa rotina começa com pequenas escolhas."
      >
        <span className="date-label">
          <CalendarDays size={16} />
          {date}
        </span>
      </Heading>
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <section className="welcome-banner">
            <div className="banner-copy">
              <h2>
                Seu ritmo.
                <br />
                Sua melhor versão.
              </h2>
              <p>
                Comer bem não precisa ocupar a sua cabeça.
                <br />
                Deixe o planejamento com a sua base.
              </p>
              <Button variant="yellow" onClick={() => go("plan")}>
                Ver meu plano
                <ArrowRight size={16} />
              </Button>
            </div>
            <div className="banner-emblem" aria-hidden="true">
              <div className="emblem-square">
                <Leaf size={69} strokeWidth={1.15} />
              </div>
              <span>
                UM DIA
                <br />
                <strong>DE CADA VEZ.</strong>
              </span>
            </div>
            <span className="banner-bottom">PLANEJAR · PREPARAR · VIVER</span>
          </section>
          <section className="week-panel">
            <SectionTitle title="Sua semana, no seu ritmo">
              <span className="small muted">
                {weekDates().filter((d) => profile.days[d.key]?.checkin).length}{" "}
                dias de check-in
              </span>
            </SectionTitle>
            <div className="week-days">
              {weekDates().map((d) => (
                <div
                  key={d.key}
                  className={`week-day ${d.key === localDate() ? "is-today" : ""} ${profile.days[d.key]?.checkin ? "is-done" : ""}`}
                >
                  <span>{d.label}</span>
                  <div>
                    {profile.days[d.key]?.checkin ? <Check size={17} /> : d.day}
                  </div>
                  <small>
                    {d.key === localDate()
                      ? "hoje"
                      : profile.days[d.key]?.checkin
                        ? "feito"
                        : "—"}
                  </small>
                </div>
              ))}
            </div>
            <div className="week-bottom">
              <span>
                <Flame size={16} />
                Toda pequena escolha conta.
              </span>
              <button onClick={() => go("progress")}>
                Minha evolução
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
          <SectionTitle
            title="Na sua mesa hoje"
            detail="O plano cuida das opções. Você escolhe o ritmo."
          >
            <button className="text-link" onClick={() => go("plan")}>
              Ver tudo
              <ArrowRight size={15} />
            </button>
          </SectionTitle>
          {next ? (
            <section className="featured-meal">
              <MealImage meal={next} />
              <div className="featured-meal-content">
                <div className="meal-meta">
                  <Tag tone="green">No seu plano</Tag>
                  <span>
                    <Clock3 size={13} />
                    {next.time}
                  </span>
                </div>
                <h3>{next.name}</h3>
                <p>{next.description}</p>
                <div className="meal-nutrition">
                  <span>
                    <strong>{next.kcal}</strong> kcal previstas
                  </span>
                  <span>
                    <strong>{next.protein} g</strong> proteína
                  </span>
                </div>
                <button className="text-link" onClick={() => go("plan")}>
                  Ver porções e substituições
                  <ArrowRight size={15} />
                </button>
              </div>
            </section>
          ) : (
            <Empty
              title="Seu plano está pronto para começar"
              text="Adicione suas refeições em Plano alimentar."
            />
          )}
          <section className="nutrition-summary">
            <div>
              <h3>O equilíbrio do seu plano</h3>
              <span>Totais planejados · não é um registro de consumo</span>
            </div>
            <div className="macro-grid">
              {[
                { label: "Proteínas", value: macro.protein, color: "blue" },
                { label: "Carboidratos", value: macro.carbs, color: "yellow" },
                { label: "Gorduras", value: macro.fat, color: "green" },
                { label: "Fibras", value: macro.fiber, color: "orange" },
              ].map((m) => (
                <div key={m.label}>
                  <span className={`macro-dot ${m.color}`} />
                  <span>{m.label}</span>
                  <strong>
                    {m.value}
                    <small> g</small>
                  </strong>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="dashboard-aside">
          <section className="level-panel">
            <div className="level-top">
              <span className="rank-icon">
                <ShieldCheck size={25} />
              </span>
              <div>
                <span>SUA JORNADA</span>
                <h3>Construindo a base</h3>
              </div>
              <Tag tone="yellow">NÍV. {level}</Tag>
            </div>
            <div className="xp-label">
              <span>{xp % 200} XP</span>
              <span>
                {200} XP para o nível {level + 1}
              </span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${(xp % 200) / 2}%` }} />
            </div>
            <p>Consistência vale mais que perfeição.</p>
          </section>
          <Water
            profile={profile}
            day={day}
            updateDay={updateDay}
            notify={notify}
          />
          <section className="routine-preview panel">
            <div className="panel-title">
              <h2>Sua rotina de hoje</h2>
              <button
                aria-label="Abrir minha rotina"
                onClick={() => go("routine")}
              >
                <ArrowRight size={17} />
              </button>
            </div>
            {profile.supplements.slice(0, 2).map((s) => (
              <label className="routine-check" key={s.id}>
                <input
                  type="checkbox"
                  checked={day.supplements.includes(s.id)}
                  onChange={() =>
                    updateDay((d) => ({
                      ...d,
                      supplements: d.supplements.includes(s.id)
                        ? d.supplements.filter((id) => id !== s.id)
                        : [...d.supplements, s.id],
                    }))
                  }
                />
                <span>
                  <strong>{s.name}</strong>
                  <small>
                    {s.time} · {s.dose}
                  </small>
                </span>
              </label>
            ))}
            {!profile.supplements.length ? (
              <p className="muted small">
                Sua rotina está livre. Adicione hábitos em Minha rotina.
              </p>
            ) : null}
            <div className="daily-checkin">
              <span>Como foi seu dia com o plano?</span>
              <Button
                variant={day.checkin ? "outline" : "default"}
                onClick={() => {
                  updateDay((d) => ({ ...d, checkin: !d.checkin }));
                  notify(
                    day.checkin
                      ? "Check-in desfeito."
                      : "Check-in feito. +40 XP pela sua presença!",
                  );
                }}
              >
                <CheckCheck size={16} />
                {day.checkin ? "Check-in feito" : "Fazer check-in"}
              </Button>
            </div>
          </section>
          <button className="shopping-preview" onClick={() => go("groceries")}>
            <span className="shopping-icon">
              <ShoppingBasket size={23} />
            </span>
            <span>
              <strong>A próxima compra, resolvida.</strong>
              <small>
                {profile.groceries.filter((g) => !g.checked).length} itens para
                preparar a semana
              </small>
            </span>
            <ArrowRight size={17} />
          </button>
        </aside>
      </div>
    </>
  );
}
function Plan({
  profile,
  update,
  notify,
  go,
}: {
  profile: Profile;
  update: (f: (p: Profile) => Profile) => void;
  notify: (s: string) => void;
  go: (p: Page) => void;
}) {
  const [edit, setEdit] = useState<Meal | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [planName, setPlanName] = useState(profile.planName);
  const [planNote, setPlanNote] = useState(profile.planNote);
  const [query, setQuery] = useState("");
  const t = totals(profile.meals);
  function saveMeal(e: FormEvent) {
    e.preventDefault();
    if (!edit) return;
    update((p) => ({
      ...p,
      meals: (p.meals.some((m) => m.id === edit.id)
        ? p.meals.map((m) => (m.id === edit.id ? edit : m))
        : [...p.meals, edit]
      ).sort((a, b) => a.time.localeCompare(b.time)),
    }));
    setEdit(null);
    notify(
      "Refeição atualizada. Gere a lista de compras para refletir as novas porções.",
    );
  }
  return (
    <>
      <Heading
        title="Um plano que cabe na sua vida."
        subtitle="Suas refeições e opções de troca, sempre à mão."
      >
        <Button variant="outline" onClick={() => setPlanOpen(true)}>
          <Pencil size={16} />
          Atualizar plano
        </Button>
        <Button onClick={() => go("groceries")}>
          <ShoppingBasket size={16} />
          Preparar compras
        </Button>
      </Heading>
      <div className="plan-overview">
        <div className="plan-icon">
          <BookOpen size={25} />
        </div>
        <div>
          <h2>{profile.planName}</h2>
          <p>{profile.planNote}</p>
        </div>
        <Tag>Plano demonstrativo</Tag>
      </div>
      <div className="plan-totals">
        <span>
          <strong>{t.kcal.toLocaleString("pt-BR")}</strong> kcal planejadas /
          dia
        </span>
        <span>
          Proteínas <strong>{t.protein} g</strong>
        </span>
        <span>
          Carboidratos <strong>{t.carbs} g</strong>
        </span>
        <span>
          Gorduras <strong>{t.fat} g</strong>
        </span>
        <span>
          Fibras <strong>{t.fiber} g</strong>
        </span>
      </div>
      <div className="list-toolbar">
        <Button
          variant="outline"
          onClick={() =>
            setEdit({
              id: crypto.randomUUID(),
              time: "21:00",
              name: "Nova refeição",
              title: "Nova refeição",
              description: "",
              kcal: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              fiber: 0,
              ingredients: [],
              alternative: "",
              image: "/images/dinner.jpg",
            })
          }
        >
          <Plus size={16} />
          Adicionar refeição
        </Button>
        <h2>
          Seu dia à mesa <span>{profile.meals.length} refeições</span>
        </h2>
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Buscar refeição"
            placeholder="Buscar no plano"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="meal-list">
        {profile.meals
          .filter((m) =>
            (m.name + " " + m.description)
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((m) => (
            <article className="plan-meal" key={m.id}>
              <div className="plan-meal-top">
                <div className="meal-time">
                  <Clock3 size={15} />
                  {m.time}
                </div>
                <MealImage meal={m} />
                <div className="plan-meal-main">
                  <h3>{m.name}</h3>
                  <p>{m.description}</p>
                  <span>
                    {m.kcal} kcal · {m.protein} g proteína · {m.fiber} g fibras
                  </span>
                </div>
                <div className="plan-meal-actions">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${m.name}`}
                    onClick={() => setEdit(structuredClone(m))}
                  >
                    <Pencil size={17} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetail(detail === m.id ? null : m.id)}
                    aria-expanded={detail === m.id}
                  >
                    Porções e trocas
                    <ChevronDown size={15} />
                  </Button>
                </div>
              </div>
              {detail === m.id ? (
                <div className="meal-detail">
                  <div>
                    <h4>Porções do plano</h4>
                    <ul>
                      {m.ingredients.map((g, i) => (
                        <li key={i}>
                          {g.quantity} {g.unit} de {g.name.toLowerCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="substitution">
                    <h4>
                      <RefreshCw size={16} />
                      Uma opção de troca
                    </h4>
                    <p>{m.alternative}</p>
                    <small>
                      Exemplo de alternativa; não implica equivalência
                      nutricional.
                    </small>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        {!profile.meals.some((m) =>
          (m.name + " " + m.description)
            .toLowerCase()
            .includes(query.toLowerCase()),
        ) ? (
          <Empty
            title="Nenhuma refeição encontrada"
            text="Tente outro nome ou ingrediente."
          />
        ) : null}
      </div>
      <div className="info-note">
        <ShieldCheck size={18} />
        <p>
          Este é um plano de exemplo. Edite as refeições com as porções da sua
          prescrição. Suplementos e trocas devem seguir as orientações do seu
          profissional.
        </p>
      </div>
      {edit ? (
        <Dialog
          open
          onOpenChange={() => setEdit(null)}
          title={`Editar ${edit.name}`}
          description="Atualize com as informações do seu plano alimentar."
        >
          <form onSubmit={saveMeal} className="edit-form">
            <div className="form-row">
              <label>
                Refeição
                <input
                  value={edit.name}
                  required
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                />
              </label>
              <label>
                Horário
                <input
                  type="time"
                  required
                  value={edit.time}
                  onChange={(e) => setEdit({ ...edit, time: e.target.value })}
                />
              </label>
            </div>
            <label>
              Descrição
              <input
                required
                value={edit.description}
                onChange={(e) =>
                  setEdit({ ...edit, description: e.target.value })
                }
              />
            </label>
            <div className="form-row numeric-row">
              {(["kcal", "protein", "carbs", "fat", "fiber"] as const).map(
                (field, i) => (
                  <label key={field}>
                    {
                      [
                        "Kcal",
                        "Proteína (g)",
                        "Carbs (g)",
                        "Gordura (g)",
                        "Fibra (g)",
                      ][i]
                    }
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      required
                      value={edit[field]}
                      onChange={(e) =>
                        setEdit({ ...edit, [field]: Number(e.target.value) })
                      }
                    />
                  </label>
                ),
              )}
            </div>
            <h4>Ingredientes para a lista de compras</h4>
            <div className="ingredient-editor">
              {edit.ingredients.map((g, i) => (
                <div className="ingredient-row" key={i}>
                  <input
                    aria-label={`Ingrediente ${i + 1}`}
                    required
                    value={g.name}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        ingredients: edit.ingredients.map((it, j) =>
                          j === i ? { ...it, name: e.target.value } : it,
                        ),
                      })
                    }
                  />
                  <input
                    aria-label={`Quantidade ${i + 1}`}
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={g.quantity}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        ingredients: edit.ingredients.map((it, j) =>
                          j === i
                            ? { ...it, quantity: Number(e.target.value) }
                            : it,
                        ),
                      })
                    }
                  />
                  <select
                    aria-label={`Unidade ${i + 1}`}
                    value={g.unit}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        ingredients: edit.ingredients.map((it, j) =>
                          j === i ? { ...it, unit: e.target.value } : it,
                        ),
                      })
                    }
                  >
                    {["g", "ml", "un", "fatia"].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`Remover ${g.name}`}
                    onClick={() =>
                      setEdit({
                        ...edit,
                        ingredients: edit.ingredients.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setEdit({
                  ...edit,
                  ingredients: [
                    ...edit.ingredients,
                    { name: "", quantity: 1, unit: "g", category: "Outros" },
                  ],
                })
              }
            >
              <Plus size={15} />
              Adicionar ingrediente
            </Button>
            <label>
              Opção de substituição
              <textarea
                value={edit.alternative}
                onChange={(e) =>
                  setEdit({ ...edit, alternative: e.target.value })
                }
              />
            </label>
            <div className="form-actions">
              {profile.meals.some((m) => m.id === edit.id) ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    update((p) => ({
                      ...p,
                      meals: p.meals.filter((m) => m.id !== edit.id),
                    }));
                    setEdit(null);
                    notify(
                      "Refeição removida. Atualize a lista de compras para refletir a mudança.",
                    );
                  }}
                >
                  <Trash2 size={16} />
                  Remover refeição
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => setEdit(null)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar refeição</Button>
            </div>
          </form>
        </Dialog>
      ) : null}
      <Dialog
        open={planOpen}
        onOpenChange={setPlanOpen}
        title="Atualizar meu plano"
        description="Identifique a versão e registre as orientações da sua prescrição."
      >
        <form
          className="edit-form"
          onSubmit={(e) => {
            e.preventDefault();
            update((p) => ({
              ...p,
              planName,
              planNote,
              history: [
                { name: p.planName, date: localDate() },
                ...p.history,
              ].slice(0, 20),
            }));
            setPlanOpen(false);
            notify(
              "Nova versão do plano salva. Edite as refeições para ajustar porções e ingredientes.",
            );
          }}
        >
          <label>
            Nome do plano
            <input
              required
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </label>
          <label>
            Orientações e observações
            <textarea
              rows={5}
              value={planNote}
              onChange={(e) => setPlanNote(e.target.value)}
            />
          </label>
          <p className="muted small">
            A edição das porções é feita individualmente em cada refeição. O
            nome anterior fica no histórico do perfil.
          </p>
          <Button type="submit">Salvar versão do plano</Button>
        </form>
      </Dialog>
    </>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <Leaf size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Groceries({
  profile,
  update,
  notify,
}: {
  profile: Profile;
  update: (f: (p: Profile) => Profile) => void;
  notify: (s: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [days, setDays] = useState(profile.plannedDays);
  const [add, setAdd] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const [item, setItem] = useState({
    name: "",
    quantity: 1,
    unit: "un",
    category: "Outros",
  });
  const checked = profile.groceries.filter((g) => g.checked).length;
  const categories = [...new Set(profile.groceries.map((g) => g.category))];
  const filtered = profile.groceries.filter(
    (g) =>
      g.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter !== "pending" || !g.checked) &&
      (filter !== "done" || g.checked),
  );
  function exportList() {
    download(
      "base-lista-de-compras.txt",
      `BASE — Lista de compras\n${profile.name} · ${profile.plannedDays} dias\n\n` +
        categories
          .map(
            (c) =>
              c.toUpperCase() +
              "\n" +
              profile.groceries
                .filter((g) => g.category === c)
                .map(
                  (g) =>
                    `${g.checked ? "[x]" : "[ ]"} ${g.name} — ${g.quantity.toLocaleString("pt-BR")} ${g.unit}`,
                )
                .join("\n"),
          )
          .join("\n\n"),
    );
    notify("Lista exportada para levar ao mercado.");
  }
  return (
    <>
      <Heading
        title="Sua semana começa na compra."
        subtitle="Uma lista que nasce do seu plano. Menos improviso no mercado."
      >
        <Button variant="outline" onClick={exportList}>
          <ArrowDownToLine size={16} />
          Exportar lista
        </Button>
        <Button onClick={() => setAdd(true)}>
          <Plus size={16} />
          Adicionar item
        </Button>
      </Heading>
      <section className="grocery-generator">
        <div>
          <span className="generator-icon">
            <ShoppingBasket size={25} />
          </span>
          <div>
            <h2>Do plano para o carrinho.</h2>
            <p>Some os ingredientes das refeições pela quantidade de dias.</p>
          </div>
        </div>
        <div className="generator-controls">
          <label>
            Planejar para
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? "dia" : "dias"}
                </option>
              ))}
            </select>
          </label>
          <Button variant="yellow" onClick={() => setRegenerate(true)}>
            <RefreshCw size={16} />
            Gerar lista
          </Button>
        </div>
      </section>
      <div className="grocery-progress">
        <span>
          <CheckCheck size={18} />
          <strong>
            {checked} de {profile.groceries.length}
          </strong>{" "}
          itens no carrinho
        </span>
        <div className="progress-track">
          <span
            style={{
              width: `${profile.groceries.length ? (checked / profile.groceries.length) * 100 : 0}%`,
            }}
          />
        </div>
        <span>{profile.plannedDays} dias planejados</span>
      </div>
      <div className="list-toolbar">
        <div className="tabs" aria-label="Filtrar compras">
          {[
            ["all", "Todos"],
            ["pending", "Pendentes"],
            ["done", "No carrinho"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={filter === id ? "selected" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="search-field">
          <Search size={17} />
          <input
            aria-label="Buscar item"
            placeholder="Buscar um ingrediente"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="grocery-layout">
        <div className="grocery-list">
          {categories
            .filter((c) => filtered.some((g) => g.category === c))
            .map((c) => (
              <section className="grocery-category" key={c}>
                <h3>
                  {c}
                  <span>
                    {filtered.filter((g) => g.category === c).length} itens
                  </span>
                </h3>
                {filtered
                  .filter((g) => g.category === c)
                  .map((g) => (
                    <div
                      className={`grocery-row ${g.checked ? "checked" : ""}`}
                      key={g.id}
                    >
                      <label>
                        <input
                          type="checkbox"
                          checked={g.checked}
                          onChange={() =>
                            update((p) => ({
                              ...p,
                              groceries: p.groceries.map((x) =>
                                x.id === g.id
                                  ? { ...x, checked: !x.checked }
                                  : x,
                              ),
                            }))
                          }
                        />
                        <span>{g.name}</span>
                      </label>
                      <span className="grocery-quantity">
                        {g.quantity.toLocaleString("pt-BR")} {g.unit}
                      </span>
                      <button
                        className="delete-button"
                        aria-label={`Remover ${g.name}`}
                        onClick={() => {
                          update((p) => ({
                            ...p,
                            groceries: p.groceries.filter((x) => x.id !== g.id),
                          }));
                          notify(`${g.name} removido da lista.`);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
              </section>
            ))}
          {!filtered.length ? (
            <Empty
              title={
                filter === "pending"
                  ? "Tudo no carrinho. Boa compra!"
                  : "Nenhum item por aqui"
              }
              text={
                query
                  ? "Tente buscar outro ingrediente."
                  : "Adicione um item ou gere uma nova lista pelo plano."
              }
            />
          ) : null}
        </div>
        <aside className="grocery-tips">
          <Wallet size={25} />
          <h3>Antes de sair, confira a despensa.</h3>
          <p>
            Marque o que já tem em casa. A melhor compra é a que evita
            desperdício.
          </p>
          <hr />
          <h4>Sobre as quantidades</h4>
          <p>
            A lista soma as porções cadastradas por dia. Arroz e feijão estão
            indicados em peso cru. Ajuste embalagens e rendimento ao comprar.
          </p>
          <Tag tone="green">
            <Leaf size={13} />
            Planejar também é cuidar
          </Tag>
        </aside>
      </div>
      <Dialog open={add} onOpenChange={setAdd} title="Adicionar à lista">
        <form
          className="edit-form"
          onSubmit={(e) => {
            e.preventDefault();
            update((p) => ({
              ...p,
              groceries: [
                ...p.groceries,
                {
                  ...item,
                  name: item.name.trim(),
                  id: crypto.randomUUID(),
                  manual: true,
                  checked: false,
                },
              ],
            }));
            setAdd(false);
            setItem({ name: "", quantity: 1, unit: "un", category: "Outros" });
            notify("Item adicionado à lista.");
          }}
        >
          <label>
            Nome do item
            <input
              required
              maxLength={80}
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
            />
          </label>
          <div className="form-row">
            <label>
              Quantidade
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={item.quantity}
                onChange={(e) =>
                  setItem({ ...item, quantity: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Unidade
              <select
                value={item.unit}
                onChange={(e) => setItem({ ...item, unit: e.target.value })}
              >
                {["un", "g", "kg", "ml", "L", "fatia", "pacote"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Categoria
            <select
              value={item.category}
              onChange={(e) => setItem({ ...item, category: e.target.value })}
            >
              {[...new Set([...categories, "Outros"])].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={!item.name.trim()}>
            Adicionar item
          </Button>
        </form>
      </Dialog>
      <Dialog
        open={regenerate}
        onOpenChange={setRegenerate}
        title="Gerar uma nova lista?"
        description={`Os ingredientes do plano serão recalculados para ${days} dias. Itens extras serão mantidos. As marcações de compra serão reiniciadas.`}
      >
        <div className="form-actions">
          <Button variant="outline" onClick={() => setRegenerate(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              update((p) => ({
                ...p,
                plannedDays: days,
                groceries: [
                  ...generateGroceries(p.meals, days),
                  ...p.groceries
                    .filter((g) => g.manual)
                    .map((g) => ({ ...g, checked: false })),
                ],
              }));
              setRegenerate(false);
              notify(`Lista atualizada para ${days} dias.`);
            }}
          >
            Gerar nova lista
          </Button>
        </div>
      </Dialog>
    </>
  );
}
function Routine({
  profile,
  day,
  update,
  updateDay,
  notify,
}: {
  profile: Profile;
  day: Day;
  update: (f: (p: Profile) => Profile) => void;
  updateDay: (f: (d: Day) => Day) => void;
  notify: (s: string) => void;
}) {
  const [edit, setEdit] = useState<Supplement | null>(null);
  return (
    <>
      <Heading
        title="Pequenos hábitos. Uma boa base."
        subtitle="Água, suplementos prescritos e o seu momento de cuidado."
      >
        <Button
          onClick={() =>
            setEdit({
              id: crypto.randomUUID(),
              name: "",
              dose: "",
              time: "08:00",
              note: "",
            })
          }
        >
          <Plus size={16} />
          Adicionar à rotina
        </Button>
      </Heading>
      <div className="routine-layout">
        <div>
          <SectionTitle
            title="No seu dia"
            detail="Uma marcação simples. Sem planilha, sem cobrança."
          />
          {profile.supplements.map((s) => (
            <div className="supplement-row" key={s.id}>
              <span className="supplement-icon">
                <Pill size={24} />
              </span>
              <div>
                <span className="small muted">{s.time}</span>
                <h3>{s.name}</h3>
                <p>{s.dose}</p>
                <small>{s.note}</small>
              </div>
              <div className="supplement-actions">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Editar ${s.name}`}
                  onClick={() => setEdit({ ...s })}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant={
                    day.supplements.includes(s.id) ? "outline" : "default"
                  }
                  onClick={() =>
                    updateDay((d) => ({
                      ...d,
                      supplements: d.supplements.includes(s.id)
                        ? d.supplements.filter((id) => id !== s.id)
                        : [...d.supplements, s.id],
                    }))
                  }
                >
                  {day.supplements.includes(s.id) ? (
                    <Check size={16} />
                  ) : (
                    <Plus size={16} />
                  )}{" "}
                  {day.supplements.includes(s.id) ? "Feito" : "Marcar"}
                </Button>
              </div>
            </div>
          ))}
          {!profile.supplements.length ? (
            <Empty
              title="Sua rotina começa com você"
              text="Cadastre seu mix de sementes ou um suplemento já prescrito."
            />
          ) : null}
          <div className="info-note">
            <ShieldCheck size={19} />
            <p>
              Os suplementos exibidos são exemplos. Cadastre as orientações da
              sua prescrição; o Base não recomenda vitaminas nem calcula
              dosagens.
            </p>
          </div>
          <section className="checkin-panel">
            <div>
              <h2>Aparecer já é um bom começo.</h2>
              <p>
                Fez escolhas alinhadas ao seu plano hoje? Seu check-in vale +40
                XP.
              </p>
            </div>
            <Button
              onClick={() => {
                updateDay((d) => ({ ...d, checkin: !d.checkin }));
                notify(
                  day.checkin
                    ? "Check-in desfeito."
                    : "Mais um dia cuidando da sua base. +40 XP!",
                );
              }}
              variant={day.checkin ? "outline" : "default"}
            >
              <CheckCheck size={17} />
              {day.checkin ? "Check-in feito" : "Fazer check-in"}
            </Button>
          </section>
        </div>
        <Water
          profile={profile}
          day={day}
          updateDay={updateDay}
          notify={notify}
        />
      </div>
      {edit ? (
        <Dialog
          open
          onOpenChange={() => setEdit(null)}
          title={
            profile.supplements.some((s) => s.id === edit.id)
              ? "Editar hábito"
              : "Adicionar à rotina"
          }
        >
          <form
            className="edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              update((p) => ({
                ...p,
                supplements: p.supplements.some((s) => s.id === edit.id)
                  ? p.supplements.map((s) => (s.id === edit.id ? edit : s))
                  : [...p.supplements, edit],
              }));
              setEdit(null);
              notify("Rotina atualizada.");
            }}
          >
            <label>
              Nome
              <input
                required
                value={edit.name}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </label>
            <div className="form-row">
              <label>
                Porção / orientação
                <input
                  required
                  value={edit.dose}
                  onChange={(e) => setEdit({ ...edit, dose: e.target.value })}
                />
              </label>
              <label>
                Horário
                <input
                  type="time"
                  required
                  value={edit.time}
                  onChange={(e) => setEdit({ ...edit, time: e.target.value })}
                />
              </label>
            </div>
            <label>
              Observações
              <textarea
                value={edit.note}
                onChange={(e) => setEdit({ ...edit, note: e.target.value })}
              />
            </label>
            <div className="form-actions">
              {profile.supplements.some((s) => s.id === edit.id) ? (
                <Button
                  variant="danger"
                  type="button"
                  onClick={() => {
                    update((p) => ({
                      ...p,
                      supplements: p.supplements.filter(
                        (s) => s.id !== edit.id,
                      ),
                      days: Object.fromEntries(
                        Object.entries(p.days).map(([key, value]) => [
                          key,
                          {
                            ...value,
                            supplements: value.supplements.filter(
                              (id) => id !== edit.id,
                            ),
                          },
                        ]),
                      ),
                    }));
                    setEdit(null);
                    notify("Hábito removido.");
                  }}
                >
                  <Trash2 size={16} />
                  Remover
                </Button>
              ) : null}
              <Button type="submit">Salvar hábito</Button>
            </div>
          </form>
        </Dialog>
      ) : null}
    </>
  );
}
function Progress({
  profile,
  xp,
  level,
}: {
  profile: Profile;
  xp: number;
  level: number;
}) {
  const days = weekDates();
  const active = Object.values(profile.days).filter((d) => d.checkin).length;
  const hydrated = Object.values(profile.days).filter(
    (d) => d.water >= profile.waterGoal,
  ).length;
  const badges = [
    {
      title: "Primeiro passo",
      text: "Faça seu primeiro check-in.",
      unlocked: active >= 1,
      icon: Leaf,
    },
    {
      title: "Encontrando o ritmo",
      text: "Complete 3 dias de check-in.",
      unlocked: active >= 3,
      icon: Flame,
    },
    {
      title: "Água em dia",
      text: "Atinja sua meta de água em um dia.",
      unlocked: hydrated >= 1,
      icon: Droplets,
    },
    {
      title: "Uma semana de cuidado",
      text: "Some 7 dias de check-in.",
      unlocked: active >= 7,
      icon: Trophy,
    },
  ];
  return (
    <>
      <Heading
        title="Progresso que respeita seu ritmo."
        subtitle="Aqui, evolução se mede em cuidado. Cada dia conta."
      />
      <section className="journey-banner">
        <span className="big-rank">
          <ShieldCheck size={50} />
        </span>
        <div>
          <h2>Nível {level} · Construindo a base</h2>
          <p>{xp} XP conquistados com pequenos hábitos reais.</p>
          <div className="progress-track">
            <span style={{ width: `${(xp % 200) / 2}%` }} />
          </div>
          <small>{200 - (xp % 200)} XP para o próximo nível</small>
        </div>
      </section>
      <div className="progress-layout">
        <section className="weekly-chart panel">
          <SectionTitle
            title="Sua água nesta semana"
            detail="Volume registrado por dia. A meta é uma referência pessoal."
          />
          <div className="chart-bars">
            {days.map((d) => {
              const water = profile.days[d.key]?.water || 0;
              return (
                <div className="chart-col" key={d.key}>
                  <span>
                    {water
                      ? (water / 1000).toLocaleString("pt-BR") + " L"
                      : "—"}
                  </span>
                  <div className="chart-track">
                    <div
                      style={{
                        height: `${Math.min(100, (water / profile.waterGoal) * 100)}%`,
                      }}
                    />
                  </div>
                  <small>{d.label}</small>
                  <span className={d.key === localDate() ? "today-chart" : ""}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="chart-caption">
            <span className="macro-dot blue" />
            Meta atual: {(profile.waterGoal / 1000).toLocaleString("pt-BR")} L
            por dia
          </div>
        </section>
        <section className="consistency-panel panel">
          <h2>Constância, sem pressão.</h2>
          <div>
            <strong>{active}</strong>
            <span>dias de check-in</span>
          </div>
          <p>
            Não precisa ser uma sequência perfeita. Voltar ao plano também faz
            parte.
          </p>
          <hr />
          <h4>Como o XP funciona</h4>
          <ul>
            <li>
              Check-in do dia <strong>+40 XP</strong>
            </li>
            <li>
              Meta de água <strong>+30 XP</strong>
            </li>
            <li>
              Cada hábito concluído <strong>+10 XP</strong>
            </li>
          </ul>
          <small>Uma vez por dia. Desfazer uma ação recalcula os pontos.</small>
        </section>
      </div>
      <SectionTitle
        title="Conquistas que contam"
        detail="Pequenos marcos da sua jornada, sem comparação com ninguém."
      />
      <div className="badges">
        {badges.map((b) => (
          <div
            className={`badge-item ${b.unlocked ? "unlocked" : ""}`}
            key={b.title}
          >
            <div>
              <b.icon size={28} />
              {b.unlocked ? (
                <span>
                  <Check size={12} />
                </span>
              ) : null}
            </div>
            <h3>{b.title}</h3>
            <p>{b.text}</p>
            <Tag tone={b.unlocked ? "yellow" : "neutral"}>
              {b.unlocked ? "Conquistado" : "No seu tempo"}
            </Tag>
          </div>
        ))}
      </div>
    </>
  );
}
function Settings({
  profile,
  update,
  notify,
  logout,
}: {
  profile: Profile;
  update: (f: (p: Profile) => Profile) => void;
  notify: (s: string) => void;
  logout: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.waterGoal);
  return (
    <>
      <Heading
        title="Seu espaço, do seu jeito."
        subtitle="Ajuste sua base para a sua rotina."
      />
      <div className="settings-layout">
        <section className="panel settings-panel">
          <h2>Meu perfil</h2>
          <form
            className="edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              update((p) => ({ ...p, name: name.trim(), waterGoal: goal }));
              notify("Perfil atualizado.");
            }}
          >
            <label>
              Como você quer ser chamado?
              <input
                value={name}
                required
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              E-mail
              <input value={profile.email} readOnly />
              <small className="muted">
                {supabase
                  ? "Vinculado à sua conta Supabase."
                  : "Endereço ilustrativo do perfil de demonstração."}
              </small>
            </label>
            <label>
              Minha referência diária de água (ml)
              <input
                type="number"
                value={goal}
                min={250}
                max={6000}
                step={50}
                required
                onChange={(e) => setGoal(Number(e.target.value))}
              />
              <small className="muted">
                Use a quantidade orientada pelo seu profissional.
              </small>
            </label>
            <Button type="submit" disabled={!name.trim()}>
              Salvar alterações
            </Button>
          </form>
        </section>
        <div>
          <section className="panel settings-panel">
            <h2>Seus dados</h2>
            <p>
              O plano e os registros ficam neste navegador, separados por
              perfil. Exporte uma cópia quando precisar.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                download(
                  `base-${profile.id}.json`,
                  JSON.stringify(profile, null, 2),
                  "application/json",
                );
                notify("Cópia dos seus dados exportada.");
              }}
            >
              <ArrowDownToLine size={16} />
              Exportar meus dados
            </Button>
            <hr />
            <h3>
              {supabase ? "Supabase conectado" : "Pronto para o próximo passo"}
            </h3>
            <p>
              {supabase
                ? "Login real está ativo. A sincronização do plano ainda precisa ser conectada ao banco."
                : "Esta versão usa perfis locais demonstrativos. A estrutura para autenticação e banco Supabase está no projeto."}
            </p>
            <Tag tone="neutral">
              {supabase
                ? "Auth real · armazenamento local"
                : "Demo local · sem senha"}
            </Tag>
          </section>
          <Button variant="outline" onClick={logout} className="logout-button">
            <LogOut size={17} />
            {supabase ? "Sair da conta" : "Sair e trocar de perfil"}
          </Button>
        </div>
      </div>
      {profile.history.length ? (
        <section className="panel history-panel">
          <h2>Versões anteriores do plano</h2>
          {profile.history.map((h, i) => (
            <div key={i}>
              <BookOpen size={17} />
              <strong>{h.name}</strong>
              <span>
                {new Date(h.date + "T12:00:00").toLocaleDateString("pt-BR")}
              </span>
            </div>
          ))}
        </section>
      ) : null}
    </>
  );
}
