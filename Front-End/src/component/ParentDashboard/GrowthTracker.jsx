import React, { useEffect, useContext } from "react";
import { VisitRecordContexts } from "../../contexts/VisitRecordContext/VisitRecordContext";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
const Card = ({ title, children }) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-colors duration-300 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
            {children}
        </div>
    );
};

const GrowthTracker = () => {
    const { fetchLatestData, isLatestcData } = useContext(VisitRecordContexts);
    const { patientID } = useContext(VaccineRecordDisplayContext);
    useEffect(() => {
        if (patientID) {
            fetchLatestData(patientID);
            console.log("Growth text:", patientID);
        }
    }, [patientID]);
    const { currentWeight, currentHeight, weightDiff, heightDiff } = isLatestcData;

    // Calculate progress bar percentages (dummy logic for visual representation)
    // You might want to replace this with actual target-based calculations
    const weightProgressBar = Math.min(100, Math.max(0, (currentWeight / 10) * 100)); // Example: 10kg as a rough "full" scale
    const heightProgressBar = Math.min(100, Math.max(0, (currentHeight / 80) * 100)); // Example: 80cm as a rough "full" scale

    return (
        <Card title="Growth Tracker">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-purple-50 p-4 text-center shadow-sm dark:bg-purple-900">
                    <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-200">Weight Progress</h4>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currentWeight} kg</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ({weightDiff >= 0 ? "+" : ""}
                        {weightDiff} kg since last month)
                    </p>
                    <div className="mt-3 flex h-16 items-end overflow-hidden rounded-md bg-purple-200 dark:bg-purple-700">
                        <div
                            className="h-full animate-pulse rounded-md bg-purple-400 dark:bg-purple-500"
                            style={{ width: `${weightProgressBar}%` }}
                        ></div>
                    </div>
                </div>
                <div className="rounded-lg bg-teal-50 p-4 text-center shadow-sm dark:bg-teal-900">
                    <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-200">Height Progress</h4>
                    <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{currentHeight} cm</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ({heightDiff >= 0 ? "+" : ""}
                        {heightDiff} cm since last month)
                    </p>
                    <div className="mt-3 flex h-16 items-end overflow-hidden rounded-md bg-teal-200 dark:bg-teal-700">
                        <div
                            className="h-full animate-pulse rounded-md bg-teal-400 dark:bg-teal-500"
                            style={{ width: `${heightProgressBar}%` }}
                        ></div>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                (Comparison vs standard WHO growth chart data not shown in this simplified UI.)
            </p>
        </Card>
    );
};

export default GrowthTracker;
