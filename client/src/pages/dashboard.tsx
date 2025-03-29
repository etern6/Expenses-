import SummaryCards from "@/components/dashboard/SummaryCards";
import ExpenseCharts from "@/components/dashboard/ExpenseCharts";
import AddExpenseForm from "@/components/expenses/AddExpenseForm";
import ExpenseList from "@/components/expenses/ExpenseList";

export default function Dashboard() {
  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Track and manage your personal expenses</p>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Expense Charts */}
      <ExpenseCharts />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <div>
          <AddExpenseForm />
        </div>
        
        {/* Recent Expenses */}
        <div className="lg:col-span-2">
          <ExpenseList pageSize={5} showPagination={false} />
        </div>
      </div>
    </div>
  );
}
