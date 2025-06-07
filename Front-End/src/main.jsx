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
import { VaccinePerProvider } from "./contexts/PerBabyVacine/PerBabyVacineContext.jsx";
import { LogDisplayProvider } from "./contexts/LogAndAuditContext/LogAuditContext.jsx";
import { ProfillingDisplayProvider } from "./contexts/ProfillingContext/ProfillingContext.jsx";
import SocketListener from "./component/SocketListener";
import { NotificationDisplayProvider } from "./contexts/NotificationContext.jsx";
import { ReportDisplayProvider } from "./contexts/Report/ReportContext.jsx";

createRoot(document.getElementById("root")).render(
    //<StrictMode>
    <ThemeProvider>
        {" "}
        <AuthProvider>
            <ReportDisplayProvider>
                <NotificationDisplayProvider>
                    <ProfillingDisplayProvider>
                        <LogDisplayProvider>
                            <VaccinePerProvider>
                                <VaccineDisplayProvider>
                                    <VaccineRecordDisplayProvider>
                                        <NewBornDisplayProvider>
                                            <UserDisplayProvider>
                                                <App />
                                                <SocketListener />
                                            </UserDisplayProvider>
                                        </NewBornDisplayProvider>
                                    </VaccineRecordDisplayProvider>
                                </VaccineDisplayProvider>
                            </VaccinePerProvider>
                        </LogDisplayProvider>
                    </ProfillingDisplayProvider>
                </NotificationDisplayProvider>
            </ReportDisplayProvider>
        </AuthProvider>
    </ThemeProvider>,
    //</StrictMode>,
);
