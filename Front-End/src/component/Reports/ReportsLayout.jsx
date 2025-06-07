import React, { useContext, useState } from "react";
import { Download } from "lucide-react";
import { Footer } from "@/layouts/footer";
import { ReportDisplayContext } from "../../contexts/Report/ReportContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Component for a single PDF card
function PdfReportCard({ title, description, defaultFromDate = "", defaultToDate = "" }) {
    const { customError,downloadProfillingReport, downloadNewBornReport, downloadIventoryReport,message } = useContext(ReportDisplayContext);
    const [fromDate, setFromDate] = useState(defaultFromDate);
    const [toDate, setToDate] = useState(defaultToDate);

    const handleDownload = async () => {
        if (!fromDate || !toDate) {
            alert("Please select both start and end dates.");
            return;
        }

        if (title === "Profilling Reports") {
            await downloadProfillingReport(fromDate, toDate); // <-- this triggers the download
        } else if (title === "New Born Reports") {
            await downloadNewBornReport(fromDate, toDate);
        } else {
            await downloadIventoryReport(fromDate, toDate);
        }
    };
    return (
        <div className="flex w-72 transform flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 dark:shadow-none">
            <div className="relative flex h-40 w-32 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                <span className="absolute left-2 top-2 rounded bg-red-600 px-2.5 py-1 text-sm font-bold tracking-wider text-white">PDF</span>
                {/* SVG for a more distinct PDF icon */}
                <svg
                    className="h-20 w-20 text-red-500 dark:text-red-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
                <div className="absolute bottom-3 right-3">
                    <Download className="h-7 w-7 text-red-700 dark:text-red-400" />
                </div>
            </div>

            <p className="mt-5 text-center text-xl font-bold text-gray-800 dark:text-gray-100">{title}</p>
            <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-300">{description}</p>

            {/* From and To Date Pickers inside the card */}
            <div className="mt-4 flex w-full flex-col gap-3">
                <div className="flex flex-col">
                    <label
                        htmlFor={`fromDate-${title.replace(/\s+/g, "-")}`}
                        className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                        From:
                    </label>
                    <input
                        type="date"
                        id={`fromDate-${title.replace(/\s+/g, "-")}`} // Unique ID for each date input
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
                    />
                </div>
                <div className="flex flex-col">
                    <label
                        htmlFor={`toDate-${title.replace(/\s+/g, "-")}`}
                        className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                        To:
                    </label>
                    <input
                        type="date"
                        id={`toDate-${title.replace(/\s+/g, "-")}`} // Unique ID for each date input
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-blue-400"
                    />
                </div>
            </div>

            <button
                onClick={handleDownload}
                className="mt-6 inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Download Now
                <Download className="ml-3 h-5 w-5" />
            </button>
        </div>
    );
}

// Main ReportsLayout component
function ReportsLayout() {
      const { customError,downloadProfillingReport, downloadNewBornReport, downloadIventoryReport,message } = useContext(ReportDisplayContext);
    return (
        // We'll wrap the main content and footer in a flex container
        // to ensure the footer sticks to the bottom.
        <div className="flex min-h-screen flex-col">
            {/* Main content area */}
            <main className="flex flex-grow flex-col items-center bg-gray-50 p-8 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100">
                {/* Red Banner at the Top */}
                <div className="mb-12 w-full rounded-md bg-red-600 px-4 py-3 text-center text-white shadow-lg dark:bg-red-700">
                    <p className="text-lg font-semibold">Important Announcement: New Reports Available!</p>
                </div>
                  {customError && (
                    <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-4 py-2 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                        {customError}
                    </div>
                )}

                {/* Section Title */}
                <h2 className="mb-12 text-4xl font-extrabold text-gray-800 drop-shadow-sm dark:text-white">Our Latest Reports</h2>

                {/* Container for the three PDF cards */}
                <div className="flex flex-wrap justify-center gap-10">
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
            </main>{" "}
            {/* End of main content area */}
            {/* Footer component */}
            <Footer />
        </div>
    );
}

export default ReportsLayout;
