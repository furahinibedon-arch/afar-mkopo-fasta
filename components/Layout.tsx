'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.appName}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
              >
                {language === 'en' ? '🇰🇪 Swahili' : '🇬🇧 English'}
              </button>
              {pathname !== '/' && (
                <>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    {t.logout}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
