import React, { useContext, useState } from "react";
import { File,Download, Syringe, User } from "lucide-react";
import { Footer } from "@/layouts/footer";
import { ReportDisplayContext } from "../../contexts/Report/ReportContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PdfReportCard({ title, description, defaultFromDate = "", defaultToDate = "" }) {
    const { downloadProfillingReport, downloadNewBornReport, downloadIventoryReport } = useContext(ReportDisplayContext);
    const [fromDate, setFromDate] = useState(defaultFromDate);
    const [toDate, setToDate] = useState(defaultToDate);
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        if (!fromDate || !toDate) {
            toast.error("Please select both start and end dates.");
            return;
        }

        setLoading(true);

        try {
            if (title === "Profilling Reports") {
                await downloadProfillingReport(fromDate, toDate);
            } else if (title === "New Born Reports") {
                await downloadNewBornReport(fromDate, toDate);
            } else if (title === "Vaccine Inventory") {
                await downloadIventoryReport(fromDate, toDate);
            }
            setFromDate("");
            setToDate("");
        } catch (error) {
            toast.error(`Error downloading ${title}. Please try again.`);
            console.error("Download error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Determine main icon to show in the center
    const renderMainIcon = () => {
        if (title === "Profilling Reports") {
            return <File className="h-14 w-14 text-blue-500 sm:h-16 sm:w-16" />;
        } else if (title === "Vaccine Inventory") {
            return <Syringe className="h-14 w-14 text-blue-500 sm:h-16 sm:w-16" />;
        } else if (title === "Child Reports") {
            return <User className="h-14 w-14 text-blue-500 sm:h-16 sm:w-16" />;
        }
        return <Download className="h-14 w-14 text-blue-500 sm:h-16 sm:w-16" />;
    };

    return (
        <div className="w-full max-w-xs transform rounded-2xl border border-gray-100 bg-white p-4 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:p-6">
            <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 sm:h-36">
                <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-xs font-bold tracking-wider text-white">PDF</span>
                
                {/* MAIN ICON - CENTERED */}
                {renderMainIcon()}

                {/* Optional: Keep download indicator in corner if needed, or remove */}
                {/* <div className="absolute bottom-2 right-2">
                    <Download className="h-4 w-4 text-red-700 sm:h-5 sm:w-5" />
                </div> */}
            </div>

            <p className="mt-3 text-center text-xs font-bold text-gray-800 sm:mt-4 sm:text-sm md:text-base">{title}</p>
            <p className="mt-1 text-center text-xs text-gray-600 sm:text-sm md:text-sm">{description}</p>

            <div className="mt-3 flex flex-col items-center gap-2 sm:mt-4 sm:gap-3">
                <div className="w-full">
                    <label
                        htmlFor={`fromDate-${title.replace(/\s+/g, "-")}`}
                        className="mb-1 block text-xs font-medium text-gray-700"
                    >
                        From:
                    </label>
                    <input
                        type="date"
                        id={`fromDate-${title.replace(/\s+/g, "-")}`}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                </div>
                <div className="w-full">
                    <label
                        htmlFor={`toDate-${title.replace(/\s+/g, "-")}`}
                        className="mb-1 block text-xs font-medium text-gray-700"
                    >
                        To:
                    </label>
                    <input
                        type="date"
                        id={`toDate-${title.replace(/\s+/g, "-")}`}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                </div>
            </div>

            <button
                onClick={handleDownload}
                className="mt-3 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-5 sm:text-sm"
                disabled={loading}
            >
                {loading ? (
                    <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                ) : (
                    <>
                        Download Now
                        <Download className="ml-2 inline-block h-4 w-4" />
                    </>
                )}
            </button>
        </div>
    );
}

function ReportsLayout() {
    const { customError } = useContext(ReportDisplayContext);

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex flex-grow flex-col items-center rounded-lg bg-gray-50 p-4 transition-colors duration-300 sm:p-6 md:p-8">
                <div className="mb-8 w-full rounded-md bg-blue-600 px-4 py-3 text-center text-white shadow-lg">
                    <p className="text-base font-semibold sm:text-lg">Important Announcement: New Reports Available!</p>
                </div>

                {customError && <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700">{customError}</div>}

                <h2 className="mb-10 text-center text-2xl font-extrabold text-gray-800 drop-shadow-sm sm:text-3xl md:text-4xl">Our Latest Reports</h2>

                <div className="grid w-full grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <PdfReportCard
                        title="Profilling Reports"
                        description="Detailed demographic and health profiling of newborns."
                    />
                    <PdfReportCard
                        title="Vaccine Inventory"
                        description="Current stock levels and vaccine expiration tracking."
                    />
                    <PdfReportCard
                        title="New Born Reports"
                        description="Summary of births, health stats, and delivery details."
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default ReportsLayout;