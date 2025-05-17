import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Import your providers
import { UserDisplayProvider } from "./contexts/UserContxet/UserContext";
import { ThemeProvider } from "./contexts/theme-context.jsx"; // only if used
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NewBornDisplayProvider } from "./contexts/NewBornContext/NewBornContext.jsx";
import { VaccineDisplayProvider } from "./contexts/VaccineContext/VaccineContext.jsx";
import { VaccineRecordDisplayProvider } from "./contexts/VaccineRecordCxt/VaccineRecordContext.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ThemeProvider>
            {" "}
            <AuthProvider>
                <VaccineRecordDisplayProvider>
                    <VaccineDisplayProvider>
                        <NewBornDisplayProvider>
                            <UserDisplayProvider>
                                <App />
                            </UserDisplayProvider>
                        </NewBornDisplayProvider>
                    </VaccineDisplayProvider>
                </VaccineRecordDisplayProvider>
            </AuthProvider>
        </ThemeProvider>
    </StrictMode>,
);
