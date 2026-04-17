import { Router } from "express";
import { RequestUsuarioLogin } from "../types/request/requestUsuarioLogin.type";
import UsuarioService from "../services/usuario.service";

const usuarioRoutes = Router();

usuarioRoutes.post("/login", async (req, res) => {
  const { email, senha } = req.body as RequestUsuarioLogin;

  await UsuarioService.Login(email, senha);

  res.send();
});

export default usuarioRoutes;
