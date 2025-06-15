import { CircleUserRound, Home, NotepadText, KeyRound,ShieldCheck, Syringe, UserPlus, Baby,CalendarDays,FilePlus2  } from "lucide-react";

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
                path: "/dashboard/PDF-Report",
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
                label: "Parent",
                icon: UserPlus,
               path: "/dashboard/add-parent",
            },
              {
                label: "Register Brand",
                icon: FilePlus2 ,
               path: "/dashboard/brand",
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
                label: "Vaccination Records",
                icon: Syringe,
                 path: "/dashboard/new-record-vaccine",
            },
            {
                label: "Profilling",
                icon: CircleUserRound,
                 path: "/dashboard/Profilling_Dash",
            },
        ],
    },
       {
        title: "Settings",
        links: [
            {
                label: "Change Password",
                icon: KeyRound,
                path: "/dashboard/update-password",
            },
        ],
    },
];




