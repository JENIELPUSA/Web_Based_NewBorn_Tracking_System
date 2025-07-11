import React, { useContext, useState } from "react";
import { Download } from "lucide-react";
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
            } else {
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

    return (
        <div className="w-full max-w-xs transform rounded-2xl border border-gray-100 bg-white p-4 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-none sm:p-6">
            <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 sm:h-36">
                <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-bold tracking-wider text-white">PDF</span>
                <svg
                    className="h-14 w-14 text-red-500 dark:text-red-400 sm:h-16 sm:w-16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
                <div className="absolute bottom-2 right-2">
                    <Download className="h-4 w-4 text-red-700 dark:text-red-400 sm:h-5 sm:w-5" />
                </div>
            </div>

            <p className="mt-3 text-center text-xs font-bold text-gray-800 dark:text-gray-100 sm:mt-4 sm:text-sm md:text-base">{title}</p>
            <p className="mt-1 text-center text-xs text-gray-600 dark:text-gray-300 sm:text-sm md:text-sm">{description}</p>

            <div className="mt-3 flex flex-col items-center gap-2 sm:mt-4 sm:gap-3">
                <div className="w-full">
                    <label
                        htmlFor={`fromDate-${title.replace(/\s+/g, "-")}`}
                        className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                        From:
                    </label>
                    <input
                        type="date"
                        id={`fromDate-${title.replace(/\s+/g, "-")}`}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
                        disabled={loading} // Disable input while loading
                    />
                </div>
                <div className="w-full">
                    <label
                        htmlFor={`toDate-${title.replace(/\s+/g, "-")}`}
                        className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                        To:
                    </label>
                    <input
                        type="date"
                        id={`toDate-${title.replace(/\s+/g, "-")}`}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full rounded-md border border-gray-300 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
                        disabled={loading} // Disable input while loading
                    />
                </div>
            </div>

            <button
                onClick={handleDownload}
                className="mt-3 w-full rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors duration-200 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:mt-5 sm:text-sm flex items-center justify-center"
                disabled={loading} // Disable button while loading
            >
                {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            <main className="flex flex-grow flex-col items-center bg-gray-50 p-4 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100 sm:p-6 md:p-8 rounded-lg">
                <div className="mb-8 w-full rounded-md bg-red-600 px-4 py-3 text-center text-white shadow-lg dark:bg-red-700">
                    <p className="text-base font-semibold sm:text-lg">Important Announcement: New Reports Available!</p>
                </div>

                {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                        {customError}
                    </div>
                )}

                <h2 className="mb-10 text-center text-2xl font-extrabold text-gray-800 drop-shadow-sm dark:text-white sm:text-3xl md:text-4xl">
                    Our Latest Reports
                </h2>

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