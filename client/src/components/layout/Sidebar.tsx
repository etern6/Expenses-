import { Link, useLocation } from "wouter";

interface SidebarProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

export default function Sidebar({ isMobile, closeMobileMenu }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const handleClick = () => {
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  const sidebarClass = isMobile
    ? "flex-grow flex flex-col overflow-y-auto"
    : "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0";

  return (
    <div className={sidebarClass}>
      {!isMobile && (
        <div className="flex flex-col flex-grow bg-white shadow-lg overflow-y-auto">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-500">
            <h1 className="text-xl font-semibold text-white">Expense Tracker</h1>
          </div>
          <NavItems isActive={isActive} onClick={handleClick} />
        </div>
      )}
      {isMobile && <NavItems isActive={isActive} onClick={handleClick} />}
    </div>
  );
}

interface NavItemsProps {
  isActive: (path: string) => boolean;
  onClick: () => void;
}

function NavItems({ isActive, onClick }: NavItemsProps) {
  return (
    <div className="flex-grow flex flex-col">
      <nav className="flex-1 px-2 py-4 space-y-1">
        <Link href="/">
          <a
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive("/")
                ? "text-primary-500 bg-primary-50"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={onClick}
          >
            <span className={`material-icons mr-3 ${isActive("/") ? "text-primary-500" : "text-gray-400"}`}>
              dashboard
            </span>
            Dashboard
          </a>
        </Link>
        <Link href="/expenses">
          <a
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive("/expenses")
                ? "text-primary-500 bg-primary-50"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={onClick}
          >
            <span className={`material-icons mr-3 ${isActive("/expenses") ? "text-primary-500" : "text-gray-400"}`}>
              receipt_long
            </span>
            Expenses
          </a>
        </Link>
        <Link href="/reports">
          <a
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              isActive("/reports")
                ? "text-primary-500 bg-primary-50"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={onClick}
          >
            <span className={`material-icons mr-3 ${isActive("/reports") ? "text-primary-500" : "text-gray-400"}`}>
              bar_chart
            </span>
            Reports
          </a>
        </Link>
        <Link href="/settings">
          <div
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md cursor-pointer ${
              isActive("/settings")
                ? "text-primary-500 bg-primary-50"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={onClick}
          >
            <span className={`material-icons mr-3 ${isActive("/settings") ? "text-primary-500" : "text-gray-400"}`}>
              settings
            </span>
            Settings
          </div>
        </Link>
      </nav>
    </div>
  );
}
