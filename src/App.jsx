import React from "react";
import Home from "./pages/Home";
import "./App.scss";
import "./theme/index.scss";
import { GlobalProvider } from "./store/GlobalStore";

function App() {
  return (
    <GlobalProvider>
      <Home />
    </GlobalProvider>
  );
}

export default App;
