'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHome, FiLogOut } from 'react-icons/fi';

interface DashboardHeaderProps {
  title: string;
  userName?: string;
  userRole?: string;
}

export default function DashboardHeader({ title, userName, userRole }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <FiHome className="w-6 h-6" />
              <span className="font-semibold text-lg hidden sm:block">CarWash Pro</span>
            </Link>
            <div className="hidden md:block h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-900 hidden md:block">{title}</h1>
          </div>

          {/* Right: User Info and Logout */}
          <div className="flex items-center space-x-4">
            {userName && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                {userRole && (
                  <p className="text-xs text-gray-500 capitalize">{userRole.toLowerCase()}</p>
                )}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="hidden sm:block">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
