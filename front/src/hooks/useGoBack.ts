import { useNavigate } from "react-router";

/**
 * Retorna uma função que navega para a página anterior do histórico.
 * Caso não haja histórico anterior (acesso direto à URL), usa o `fallback` fornecido.
 */
export function useGoBack() {
  const navigate = useNavigate();

  return (fallback: string) => {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };
}
