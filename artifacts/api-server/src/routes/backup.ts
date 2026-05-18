import { Router } from "express";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const BACKUPS_DIR = path.join(PROJECT_ROOT, "backups");
const MAX_BACKUPS = 10;

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

function pruneOldBackups() {
  try {
    const files = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith(".tar.gz"))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(BACKUPS_DIR, f)).mtime }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    files.slice(MAX_BACKUPS).forEach(({ name }) => {
      fs.unlink(path.join(BACKUPS_DIR, name), () => {});
    });
  } catch {
    // ignore
  }
}

const router = Router();

router.post("/backup", (req, res) => {
  ensureBackupsDir();

  const ts = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", "-")
    .replace(/:/g, "");
  const filename = `infinityphone-${ts}.tar.gz`;
  const outPath = path.join(BACKUPS_DIR, filename);

  const cmd = [
    "tar",
    `--exclude='./node_modules'`,
    `--exclude='./.git'`,
    `--exclude='./.local'`,
    `--exclude='./.cache'`,
    `--exclude='./.config'`,
    `--exclude='./artifacts/api-server/dist'`,
    `--exclude='./artifacts/infinityphone/dist'`,
    `--exclude='./artifacts/mockup-sandbox/dist'`,
    `--exclude='./artifacts/api-server/uploads'`,
    `--exclude='./backups'`,
    `--exclude='*.map'`,
    `-czf ${outPath}`,
    ".",
  ].join(" ");

  exec(cmd, { cwd: PROJECT_ROOT }, (err) => {
    if (err) {
      req.log.error({ err }, "backup failed");
      res.status(500).json({ success: false, error: "Falha ao gerar backup" });
      return;
    }
    pruneOldBackups();
    res.json({ success: true, filename });
  });
});

export default router;
