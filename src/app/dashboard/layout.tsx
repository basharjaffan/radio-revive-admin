'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSettings } from '@/hooks/useSettings';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Radio, Users, Layers, Settings, Activity, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout, user } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const organizationName = settings?.organizationName || 'Radio Revive';

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">{organizationName}</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        
        <nav className="mt-6 flex-1">
          <Link href="/dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/dashboard/devices" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Radio className="mr-3 h-5 w-5" />
            Devices
          </Link>
          <Link href="/dashboard/groups" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Layers className="mr-3 h-5 w-5" />
            Groups
          </Link>
          <Link href="/dashboard/users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Users className="mr-3 h-5 w-5" />
            Users
          </Link>
          <Link href="/dashboard/logs" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Activity className="mr-3 h-5 w-5" />
            Activity Logs
          </Link>
          <Link href="/dashboard/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </Link>
        </nav>

        <div className="p-6 border-t">
          <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
