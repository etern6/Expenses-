import { useState } from "react";
import ExpenseList from "@/components/expenses/ExpenseList";
import AddExpenseForm from "@/components/expenses/AddExpenseForm";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Expenses() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  
  return (
    <div>
      {/* Page title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and track all your expenses</p>
        </div>
        
        <Button 
          onClick={() => setIsAddExpenseOpen(true)}
          className="bg-primary-500 hover:bg-primary-600"
        >
          <span className="material-icons mr-1 text-sm">add</span>
          Add Expense
        </Button>
      </div>
      
      {/* Expense List */}
      <ExpenseList pageSize={10} showFilters={true} showPagination={true} />
      
      {/* Mobile Add Expense Sheet */}
      <Sheet open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <SheetContent side="bottom" className="h-[85vh] sm:h-[85vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Add New Expense</SheetTitle>
          </SheetHeader>
          <AddExpenseForm />
        </SheetContent>
      </Sheet>
    </div>
  );
}
