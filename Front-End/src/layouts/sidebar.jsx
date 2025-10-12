import { forwardRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";
import { useAuth } from "../contexts/AuthContext";
import { navbarLinks } from "@/constants";
import { LogOut } from "lucide-react"; // Import the logout icon
import Logo from "../assets/Login.png";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
    const { role, logout } = useAuth(); // Get role and logout from context
    const navigate = useNavigate();
    const [activeLink, setActiveLink] = useState(null); // State to track active link

    if (!role) return null; // Define allowed paths for each role

    const rolePermissions = {
        BHW: [
            "/dashboard",
            "/dashboard/calendar",
            "/dashboard/new-born",
            "/dashboard/new-record-vaccine",
            "/login",
            "/dashboard/forgot-password",
            "/dashboard/add-parent",
            "/dashboard/new-vaccine",
            "/dashboard/update-password",
        ],
        Admin: [],
    };
    const filteredNavbarLinks = navbarLinks
        .map((group) => ({
            ...group,
            links: group.links.filter((link) => {
                if (rolePermissions[role]) {
                    if (rolePermissions[role].length === 0) return true;
                    return rolePermissions[role].includes(link.path);
                }
                return true;
            }),
        }))
        .filter((group) => group.links.length > 0);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white transition-all",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
                       
            <div className="flex flex-col items-center justify-center border-b border-slate-200 p-2">
                <img
                    src={Logo}
                    alt="Neocare Logo"
                    className={cn("mb-2 h-[100px] w-[100px] object-contain transition-all duration-300", collapsed && "mx-auto")}
                />
                {!collapsed && <p className="text-center text-lg font-semibold tracking-wide text-blue-500">NeoCare System</p>}
            </div>
                       
            <div className="flex w-full flex-col gap-y-4 overflow-y-auto p-3 [scrollbar-width:_thin]">
                               
                {filteredNavbarLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                                               
                        {navbarLink.title !== "#" && <p className={cn("sidebar-group-title", collapsed && "md:w-[45px]")}>{navbarLink.title}</p>}     
                                         
                        {navbarLink.links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setActiveLink(link.path)} // Set active link on click
                                className={({ isActive }) =>
                                    cn(
                                        "sidebar-item",
                                        collapsed && "md:w-[45px]",
                                        "hover:bg-slate-100", // Hover state
                                        isActive // Check if link is active
                                            ? "bg-blue-500 text-white" // Active state
                                            : "text-slate-700", // Normal state
                                    )
                                }
                                end // Add this prop for exact matching
                            >
                                                               
                                <link.icon
                                    size={22}
                                    className="flex-shrink-0"
                                />
                                                                {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}                     
                                     
                            </NavLink>
                        ))}
                                           
                    </nav>
                ))}
                                {/* Logout Button */}               
                <button
                    onClick={handleLogout}
                    className={cn("sidebar-item mt-auto", collapsed && "md:w-[45px]", "hover:bg-blue-400", "text-slate-700")}
                >
                                       
                    <LogOut
                        size={22}
                        className="flex-shrink-0"
                    />
                                        {!collapsed && <p className="whitespace-nowrap">Logout</p>}               
                </button>
                           
            </div>
                   
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
};
