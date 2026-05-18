export async function silentBackup(): Promise<void> {
  try {
    await fetch("/api/backup", { method: "POST" });
  } catch {
    // backup silencioso — erros ignorados
  }
}
