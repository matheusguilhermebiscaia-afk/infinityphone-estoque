import { Router } from "express";
import { AdminLoginBody, AdminLoginResponse, AdminLogoutResponse, GetAuthStatusResponse } from "@workspace/api-zod";

const router: import("express").IRouter = Router();

function buildValidUsers(): Array<{ username: string; password: string }> {
  const users: Array<{ username: string; password: string }> = [];

  // Usuário principal (padrão: admin / infinityphone2024)
  const u1 = process.env.ADMIN_USERNAME || "admin";
  const p1 = process.env.ADMIN_PASSWORD || "infinityphone2024";
  users.push({ username: u1, password: p1 });

  // Usuários extras: ADMIN_USERNAME_2/ADMIN_PASSWORD_2, _3, _4 ...
  for (let i = 2; i <= 10; i++) {
    const u = process.env[`ADMIN_USERNAME_${i}`];
    const p = process.env[`ADMIN_PASSWORD_${i}`];
    if (u && p) users.push({ username: u, password: p });
  }

  return users;
}

router.get("/auth/me", (req, res): void => {
  const session = req.session as { adminAuthenticated?: boolean };
  res.json(GetAuthStatusResponse.parse({ authenticated: !!session.adminAuthenticated }));
});

router.post("/auth/login", (req, res): void => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  const validUsers = buildValidUsers();
  const match = validUsers.find(
    (u) => u.username === username && u.password === password
  );

  if (!match) {
    res.status(401).json({ error: "Usuario ou senha incorretos" });
    return;
  }

  const session = req.session as { adminAuthenticated?: boolean };
  session.adminAuthenticated = true;
  res.json(AdminLoginResponse.parse({ authenticated: true }));
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json(AdminLogoutResponse.parse({ authenticated: false }));
  });
});

export default router;
