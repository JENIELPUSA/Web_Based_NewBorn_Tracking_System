import React, { useEffect, useContext } from "react";
import { VisitRecordContexts } from "../../contexts/VisitRecordContext/VisitRecordContext";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";
import { CircleX } from 'lucide-react'; // Import the icon

const Card = ({ title, children }) => {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-colors duration-300">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">{title}</h2>
            {children}
        </div>
    );
};

const GrowthTracker = ({ isClearDataTrack }) => {
    const { fetchLatestData, isLatestcData } = useContext(VisitRecordContexts);
    const { patientID } = useContext(VaccineRecordDisplayContext);

    useEffect(() => {
        if (patientID && !isClearDataTrack) {
            fetchLatestData(patientID);
        }
    }, [patientID, isClearDataTrack]);

    const currentWeight = isClearDataTrack ? null : isLatestcData.currentWeight;
    const currentHeight = isClearDataTrack ? null : isLatestcData.currentHeight;
    const weightDiff = isClearDataTrack ? null : isLatestcData.weightDiff;
    const heightDiff = isClearDataTrack ? null : isLatestcData.heightDiff;

    const weightProgressBar = currentWeight ? Math.min(100, Math.max(0, (currentWeight / 10) * 100)) : 0;
    const heightProgressBar = currentHeight ? Math.min(100, Math.max(0, (currentHeight / 80) * 100)) : 0;

    return (
        <Card title="Growth Tracker">
            {isClearDataTrack ? (
                <div className="text-center py-8">
                    <CircleX className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No data available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-purple-50 p-4 text-center shadow-sm">
                        <h4 className="mb-2 font-medium text-gray-700">Weight Progress</h4>
                        <p className="text-3xl font-bold text-purple-600">{currentWeight} kg</p>
                        <p className="text-sm text-gray-500">
                            ({weightDiff >= 0 ? "+" : ""}{weightDiff} kg since last month)
                        </p>
                        <div className="mt-3 flex h-16 items-end overflow-hidden rounded-md bg-purple-200">
                            <div
                                className="h-full animate-pulse rounded-md bg-purple-400"
                                style={{ width: `${weightProgressBar}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="rounded-lg bg-teal-50 p-4 text-center shadow-sm">
                        <h4 className="mb-2 font-medium text-gray-700">Height Progress</h4>
                        <p className="text-3xl font-bold text-teal-600">{currentHeight} cm</p>
                        <p className="text-sm text-gray-500">
                            ({heightDiff >= 0 ? "+" : ""}{heightDiff} cm since last month)
                        </p>
                        <div className="mt-3 flex h-16 items-end overflow-hidden rounded-md bg-teal-200">
                            <div
                                className="h-full animate-pulse rounded-md bg-teal-400"
                                style={{ width: `${heightProgressBar}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
            {!isClearDataTrack && (
                <p className="mt-4 text-center text-sm text-gray-500">
                    (Comparison vs standard WHO growth chart data not shown in this simplified UI.)
                </p>
            )}
        </Card>
    );
};

export default GrowthTracker;