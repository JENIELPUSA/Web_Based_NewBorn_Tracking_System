import { ChartColumn, Home, NotepadText, KeyRound,ShieldCheck, Syringe, UserPlus, Baby,CalendarDays } from "lucide-react";

import ProfileImage from "@/assets/profile-image.jpg";
import ProductImage from "@/assets/product-image.jpg";

export const navbarLinks = [
    {
        title: "Dashboard",
        links: [
            {
                label: "Dashboard",
                icon: Home,
                path: "/dashboard",
            },
            {
                label: "Calendar",
                icon: CalendarDays,
                path: "/dashboard/calendar",
            },
            {
                label: "Reports",
                icon: NotepadText,
                path: "/dashboard/reports",
            },
        ],
    },
    {
        title: "Management",
        links: [
            {
                label: "User",
                icon: UserPlus,
               path: "/dashboard/add-user",
            },
            {
                 label: "New Born",
                icon: Baby,
                path: "/dashboard/new-born",
            },
            {
                label: "Vaccine Inventory",
                icon: ShieldCheck,
                 path: "/dashboard/new-vaccine",
            },
             {
                label: "Assign Vaccine",
                icon: Syringe,
                 path: "/dashboard/new-record-vaccine",
            },
        ],
    },
       {
        title: "Settings",
        links: [
            {
                label: "ForgotPassword",
                icon: KeyRound,
               path: "/",
            },
        ],
    },
];




