// Import from Lucide (existing)
import { Users, TrendingUp, Syringe, Baby, ShieldCheck } from "lucide-react";

// Import Male/Female icons from react-icons (FontAwesome)
import { FaMale, FaFemale } from "react-icons/fa";

import React, { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";
import { VaccineRecordDisplayContext } from "../../contexts/VaccineRecordCxt/VaccineRecordContext";

const Card = () => {
    const { role } = useContext(AuthContext);
    const { isTotalVacinated, isMaleVacinated, isFemaleVacinated } = useContext(VaccineRecordDisplayContext);
    const { Totalbaby, TotalMale, TotalFemale, newBorn } = useContext(NewBornDisplayContext);
    const { isTotal, isFemale, isMale } = useContext(UserDisplayContext);
    const { totalVaccine, NotExpired, expired, stocks } = useContext(VaccineDisplayContext);

    const malePercentage = Totalbaby ? ((TotalMale / Totalbaby) * 100).toFixed(1) + "%" : "0%";
    const femalePercentage = Totalbaby ? ((TotalFemale / Totalbaby) * 100).toFixed(1) + "%" : "0%";

    const TotalExpired = stocks ? ((expired / stocks) * 100).toFixed(1) + "%" : "0%";
    const TotalNotExpired = stocks ? ((NotExpired / stocks) * 100).toFixed(1) + "%" : "0%";

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const newbornsThisMonth = newBorn.filter((nb) => {
        const dob = new Date(nb.dateOfBirth);
        return dob.getMonth() === currentMonth && dob.getFullYear() === currentYear;
    });

    const maleCount = newbornsThisMonth.filter((nb) => nb.gender === "Male").length;
    const femaleCount = newbornsThisMonth.filter((nb) => nb.gender === "Female").length;
    const TotalnewbornsThisMonth = newbornsThisMonth.length;

    const AllMale = isTotalVacinated ? ((isMaleVacinated / isTotalVacinated) * 100).toFixed(1) + "%" : "0%";
    const AllFemale = isTotalVacinated ? ((isFemaleVacinated / isTotalVacinated) * 100).toFixed(1) + "%" : "0%";

    const TotalCurrentMale = TotalnewbornsThisMonth ? ((maleCount / TotalnewbornsThisMonth) * 100).toFixed(1) + "%" : "0%";
    const TotalCurrentFemale = TotalnewbornsThisMonth ? ((femaleCount / TotalnewbornsThisMonth) * 100).toFixed(1) + "%" : "0%";

    const maleUserPercenatge = isTotal ? ((isMale / isTotal) * 100).toFixed(1) + "%" : "0%";
    const femaleUserPercentage = isTotal ? ((isFemale / isTotal) * 100).toFixed(1) + "%" : "0%";

    const cards = [
        {
            title: "Total Births",
            value: Totalbaby,
            percentage: `${malePercentage} Male | ${femalePercentage} Female`,
            icon: Users,
        },
        {
            title: "Total Male",
            value: TotalMale,
            percentage: malePercentage,
            icon: FaMale,
        },
        {
            title: "Total Female",
            value: TotalFemale,
            percentage: femalePercentage,
            icon: FaFemale,
        },
        {
            title: "Total User",
            value: isTotal,
            percentage: `${maleUserPercenatge} Male | ${femaleUserPercentage} Female`,
            icon: Users,
        },
    ];

    const BHWcards = [
        {
            title: "Total Vaccine",
            value: totalVaccine,
            percentage: `${TotalExpired} Expired | ${TotalNotExpired} Not Expired`,
            icon: Syringe,
        },
        {
            title: "Total Male",
            value: TotalMale,
            percentage: malePercentage,
            icon: FaMale, 
        },
        {
            title: "Total Female",
            value: TotalFemale,
            percentage: femalePercentage,
            icon: FaFemale, 
        },
        {
            title: "Monthly Vaccinated",
            value: isTotalVacinated,
            percentage: `${AllMale} Male | ${AllFemale} Female`,
            icon: Syringe, // or keep Baby, but Syringe makes more sense
        }
    ];

    const renderCards = (cardList) => (
        <div className="grid grid-cols-1 gap-6 xs:px-2 sm:grid-cols-2 lg:grid-cols-4">
            {cardList.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="relative">
                            {/* Icon and Title Row */}
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center justify-center rounded-xl bg-[#93A87E] p-3 shadow-md transition-transform duration-300 group-hover:scale-110">
                                    {typeof Icon === "function" ? (
                                        <Icon className="text-2xl text-white" />
                                    ) : (
                                        <Icon
                                            size={24}
                                            className="text-white"
                                        />
                                    )}
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{card.title}</p>
                                </div>
                            </div>

                            {/* Value */}
                            <div className="mb-3">
                                <p className="text-4xl font-bold tracking-tight text-slate-900">{card.value}</p>
                            </div>

                            {/* Percentage Info */}
                            {card.percentage && (
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="flex items-center justify-center rounded-full bg-[#93A87E] p-1">
                                        <TrendingUp
                                            size={14}
                                            className="text-white"
                                        />
                                    </div>
                                    <span className="font-medium text-[#93A87E]">{card.percentage}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return role === "Admin" ? renderCards(cards) : role === "BHW" ? renderCards(BHWcards) : null;
};

export default Card;
