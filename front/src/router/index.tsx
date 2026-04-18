import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "../components/Layout";
import Home from "../components/Screens/Home";
import Login from "../components/Screens/Login";
import Turmas from "../components/Screens/Turmas";
import TurmaDetalhe from "../components/Screens/TurmaDetalhe";

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
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
