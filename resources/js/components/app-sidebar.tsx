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
} from 'lucide-react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Gauge,
    },
    {
        title: 'Log Activity',
        href: route('activity-log.index'),
        icon: ActivitySquare,
    },
    {
        title: 'Users Management',
        href: '',
        icon: Users2,
        children: [
            {
                title: 'Roles',
                href: route('roles.index'),
                icon: KeyRound,
            },
            {
                title: 'Permissions',
                href: route('permissions.index'),
                icon: LockKeyhole,
            },
            {
                title: 'User',
                href: route('users.index'),
                icon: UserCog,
            },
        ],
    },
    {
        title: 'Travel Management',
        href: route('vehicles.index'),
        icon: BusFront,
    },
    {
        title: 'Bookings management',
        href: route('bookings.index'),
        icon: CalendarCheck2,
    },
    {
        title: 'Schedule Management',
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
