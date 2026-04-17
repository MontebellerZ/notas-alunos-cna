import axios, { AxiosInstance } from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";
import * as cheerio from "cheerio";
import DIAS_MAP from "../utils/diasMap";
import { Turma } from "../models/Turma";
import { Aula } from "../models/Aula";
import parseDateBR from "../utils/parseDateBR";
import envData from "../config/envData";
import { NotAuthorizedError } from "../errors";

export class CnaApi {
  private api: AxiosInstance;
  private jar: CookieJar;

  constructor() {
    this.jar = new CookieJar();

    const instance = axios.create({ withCredentials: true, baseURL: envData.CNA_URL });

    this.api = wrapper(instance as any);
    (this.api.defaults as any).jar = this.jar;
  }

  async login(email: string, password: string): Promise<void> {
    const params = new URLSearchParams();
    params.append("Email", email);
    params.append("Password", password);

    const result = await this.api
      .post("/Account/Login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((res) => res.data as string);

    if (result.includes("Não foi possível fazer o login. Digite o texto da imagem.")) {
      throw new NotAuthorizedError(
        "Por favor, realize o login no site da CNA para validar a imagem de segurança",
      );
    }

    if (result.includes("Você excedeu a quantidade máxima de 5 tentativas, aguarde 1 minuto")) {
      throw new NotAuthorizedError(
        "Você excedeu a quantidade máxima de 5 tentativas, aguarde 1 minuto!",
      );
    }

    if (result.includes("Não foi possível fazer o login")) {
      throw new NotAuthorizedError("Credenciais incorretas");
    }
  }

  async buscarTurmas(): Promise<Turma[]> {
    const turmas: Turma[] = [];

    while (true) {
      const response = await this.api.get<string>("/Turma/Load", { params: { PageIndex: 1 } });
      if (!response.data?.trim()) break;

      const html = cheerio.load(response.data);

      html("tr").each((_, row) => {
        const tds = html(row).find("td");
        if (tds.length < 15) return;

        const turma = html(tds[0]).text().trim();
        const sala = html(tds[3]).text().trim();
        const alunos = parseInt(html(tds[5]).text().trim(), 10) || 0;

        const dias = html(tds[7]).find("li");
        const horarios = html(tds[8]).find("li");

        const aulas = dias.toArray().map((el, i): Aula => {
          const diaAbrev = html(el).text().trim();
          const dia = DIAS_MAP[diaAbrev] ?? diaAbrev;
          const horario = html(horarios[i]).text().trim();
          return { dia, horario };
        });

        const situacao = html(tds[9]).text().trim();

        const inicio = parseDateBR(html(tds[12]).text().trim());
        const fim = parseDateBR(html(tds[13]).find("a.label-danger").text().trim());

        const link = html(tds[15]).find("a").attr("href") ?? "";

        turmas.push({ turma, sala, alunos, aulas, situacao, inicio, fim, link });
      });
    }

    return turmas;
  }
}
