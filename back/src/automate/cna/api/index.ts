import * as cheerio from "cheerio";
import createInstance from "./createInstance";
import DIAS_MAP from "../utils/diasMap";
import { TTurmaAutomacao } from "../../../types/turmaAutomacao.type";
import { TAulaAutomacao } from "../../../types/aulaAutomacao.type";
import { NotAuthorizedError } from "../../../api/errors/errors";

class CnaApi {
  private static api = createInstance();

  static async login(email: string, password: string): Promise<void> {
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

  static async buscarTurmas(): Promise<TTurmaAutomacao[]> {
    const turmas: TTurmaAutomacao[] = [];

    while (true) {
      const response = await this.api.get<string>("/Turma/Load", { params: { PageIndex: 1 } });
      if (!response.data?.trim()) break;

      const html = cheerio.load(response.data);

      html("tr").each((_, row) => {
        const tds = html(row).find("td");
        if (tds.length < 15) return;

        const nome = html(tds[0]).text().trim();
        const sala = html(tds[3]).text().trim();

        const dias = html(tds[7]).find("li");
        const horarios = html(tds[8]).find("li");

        const aulas = dias.toArray().map((el, i): TAulaAutomacao => {
          const diaAbrev = html(el).text().trim();
          const dia = DIAS_MAP[diaAbrev] ?? diaAbrev;
          const horario = html(horarios[i]).text().trim();
          return { dia, horario };
        });

        const situacao = html(tds[9]).text().trim();

        const inicio = html(tds[12]).text().trim();
        const fim = html(tds[13]).find("a.label-danger").text().trim();

        const link = html(tds[15]).find("a").attr("href") ?? "";

        turmas.push({ nome, sala, aulas, situacao, inicio, fim, link });
      });
    }

    return turmas;
  }
}

export default CnaApi;
