// src/components/ChildCard.jsx
import React, { useState, useMemo } from "react";
import {
    Baby,
    Calendar,
    CheckCircle,
    XCircle,
    Info,
    Heart,
    Shield,
    Scale,
    Ruler,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Clock,
    TrendingUp,
    Syringe,
} from "lucide-react";

// --- Utility Functions Used in ChildCard Only ---
const formatDate = (dateString) => {
    try {
        if (!dateString) return "None";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
        return dateString;
    }
};

const normalizeVaccineName = (rawName) => {
    if (!rawName) return "Unknown";
    const clean = rawName
        .toLowerCase()
        .replace(/["'`\\]/g, "")
        .replace(/[^a-z0-9]/g, "");
    if (clean.includes("bcg")) return "BCG (Tuberculosis)";
    if (clean.includes("hepatitisb")) return "Hepatitis B";
    if (clean.includes("rotavirus")) return "Rotavirus";
    if (clean.includes("pneumococcal") || clean.includes("pcv")) return "Pneumococcal (PCV)";
    if (clean.includes("mmr")) return "MMR (Measles, Mumps, Rubella)";
    return rawName;
};

const extractVaccineDoses = (vaccinationRecords = []) => {
    const doses = [];
    if (!Array.isArray(vaccinationRecords)) return doses;

    vaccinationRecords.forEach((record) => {
        const baseName = normalizeVaccineName(record.vaccineName || "");
        if (Array.isArray(record.doses)) {
            record.doses.forEach((dose) => {
                doses.push({
                    vaccineName: baseName,
                    doseNumber: dose.doseNumber || 1,
                    dateGiven: dose.dateGiven || null,
                    nextDueDate: dose.next_due_date || null,
                    label: `${baseName} - Dose ${dose.doseNumber || 1}`,
                });
            });
        }
    });

    return doses.sort((a, b) => {
        const dateA = a.nextDueDate ? new Date(a.nextDueDate) : new Date(8640000000000000);
        const dateB = b.nextDueDate ? new Date(b.nextDueDate) : new Date(8640000000000000);
        return dateA - dateB || a.doseNumber - b.doseNumber;
    });
};

const VaccineStatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case "Complete":
                return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle };
            case "Due":
                return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: AlertTriangle };
            case "Overdue":
                return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle };
            case "Upcoming":
                return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Clock };
            default:
                return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: Info };
        }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border} border`}>
            <IconComponent className="mr-1 h-3 w-3" />
            {status}
        </span>
    );
};

const ChildCard = React.memo(({ child}) => {
    const [isGrowthListVisible, setIsGrowthListVisible] = useState(false);
    const [isVaccineListVisible, setIsVaccineListVisible] = useState(false);
    const latestGrowth = child.growthHistory?.at(-1) || null;
    const vaccineDoses = useMemo(() => extractVaccineDoses(child.rawVaccinationRecords), [child.rawVaccinationRecords]);

    const getDoseStatus = (dose) => {
        if (dose.dateGiven) return "Complete";
        if (!dose.nextDueDate) return "Unknown";

        const now = new Date();
        const dueDate = new Date(dose.nextDueDate);
        now.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const timeDiff = now.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysOverdue >= 7) return "Overdue";
        if (daysOverdue >= 0) return "Due";
        return "Upcoming";
    };

    const completedDoses = vaccineDoses.filter((d) => d.dateGiven).length;
    const totalDoses = vaccineDoses.length;
    const vaccineProgress = totalDoses > 0 ? (completedDoses / totalDoses) * 100 : 0;

    return (
        <div className="rounded-lg border-l-4 border-[#7B8D6A] bg-white p-3 shadow sm:p-4">
            {/* Header Section */}
            <div className="mb-3 flex flex-col items-start justify-between border-b border-gray-100 pb-2 sm:flex-row sm:items-center">
                <div className="mb-2 flex items-center sm:mb-0">
                    <div className="mr-3 rounded-lg bg-blue-100 p-2">
                        <Baby className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800 sm:text-lg">{child.name}</h3>
                        <p className="flex items-center text-xs text-gray-500 sm:text-sm">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(child.dob)} • {child.ageDisplay}
                        </p>
                    </div>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 sm:px-3 sm:py-2">
                    <p className="text-xs font-medium text-gray-600">Vaccine Progress</p>
                    <div className="flex items-center">
                        <span className="mr-1 text-xs font-bold text-blue-600 sm:mr-2 sm:text-sm">
                            {completedDoses}/{totalDoses}
                        </span>
                        <div className="h-1.5 w-12 rounded-full bg-gray-200 sm:w-16">
                            <div
                                className="h-1.5 rounded-full bg-green-600"
                                style={{ width: `${vaccineProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-2">
                    <div className="flex items-center justify-between">
                        <Scale className="h-4 w-4 text-blue-600" />
                        <span className="rounded bg-blue-200 px-1 py-0.5 text-xs font-medium text-blue-700">Weight</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-gray-800 sm:text-sm">{latestGrowth?.weight ? `${latestGrowth.weight} kg` : "N/A"}</p>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-2">
                    <div className="flex items-center justify-between">
                        <Ruler className="h-4 w-4 text-green-600" />
                        <span className="rounded bg-green-200 px-1 py-0.5 text-xs font-medium text-green-700">Height</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-gray-800 sm:text-sm">{latestGrowth?.height ? `${latestGrowth.height} cm` : "N/A"}</p>
                </div>

                <div className="rounded-lg border border-purple-200 bg-purple-50 p-2">
                    <div className="flex items-center justify-between">
                        <Syringe className="h-4 w-4 text-purple-600" />
                        <span className="rounded bg-purple-200 px-1 py-0.5 text-xs font-medium text-purple-700">Vaccines</span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-gray-800 sm:text-sm">
                        {completedDoses}
                        <span className="text-xs text-gray-500">/{totalDoses}</span>
                    </p>
                </div>

                <div className="rounded-lg border border-orange-200 bg-orange-50 p-2">
                    <div className="flex items-center justify-between">
                        <Heart className="h-4 w-4 text-orange-600" />
                        <span className="rounded bg-orange-200 px-1 py-0.5 text-xs font-medium text-orange-700">Blood Type</span>
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-gray-800">
                        {child.blood_type}
                    </p>
                </div>
            </div>

            {/* Growth Records Section */}
            <div className="mb-3">
                <button
                    onClick={() => setIsGrowthListVisible((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-2 text-xs transition-colors hover:bg-blue-100 sm:text-sm"
                >
                    <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-700">Growth Records</span>
                    </div>
                    {isGrowthListVisible ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
                </button>

                {isGrowthListVisible && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {child.growthHistory && child.growthHistory.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {/* Table Header - Hidden on mobile, shown on sm and up */}
                                <div className="hidden bg-gray-100 p-2 text-xs font-bold text-gray-700 sm:grid sm:grid-cols-12">
                                    <div className="col-span-4">Date</div>
                                    <div className="col-span-4 text-center">Weight</div>
                                    <div className="col-span-4 text-center">Height</div>
                                </div>

                                {/* Mobile Layout */}
                                <div className="sm:hidden">
                                    {child.growthHistory.map((entry, index) => (
                                        <div
                                            key={entry.id}
                                            className={`border-b border-gray-200 p-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                        >
                                            <div className="mb-2 flex justify-between">
                                                <span className="text-xs font-medium text-gray-500">Date:</span>
                                                <span className="text-xs font-medium text-gray-900">{formatDate(entry.date)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <div className="flex-1 text-center">
                                                    <span className="text-xs font-medium text-gray-500">Weight</span>
                                                    <p className="text-sm font-bold text-blue-600">
                                                        {entry.weight ? `${entry.weight.toFixed(1)} kg` : "N/A"}
                                                    </p>
                                                </div>
                                                <div className="flex-1 text-center">
                                                    <span className="text-xs font-medium text-gray-500">Height</span>
                                                    <p className="text-sm font-bold text-green-600">{entry.height ? `${entry.height} cm` : "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden sm:block">
                                    {child.growthHistory.map((entry, index) => (
                                        <div
                                            key={entry.id}
                                            className={`grid grid-cols-12 p-2 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} text-sm`}
                                        >
                                            <div className="col-span-4 font-medium text-gray-900">{formatDate(entry.date)}</div>
                                            <div className="col-span-4 text-center">
                                                <span className="font-bold text-blue-600">{entry.weight ? `${entry.weight.toFixed(1)}` : "N/A"}</span>
                                                {entry.weight && <span className="ml-1 text-xs text-gray-500">kg</span>}
                                            </div>
                                            <div className="col-span-4 text-center">
                                                <span className="font-bold text-green-600">{entry.height ? `${entry.height}` : "N/A"}</span>
                                                {entry.height && <span className="ml-1 text-xs text-gray-500">cm</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 text-center">
                                <p className="text-sm text-gray-500">No growth data recorded</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Vaccine List Section */}
            <div className="mb-1">
                <button
                    onClick={() => setIsVaccineListVisible((v) => !v)}
                    className="flex w-full items-center justify-between rounded-lg border border-green-200 bg-green-50 p-2 text-xs transition-colors hover:bg-green-100 sm:text-sm"
                >
                    <div className="flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">
                            Vaccine List ({completedDoses}/{totalDoses})
                        </span>
                    </div>
                    {isVaccineListVisible ? <ChevronUp className="h-4 w-4 text-green-600" /> : <ChevronDown className="h-4 w-4 text-green-600" />}
                </button>

                {isVaccineListVisible && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <div className="overflow-x-auto">
                            {/* Mobile Layout */}
                            <div className="sm:hidden">
                                {vaccineDoses.length > 0 ? (
                                    <div className="divide-y divide-gray-200">
                                        {vaccineDoses.map((dose, idx) => {
                                            const status = getDoseStatus(dose);
                                            return (
                                                <div
                                                    key={idx}
                                                    className="p-3 hover:bg-blue-50"
                                                >
                                                    <div className="mb-2">
                                                        <span className="text-xs font-medium text-gray-500">Vaccine:</span>
                                                        <p className="text-sm font-medium text-gray-900">{dose.label}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <span className="text-gray-500">Due:</span>
                                                            <p className="font-medium text-gray-700">
                                                                {dose.nextDueDate ? formatDate(dose.nextDueDate) : "-"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Given:</span>
                                                            <p className="font-medium text-gray-700">
                                                                {dose.dateGiven ? formatDate(dose.dateGiven) : "-"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <VaccineStatusBadge status={status} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-3 text-center">
                                        <p className="text-sm text-gray-500">No vaccine data recorded</p>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Layout */}
                            <table className="hidden min-w-full divide-y divide-gray-200 text-sm sm:table">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-2 py-1 text-left text-xs font-bold text-gray-700">Vaccine</th>
                                        <th className="px-2 py-1 text-left text-xs font-bold text-gray-700">Due Date</th>
                                        <th className="px-2 py-1 text-left text-xs font-bold text-gray-700">Administered</th>
                                        <th className="px-2 py-1 text-left text-xs font-bold text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {vaccineDoses.map((dose, idx) => {
                                        const status = getDoseStatus(dose);
                                        return (
                                            <tr
                                                key={idx}
                                                className="hover:bg-blue-50"
                                            >
                                                <td className="whitespace-normal px-2 py-1 text-xs font-medium text-gray-900">{dose.label}</td>
                                                <td className="whitespace-nowrap px-2 py-1 text-xs text-gray-700">
                                                    {dose.nextDueDate ? formatDate(dose.nextDueDate) : "-"}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-1 text-xs text-gray-700">
                                                    {dose.dateGiven ? formatDate(dose.dateGiven) : "-"}
                                                </td>
                                                <td className="whitespace-nowrap px-2 py-1">
                                                    <VaccineStatusBadge status={status} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default ChildCard;
