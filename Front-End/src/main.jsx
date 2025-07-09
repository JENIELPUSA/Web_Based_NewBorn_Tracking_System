import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
import AxiosInterceptor from "./component/AxiosInterceptor.jsx";
import { BrandDisplayProvider } from "./contexts/BrandContext/BrandContext.jsx";
import { UpdatePasswordDisplayProvider } from "./contexts/UpdatePasswordContext/UpdateContext.jsx";
import { VisitRecordProvider } from "./contexts/VisitRecordContext/VisitRecordContext.jsx";
import { ParentDisplayProvider } from "./contexts/ParentContext/ParentContext.jsx";
createRoot(document.getElementById("root")).render(
    //<StrictMode>
    <AuthProvider>
        <ThemeProvider>
            <ParentDisplayProvider>
                <VisitRecordProvider>
                    <UpdatePasswordDisplayProvider>
                        <BrandDisplayProvider>
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
                                                                <AxiosInterceptor />
                                                                <SocketListener />
                                                                <ToastContainer
                                                                    position="top-right"
                                                                    autoClose={3000}
                                                                    hideProgressBar={false}
                                                                    newestOnTop={false}
                                                                    closeOnClick
                                                                    pauseOnFocusLoss
                                                                    draggable
                                                                    pauseOnHover
                                                                    theme="light"
                                                                />
                                                            </UserDisplayProvider>
                                                        </NewBornDisplayProvider>
                                                    </VaccineRecordDisplayProvider>
                                                </VaccineDisplayProvider>
                                            </VaccinePerProvider>
                                        </LogDisplayProvider>
                                    </ProfillingDisplayProvider>
                                </NotificationDisplayProvider>
                            </ReportDisplayProvider>
                        </BrandDisplayProvider>
                    </UpdatePasswordDisplayProvider>
                </VisitRecordProvider>
            </ParentDisplayProvider>
        </ThemeProvider>
    </AuthProvider>,
    //</StrictMode>
);
