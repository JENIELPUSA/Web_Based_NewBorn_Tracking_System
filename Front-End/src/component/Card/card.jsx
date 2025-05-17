import { Users, TrendingUp } from "lucide-react";
import React from "react";

const Card = () => {
  const cards = [
    { title: "Total Newborns", value: "15,400k", percentage: "15%" },
    { title: "Average Birth Weight", value: "3.2 kg", percentage: "2%" },
    { title: "Newborns Discharged", value: "8,300k", percentage: "10%" },
    { title: "Total Births", value: "18,700k", percentage: "18%" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card, index) => (
        <div key={index} className="card bg-white dark:bg-slate-900 border rounded-lg shadow-md p-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center p-3 bg-blue-500/20 rounded-lg">
              <Users size={24} className="text-red-500 dark:text-red-400" />
            </div>
            <p className="card-title font-medium text-lg text-slate-800 dark:text-slate-200">{card.title}</p>
          </div>
          <div className="card-body mt-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {card.value}
            </p>
            <span className="flex items-center mt-2 gap-x-2 text-sm text-red-600 dark:text-red-400">
              <TrendingUp size={18} />
              {card.percentage}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Card;
