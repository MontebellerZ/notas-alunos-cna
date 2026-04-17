import "./App.scss";
import { ToastContainer } from "react-toastify";
import Router from "./router";

function App() {
  return (
    <>
      <Router />

      <ToastContainer closeOnClick draggable />
    </>
  );
}

export default App;
