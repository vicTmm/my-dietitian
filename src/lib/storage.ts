import { createProfile } from "./data";
import type { Profile } from "./data";
const KEY = "base:v1";
type Database = { version: 1; profiles: Profile[]; session: string | null };
export function readDatabase(): Database {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const value = JSON.parse(raw);
      if (value.version === 1 && Array.isArray(value.profiles)) return value;
    }
  } catch {
    /* Recover demo if storage is corrupted. */
  }
  return {
    version: 1,
    profiles: [
      createProfile("victor", "Victor", "victor@base.demo"),
      createProfile("julia", "Júlia", "julia@base.demo"),
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
