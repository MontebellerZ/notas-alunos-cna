import { Router } from "express";
import { RequestUsuarioLogin } from "../types/request/requestUsuarioLogin.type";
import UsuarioService from "../services/usuario.service";
import { authMiddleware } from "../middleware/auth.middleware";
import type { AuthRequest } from "../middleware/auth.middleware";
import { ForbiddenError } from "../errors/errors";
import StoragePaths from "../../config/storagePaths";
import { ProfileMulter } from "../../config/multerInstances";

const usuarioRoutes = Router();

type AuthUploadRequest = AuthRequest & {
  file?: { filename: string; path: string; mimetype: string };
};

// Rotas públicas
usuarioRoutes.post("/login", async (req, res) => {
  const { email, senha } = req.body as RequestUsuarioLogin;

  const result = await UsuarioService.Login(email, senha);

  res.send(result);
});

// Rotas protegidas
usuarioRoutes.use(authMiddleware);

usuarioRoutes.get("/me", async (req: AuthRequest, res) => {
  const usuario = req.usuario!;
  const result = await UsuarioService.GetPerfil(usuario.id);
  res.send(result);
});

usuarioRoutes.put("/me", ProfileMulter.upload.single("foto"), async (req: AuthRequest, res) => {
  const uploadReq = req as AuthUploadRequest;
  const usuario = uploadReq.usuario!;
  const body = uploadReq.body as {
    nome?: string;
    email?: string;
    senha?: string;
    removerFoto?: string;
  };

  const fotoPath = uploadReq.file
    ? StoragePaths.buildProfileImagePath(uploadReq.file.filename)
    : body.removerFoto === "true"
      ? null
      : undefined;

  const result = await UsuarioService.AtualizarPerfil(usuario, {
    nome: body.nome,
    email: body.email,
    senha: body.senha,
    foto: fotoPath,
  });
  res.send(result);
});

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
