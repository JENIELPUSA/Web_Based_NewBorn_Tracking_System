import React, { useContext, useState } from "react";
import { User, Calendar, CheckCircle, Loader2, XCircle, Info, Search, Heart, Download } from "lucide-react";
import Header from "./Header";
import Footer from "../LandingPage/Footer";
import { ProfillingContexts } from "../../contexts/ProfillingContext/ProfillingContext";
import ChildCard from "./ChildCard";

const toDate = (dateString) => (dateString ? new Date(dateString) : null);

const getAgeInMonths = (dobDate) => {
    if (!dobDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now - dobDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays / 30.4375;
};

const transformNewbornToChild = (newborn) => {
    const growthHistory = [];

    if (newborn.latestWeight != null || newborn.latestHeight != null) {
        growthHistory.push({
            id: `newborn-${newborn._id}`,
            date: newborn.dateOfBirth,
            weight: newborn.latestWeight,
            height: newborn.latestHeight,
            isNewborn: true,
        });
    }

    if (Array.isArray(newborn.everyVisit)) {
        newborn.everyVisit.forEach((visit, idx) => {
            growthHistory.push({
                id: `visit-${newborn._id}-${idx}`,
                date: visit.visitDate,
                weight: visit.weight,
                height: visit.height,
            });
        });
    }

    const childDOB = toDate(newborn.dateOfBirth);
    const ageInMonths = getAgeInMonths(childDOB);
    const ageDisplay = childDOB ? (ageInMonths < 12 ? `${Math.floor(ageInMonths)} months` : `${Math.floor(ageInMonths / 12)} years`) : "N/A";

    return {
        id: newborn._id,
        blood_type:newborn.blood_type,
        name: newborn.newbornName,
        dob: newborn.dateOfBirth,
        ageDisplay,
        gender: newborn.gender,
        motherName: newborn.motherName,
        familyCode: newborn.familyCode,
        growthHistory: growthHistory.sort((a, b) => new Date(a.date) - new Date(b.date)),
        rawVaccinationRecords: newborn.vaccinationRecords,
    };
};

export default function TrackBaby() {
    const { fetchTrackingBaby, isTrackingBabyData, isLoading } = useContext(ProfillingContexts);
    const [inputCode, setInputCode] = useState("");
    const [inputName, setInputName] = useState("");

    const handleCodeRetrieval = (e) => {
        e.preventDefault();
        if (!inputCode.trim()) return;
        fetchTrackingBaby(inputCode.trim(), inputName.trim());
    };
    // Derive UI states from actual inputs and context
    const hasUserSearched = inputCode.trim() !== "";
    const childrenData = Array.isArray(isTrackingBabyData) ? isTrackingBabyData.map(transformNewbornToChild) : [];
    const hasData = childrenData.length > 0;
    const showError = !isLoading && hasUserSearched && !hasData;
    let statusIcon, statusColor, statusMessage;
    if (isLoading) {
        statusIcon = Loader2;
        statusColor = "text-blue-600 animate-spin";
        statusMessage = "Searching for data...";
    } else if (showError) {
        statusIcon = XCircle;
        statusColor = "text-red-600";
        statusMessage = "No records found for the given family code.";
    } else if (hasData) {
        statusIcon = CheckCircle;
        statusColor = "text-green-600";
        statusMessage = "Data retrieved!";
    } else {
        statusIcon = Info;
        statusColor = "text-gray-600";
        statusMessage = "Enter Family Code.";
    }
    const StatusIconComponent = statusIcon;

    const familyInfo = hasData
        ? {
              parentName: childrenData[0].motherName || "Unknown Parent",
              parentCode: childrenData[0].familyCode || inputCode,
          }
        : null;

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="flex-1 px-3 py-4 sm:p-3">
                <div className="mx-auto max-w-6xl">
                    {/* Header Section */}
                    <div className="mb-4 text-center">
                        <div className="rounded-lg border border-blue-200 bg-white p-3 shadow sm:p-4">
                            <div className="mb-2 flex flex-col items-center justify-center sm:flex-row">
                                <div className="mb-2 rounded-lg bg-[#7B8D6A] p-2 sm:mb-0 sm:mr-2">
                                    <Heart className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Family Health Viewer</h1>
                            </div>
                            <p className="text-xs text-gray-600 sm:text-sm">Enter Family Code to view health records</p>
                        </div>
                    </div>

                    {/* Search Form Section */}
                    <div className="mb-4 rounded-lg border border-blue-200 bg-white p-3 shadow sm:p-4">
                        <div className="mb-3 flex items-center">
                            <Search className="mr-2 h-5 w-5 text-[#7B8D6A]" />
                            <h2 className="text-base font-bold text-gray-800 sm:text-lg">Retrieve Data</h2>
                        </div>

                        <form onSubmit={handleCodeRetrieval}>
                            <div className="mb-3 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Family Code</label>
                                    <input
                                        type="text"
                                        value={inputCode}
                                        onChange={(e) => setInputCode(e.target.value)}
                                        placeholder="Enter family code"
                                        required
                                        className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Parent Name</label>
                                    <input
                                        type="text"
                                        value={inputName}
                                        onChange={(e) => setInputName(e.target.value)}
                                        placeholder="Optional"
                                        className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="mb-3 flex">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex flex-1 items-center justify-center rounded bg-[#7B8D6A] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#D4F3B7] sm:py-2"
                                >
                                    {isLoading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />}
                                    {isLoading ? "Loading..." : "Retrieve Data"}
                                </button>
                            </div>
                        </form>

                        {/* Status Message */}
                        <div
                            className={`rounded border p-3 text-sm ${
                                showError ? "border-red-200 bg-red-50" : hasData ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"
                            }`}
                        >
                            <div className={`flex items-center font-medium ${statusColor}`}>
                                <StatusIconComponent className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{statusMessage}</span>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    {hasData ? (
                        <div>
                            {/* Family Information */}
                            <div className="mb-3 rounded-lg bg-[#7B8D6A] p-3 text-white">
                                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <div className="text-center sm:text-left">
                                        <h3 className="font-bold">Family Information</h3>
                                        <p className="text-xs text-green-100 sm:text-sm">
                                            {familyInfo.parentName} • {familyInfo.parentCode}
                                        </p>
                                    </div>
                                    <div className="text-center text-xs italic text-green-100 sm:text-right">Live Data</div>
                                </div>
                            </div>

                            {/* Children Header */}
                            <div className="mb-3 flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                                <h2 className="flex items-center text-lg font-bold text-gray-800 sm:text-xl">
                                    <User className="mr-2 h-5 w-5 text-blue-600" />
                                    Children Data
                                    <span className="ml-2 rounded bg-blue-600 px-2 py-0.5 text-xs text-white">{childrenData.length}</span>
                                </h2>
                            </div>

                            {/* Children Cards */}
                            <div className="grid gap-3">
                                {childrenData.map((child) => (
                                    <ChildCard
                                        key={child.id}
                                        child={child}
                                
                                    />
                                ))}
                            </div>
                        </div>
                    ) : showError ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-8 text-center shadow">
                            <p className="text-sm text-gray-500">No data found for the provided family code.</p>
                        </div>
                    ) : null}
                </div>
            </main>
            <Footer />
        </div>
    );
}
