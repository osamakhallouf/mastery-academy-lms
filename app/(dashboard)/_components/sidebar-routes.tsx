"use client";

import { BarChart, Compass, FileText, Layout, List } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./sidebar-item";

//import { list } from "postcss";

const guestRoutes = [
    {
        icon: Layout, 
        label: "Dashboard",
        href:"/dashboard",
    },
    {
        icon: Compass, 
        label: "Browse",
        href:"/search",
    },
];
const teacherRoutes=[
    {
        icon: List, 
        label: "Courses",
        href:"/teacher/courses",
    },
    {
        icon: FileText,
        label: "Corporate Inquiries",
        href: "/teacher/corporate-inquiries",
    },
    {
        icon: BarChart, 
        label: "Analytics",
        href:"/teacher/analytics",
    },
]


export const SidebarRoutes = () => {
const pathname =usePathname();
const isTeacherPage =pathname?.includes("/teacher");

    const routes = isTeacherPage ? teacherRoutes : guestRoutes;
    return (
        <div className="flex flex-col w-full">
            {routes.map((route) => (
                <SidebarItem
                    key={route.href}
                    icon={route.icon}
                    label={route.label}
                    href={route.href}    
                />
            ))}
        </div>
    );
};