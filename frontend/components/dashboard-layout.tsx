'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X, Eye } from 'lucide-react';
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
      <header className="glass border-b border-border shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-accent/50"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Vision Clinic</h1>
                <p className="text-xs text-muted-foreground">Smart Eye Care</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-foreground">
              <User className="h-5 w-5 text-primary" />
              <div>
                <span className="hidden sm:inline font-semibold">{user?.firstName} {user?.lastName}</span>
                <span className="hidden sm:inline text-xs text-muted-foreground block">({roleName})</span>
              </div>
            </div>
            <Button variant="outline" className="btn-modern" onClick={handleLogout}>
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
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 sidebar-modern shadow-xl transition-transform duration-300 ease-in-out pt-20 lg:pt-4`}
        >
          <nav className="p-4 space-y-2">
            {visibleNavItems.map((item, index) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start btn-modern hover:bg-accent/50 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
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

