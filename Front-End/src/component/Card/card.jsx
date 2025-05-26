import { Users, TrendingUp, Syringe, Baby, CalendarCheck, ShieldCheck } from "lucide-react"; // Updated icon imports for Male and Female
import React, { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { NewBornDisplayContext } from "../../contexts/NewBornContext/NewBornContext";
import { UserDisplayContext } from "../../contexts/UserContxet/UserContext";
import { VaccineDisplayContext } from "../../contexts/VaccineContext/VaccineContext";

const Card = () => {
    const { role } = useContext(AuthContext);
    const { Totalbaby, TotalMale, TotalFemale, newBorn } = useContext(NewBornDisplayContext);
    const { isTotal, isFemale, isMale } = useContext(UserDisplayContext);
    const { totalVaccine, NotExpired, expired } = useContext(VaccineDisplayContext);

    // Calculate percentages for baby
    const malePercentage = Totalbaby ? ((TotalMale / Totalbaby) * 100).toFixed(1) + "%" : "0%";
    const femalePercentage = Totalbaby ? ((TotalFemale / Totalbaby) * 100).toFixed(1) + "%" : "0%";

    // Calculate percentages
    const TotalExpired = totalVaccine ? ((expired / totalVaccine) * 100).toFixed(1) + "%" : "0%";
    const TotalNotExpired = totalVaccine ? ((NotExpired / totalVaccine) * 100).toFixed(1) + "%" : "0%";

    const now = new Date();
    const currentMonth = now.getMonth(); // 0 = January
    const currentYear = now.getFullYear();

    // I-filter lang ang mga ipinanganak ngayong buwan
    const newbornsThisMonth = newBorn.filter((nb) => {
        const dob = new Date(nb.dateOfBirth);
        return dob.getMonth() === currentMonth && dob.getFullYear() === currentYear;
    });

    // Ihiwalay ang Male at Female counts
    const maleCount = newbornsThisMonth.filter((nb) => nb.gender === "Male").length;
    const femaleCount = newbornsThisMonth.filter((nb) => nb.gender === "Female").length;

    const TotalnewbornsThisMonth = newbornsThisMonth.length;

    const TotalCurrentMale = TotalnewbornsThisMonth ? ((maleCount / TotalnewbornsThisMonth) * 100).toFixed(1) + "%" : "0%";
    const TotalCurrentFemale = TotalnewbornsThisMonth ? ((femaleCount / TotalnewbornsThisMonth) * 100).toFixed(1) + "%" : "0%";

    const maleUserPercenatge = isTotal ? ((isMale / isTotal) * 100).toFixed(1) + "%" : "0%";
    const femaleUserPercentage = isTotal ? ((isFemale / isTotal) * 100).toFixed(1) + "%" : "0%";

    const cards = [
        {
            title: "Total Births",
            value: Totalbaby,
            percentage: `${malePercentage} Male | ${femalePercentage} Female`,
            icon: Baby,
        },
        { title: "New Born", value: TotalnewbornsThisMonth, percentage: `${TotalCurrentMale} Male | ${TotalCurrentFemale} Female`, icon: Baby },
        { title: "Total Vaccine", value: totalVaccine, percentage: `${TotalExpired} Expired | ${TotalNotExpired} Not Expired`, icon: Syringe },
        {
            title: "Total User",
            value: isTotal,
            percentage: `${maleUserPercenatge} Male | ${femaleUserPercentage} Female`,
            icon: Users,
        },
    ];

    const BHWcards = [
        { title: "Total Completed Vacination", value: "15,400", percentage: "+15%", icon: Syringe },
        { title: "New Born", value: TotalnewbornsThisMonth, percentage: `${TotalCurrentMale} Male | ${TotalCurrentFemale} Female`, icon: Baby },
        { title: "Monthly Vaccinated", value: "8,300", percentage: "+10%", icon: Baby },
        { title: "Total Vaccines Available", value: "18,700", percentage: "+18%", icon: ShieldCheck },
    ];

    const renderCards = (cardList) => (
        <div className="grid grid-cols-1 gap-4 xs:px-2 sm:px-0 md:grid-cols-2 lg:grid-cols-3 lg:px-0 xl:grid-cols-4">
            {cardList.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className="card rounded-lg border bg-white p-4 shadow-md transition-all dark:bg-slate-900"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center justify-center rounded-lg bg-blue-500/20 p-3">
                                <Icon
                                    size={24}
                                    className="text-red-500 dark:text-red-400"
                                />
                            </div>
                            <p className="card-title text-lg font-medium text-slate-800 dark:text-slate-200">{card.title}</p>
                        </div>
                        <div className="card-body mt-4">
                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{card.value}</p>
                            {card.percentage && (
                                <span className="mt-2 flex items-center gap-x-2 text-sm text-red-600 dark:text-red-400">
                                    <TrendingUp size={18} />
                                    {card.percentage}
                                </span>
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
