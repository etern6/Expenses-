import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavigation from "./MobileNavigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navigation - Mobile only */}
        <div className="md:hidden bg-primary-500 text-white flex items-center justify-between px-4 h-16 shadow-sm">
          <div className="flex items-center">
            <button 
              type="button" 
              className="text-white p-1 rounded-full focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <span className="material-icons">menu</span>
            </button>
            <h1 className="ml-2 text-xl font-semibold">Expense Tracker</h1>
          </div>
          <button type="button" className="p-1 rounded-full text-white focus:outline-none">
            <span className="material-icons">account_circle</span>
          </button>
        </div>

        {/* Mobile menu (sliding) */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          >
            <div 
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-500">
                <h1 className="text-xl font-semibold text-white">Expense Tracker</h1>
                <button 
                  className="ml-auto text-white"
                  onClick={toggleMobileMenu}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
              <Sidebar isMobile={true} closeMobileMenu={toggleMobileMenu} />
            </div>
          </div>
        )}

        {/* Content container */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6 pb-16 md:pb-6">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
}
