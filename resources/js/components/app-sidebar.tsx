import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';
import { 
    Gauge, // Dashboard
    ActivitySquare, // Log Activity
    Users2, // Users Management
    KeyRound, // Roles
    LockKeyhole, // Permissions
    UserCog, // User
    BusFront, // Travel Management
    CalendarCheck2, // Bookings management
    CalendarClock, // Schedule Management
    BarChart3, // Rekapitulasi
} from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Beranda',
        href: '/dashboard',
        icon: Gauge,
    },
    {
        title: 'Rekapitulasi',
        href: '/dashboard/rekapitulasi',
        icon: BarChart3,
    },
    {
        title: 'Manajemen Pengguna',
        href: '',
        icon: Users2,
        children: [
            {
                title: 'Peran',
                href: route('roles.index'),
                icon: KeyRound,
            },
            {
                title: 'Hak Akses',
                href: route('permissions.index'),
                icon: LockKeyhole,
            },
            {
                title: 'Pengguna',
                href: route('users.index'),
                icon: UserCog,
            },
        ],
    },
    {
        title: 'Manajemen Armada',
        href: route('vehicles.index'),
        icon: BusFront,
    },
    {
        title: 'Manajemen Booking',
        href: route('bookings.index'),
        icon: CalendarCheck2,
    },
    {
        title: 'Manajemen Jadwal',
        href: route('schedules.index'),
        icon: CalendarClock,
    }
];

const footerNavItems: NavItem[] = [

];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
