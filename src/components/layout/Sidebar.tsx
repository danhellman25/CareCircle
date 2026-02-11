'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Pill,
  Calendar,
  FileText,
  Users,
  Settings,
  ClipboardList,
  Menu,
  X,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { classNames } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { currentUser, careCircle } from '@/lib/demo-data';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Medications', href: '/dashboard/medications', icon: Pill },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Care Log', href: '/dashboard/care-log', icon: ClipboardList },
  { name: 'Appointments', href: '/dashboard/appointments', icon: FileText },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Time Tracking', href: '/dashboard/time-tracking', icon: Clock },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CC</span>
          </div>
          <span className="font-semibold text-text">{careCircle.name}</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/20" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-card border-b border-border p-4 shadow-lg">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={classNames(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-text-light hover:bg-gray-50 hover:text-text'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0">
        {/* Logo */}
        <div className="p-5 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-white font-bold">CC</span>
            </div>
            <div>
              <h1 className="font-semibold text-text">{careCircle.name}</h1>
              <p className="text-xs text-text-light">Care Circle</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-light text-primary-dark shadow-sm'
                    : 'text-text-light hover:bg-gray-50 hover:text-text'
                )}
              >
                <item.icon className={classNames('w-5 h-5', isActive && 'text-primary')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar src={currentUser.avatar_url} name={currentUser.full_name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{currentUser.full_name}</p>
              <p className="text-xs text-text-light truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
