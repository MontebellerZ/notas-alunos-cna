import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "../components/Layout";
import Home from "../components/Screens/Home";
import Login from "../components/Screens/Login";
import Turmas from "../components/Screens/Turmas";
import TurmaDetalhe from "../components/Screens/TurmaDetalhe";
import Alunos from "../components/Screens/Alunos";
import AlunoDetalhe from "../components/Screens/AlunoDetalhe";

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
        element: <Home />,
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
        path: "alunos",
        element: <Alunos />,
      },
      {
        path: "alunos/:id",
        element: <AlunoDetalhe />,
      },
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
