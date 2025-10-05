import { StrictMode } from "react";
import {createRoot } from "react-dom/client" ; 
import "./App.jsx" 
import {BrowserRouter } from "react-router-dom" ; 
import App from "./App.jsx";

createRoot.apply(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
         <App />
        </BrowserRouter>
    </StrictMode>
) ; 