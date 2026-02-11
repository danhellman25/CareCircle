'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Pill,
  Calendar,
  ClipboardList,
  FileText,
  Users,
  Settings,
  Menu,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { classNames } from '@/lib/utils';

const mainNav = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Meds', href: '/dashboard/medications', icon: Pill },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Log', href: '/dashboard/care-log', icon: ClipboardList },
  { name: 'More', href: '#', icon: Menu, isMenu: true },
];

const moreNav = [
  { name: 'Appointments', href: '/dashboard/appointments', icon: FileText },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Time Tracking', href: '/dashboard/time-tracking', icon: Clock },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Only show on mobile
  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
        <div className="flex items-center justify-around px-1 py-1">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            const isMoreActive = moreNav.some(n => n.href === pathname);

            if (item.isMenu) {
              return (
                <button
                  key={item.name}
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={classNames(
                    'flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-colors min-w-[3.5rem] min-h-[44px]',
                    isMoreActive || isMoreOpen
                      ? 'text-primary'
                      : 'text-text-light hover:text-text'
                  )}
                >
                  <item.icon className={classNames('w-5 h-5', (isMoreActive || isMoreOpen) && 'text-primary')} />
                  <span className="text-[11px] font-medium">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  'flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-colors min-w-[3.5rem] min-h-[44px]',
                  isActive
                    ? 'text-primary'
                    : 'text-text-light hover:text-text'
                )}
              >
                <item.icon className={classNames('w-5 h-5', isActive && 'text-primary')} />
                <span className="text-[11px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* More menu overlay */}
      {isMoreOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="lg:hidden fixed bottom-[72px] left-4 right-4 bg-card rounded-2xl shadow-2xl border border-border z-50 p-2">
            <div className="grid grid-cols-3 gap-2">
              {moreNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={classNames(
                      'flex flex-col items-center gap-2 px-3 py-4 rounded-xl transition-colors min-h-[72px] justify-center',
                      isActive
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-text-light hover:bg-gray-50 hover:text-text'
                    )}
                  >
                    <item.icon className={classNames('w-6 h-6', isActive && 'text-primary')} />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
