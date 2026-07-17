'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Sun,
  HardHat,
  Home,
  Building2,
  LayoutDashboard,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const ROLE_NAV: Record<Role, NavItem[]> = {
  worker: [{ href: '/dashboard/worker', label: 'Dashboard', icon: LayoutDashboard }],
  homeowner: [
    { href: '/dashboard/homeowner', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/homeowner/search', label: 'Find Workers', icon: Home },
  ],
  organisation: [
    { href: '/dashboard/organisation', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/organisation/jobs', label: 'Post Job', icon: Building2 },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  worker: 'Worker',
  homeowner: 'Homeowner',
  organisation: 'Organisation',
};

export function AppHeader() {
  const { profile, role, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [unread, setUnread] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!profile?.id) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const load = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('read', false);
      setUnread(count ?? 0);
    };
    load();
    channel = supabase
      .channel('notifications-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    router.push('/');
  };

  const nav = role ? ROLE_NAV[role] : [];
  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass-strong border-b border-border/40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href={role ? `/dashboard/${role}` : '/'} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-glow">
              <HardHat className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight">
              DIRECT
            </span>
            {role && (
              <Badge variant="secondary" className="ml-1 hidden sm:inline-flex">
                {ROLE_LABEL[role]}
              </Badge>
            )}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {profile && (
              <Link href="/notifications">
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
                      {profile.full_name || profile.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {profile.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white">
                    Get started
                  </Button>
                </Link>
              </div>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetClose asChild>
                  <Link href={role ? `/dashboard/${role}` : '/'} className="flex items-center gap-2 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
                      <HardHat className="h-5 w-5" />
                    </div>
                    <span className="font-display text-xl font-extrabold">DIRECT</span>
                  </Link>
                </SheetClose>
                <nav className="mt-4 flex flex-col gap-1">
                  {nav.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                  {!profile && (
                    <>
                      <SheetClose asChild>
                        <Link href="/auth/signin" className="mt-2">
                          <Button variant="outline" className="w-full">Sign in</Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/auth/signup" className="mt-2">
                          <Button className="w-full bg-gradient-to-r from-primary to-accent text-white">Get started</Button>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                  {profile && (
                    <Button
                      variant="outline"
                      className="mt-4 text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export { AnimatePresence, motion };
