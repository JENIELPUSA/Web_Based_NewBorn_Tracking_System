import { forwardRef } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { cn } from "@/utils/cn";
import { useAuth } from "../contexts/AuthContext";
import { navbarLinks } from "@/constants";

export const Sidebar = forwardRef(({ collapsed }, ref) => {
  const { role } = useAuth();

  if (!role) return null;

  // Define allowed paths for each role
  const rolePermissions = {
    BHW: [
      "/dashboard",
      "/dashboard/calendar",
      "/dashboard/reports",
      "/dashboard/new-born",
      "/dashboard/new-record-vaccine",
      "/login"
    ],
    Guest:[
      "/dashboard/calendar",
      "/dashboard/new-record-vaccine",
      "/login"
    ],
    Admin: [], // Empty array means all links are allowed
  };

  // Filter navbar links based on role
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

  return (
    <aside
      ref={ref}
      className={cn(
        "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white transition-all dark:border-slate-700 dark:bg-slate-900",
        collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
        collapsed ? "max-md:-left-full" : "max-md:left-0"
      )}
    >
      <div className="flex gap-x-3 p-3">
        {!collapsed && (
          <p className="text-lg font-medium text-slate-900 dark:text-slate-50">
            NEWBORN TRACKING SYSTEM
          </p>
        )}
      </div>
      <div className="flex w-full flex-col gap-y-4 overflow-y-auto p-3 [scrollbar-width:_thin]">
        {filteredNavbarLinks.map((navbarLink) => (
          <nav
            key={navbarLink.title}
            className={cn("sidebar-group", collapsed && "md:items-center")}
          >
            {navbarLink.title !== "#" && (
              <p className={cn("sidebar-group-title", collapsed && "md:w-[45px]")}>
                {navbarLink.title}
              </p>
            )}
            {navbarLink.links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "sidebar-item",
                    collapsed && "md:w-[45px]",
                    "hover:bg-slate-100 hover:dark:bg-slate-800", // Hover state
                    isActive
                      ? "bg-red-500 dark:bg-red-500 text-white" // Active state (orange)
                      : "text-slate-700 dark:text-slate-300" // Normal state
                  )
                }
              >
                <link.icon size={22} className="flex-shrink-0" />
                {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
              </NavLink>
            ))}
          </nav>
        ))}
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
  collapsed: PropTypes.bool,
};
