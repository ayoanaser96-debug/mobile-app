'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleName = user?.role 
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'User';

  const navItems = [
    { href: '/dashboard/patient', label: 'Patient Dashboard', roles: ['patient'] },
    { href: '/dashboard/analyst', label: 'Analyst Dashboard', roles: ['analyst', 'admin'] },
    { href: '/dashboard/doctor', label: 'Doctor Dashboard', roles: ['doctor', 'admin'] },
    { href: '/dashboard/admin', label: 'Admin Panel', roles: ['admin'] },
    { href: '/dashboard/pharmacy', label: 'Pharmacy', roles: ['pharmacy', 'admin'] },
  ];

  const visibleNavItems = navItems.filter(
    item => item.roles.includes(user?.role || '')
  );

  const isPatientPortal = user?.role === 'patient';
  
  return (
    <div className={`min-h-screen bg-background dashboard-theme ${isPatientPortal ? 'patient-portal' : ''}`} data-portal={isPatientPortal ? 'patient' : undefined} data-dashboard="true">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <h1 className="text-xl font-bold text-foreground">Vision Clinic</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">{user?.firstName} {user?.lastName}</span>
              <span className="hidden sm:inline text-sm text-muted-foreground">({roleName})</span>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card shadow-lg border-r border-border transition-transform duration-300 ease-in-out pt-20 lg:pt-0`}
        >
          <nav className="p-4 space-y-2">
            {visibleNavItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

