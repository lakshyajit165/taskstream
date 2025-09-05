import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import "@fontsource/open-sans"; // Defaults to weight 400
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css"; // (optional extra weights)

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>
);
