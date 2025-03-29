import { useLocation, Link } from "wouter";

export default function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-10">
      <div className="grid grid-cols-4 h-16">
        <Link href="/">
          <a className={`flex flex-col items-center justify-center ${
            isActive("/") ? "text-primary-500" : "text-gray-500"
          }`}>
            <span className="material-icons text-xl">dashboard</span>
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/expenses">
          <a className={`flex flex-col items-center justify-center ${
            isActive("/expenses") ? "text-primary-500" : "text-gray-500"
          }`}>
            <span className="material-icons text-xl">receipt_long</span>
            <span className="text-xs mt-1">Expenses</span>
          </a>
        </Link>
        <Link href="/reports">
          <a className={`flex flex-col items-center justify-center ${
            isActive("/reports") ? "text-primary-500" : "text-gray-500"
          }`}>
            <span className="material-icons text-xl">bar_chart</span>
            <span className="text-xs mt-1">Reports</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className={`flex flex-col items-center justify-center ${
            isActive("/settings") ? "text-primary-500" : "text-gray-500"
          }`}>
            <span className="material-icons text-xl">settings</span>
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
