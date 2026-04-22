import { Router } from "express";
import { RequestUsuarioLogin } from "../types/request/requestUsuarioLogin.type";
import UsuarioService from "../services/usuario.service";
import { authMiddleware } from "../middleware/auth.middleware";
import type { AuthRequest } from "../middleware/auth.middleware";
import { ForbiddenError } from "../errors/errors";

const usuarioRoutes = Router();

// Rotas públicas
usuarioRoutes.post("/login", async (req, res) => {
  const { email, senha } = req.body as RequestUsuarioLogin;

  const result = await UsuarioService.Login(email, senha);

  res.send(result);
});

// Rotas protegidas
usuarioRoutes.use(authMiddleware);

usuarioRoutes.put("/senha", async (req: AuthRequest, res) => {
  const usuario = req.usuario!;
  if (!usuario.admin) {
    throw new ForbiddenError("Apenas administradores podem definir uma senha local.");
  }
  const { senha } = req.body as { senha: string };
  await UsuarioService.DefinirSenhaAdmin(usuario.id, senha);
  res.send({ ok: true });
});

export default usuarioRoutes;
