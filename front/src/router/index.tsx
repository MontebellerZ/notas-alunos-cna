import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Layout from "../components/Layout";
import Dashboard from "../components/Screens/Dashboard";
import Login from "../components/Screens/Login";
import Turmas from "../components/Screens/Turmas";
import TurmaDetalhe from "../components/Screens/TurmaDetalhe";
import TurmaNotas from "../components/Screens/TurmaNotas";
import Alunos from "../components/Screens/Alunos";
import AlunoDetalhe from "../components/Screens/AlunoDetalhe";
import Agenda from "../components/Screens/Agenda";
import AtividadeDetalhe from "../components/Screens/AtividadeDetalhe";
import Avaliacao from "../components/Screens/Avaliacao";
import AtividadeRelatorio from "../components/Screens/AtividadeRelatorio";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/main",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to={"turmas"} />,
      },
      {
        path: "turmas",
        element: <Turmas />,
      },
      {
        path: "turmas/:id",
        element: <TurmaDetalhe />,
      },
      {
        path: "turmas/:id/notas",
        element: <TurmaNotas />,
      },
      {
        path: "agenda",
        element: <Agenda />,
      },
      {
        path: "alunos",
        element: <Alunos />,
      },
      {
        path: "alunos/:id",
        element: <AlunoDetalhe />,
      },
      {
        path: "atividades/:id",
        element: <AtividadeDetalhe />,
      },
      {
        path: "atividades/:id/avaliacao",
        element: <Avaliacao />,
      },
      {
        path: "atividades/:id/relatorio",
        element: <AtividadeRelatorio />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
