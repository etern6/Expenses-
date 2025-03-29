import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Expense, updateExpenseSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/expense-categories";

// Extend the base schema with form-specific validation
const formSchema = updateExpenseSchema.extend({
  // Ensure the amount is a string for the input, but will be converted to number
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
  // Date should be in YYYY-MM-DD format for HTML input
  date: z.string().min(1, "Date is required"),
});

// Define new type for form values with string amount
type ExpenseFormValues = Omit<z.infer<typeof formSchema>, 'amount'> & { amount: string };

interface EditExpenseDialogProps {
  expense: Expense;
  isOpen: boolean;
  isDeleteDialogOpen: boolean;
  onClose: () => void;
  onDeleteDialogClose: () => void;
}

export default function EditExpenseDialog({
  expense,
  isOpen,
  isDeleteDialogOpen,
  onClose,
  onDeleteDialogClose
}: EditExpenseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format expense data for the form
  const defaultValues: ExpenseFormValues = {
    id: expense.id,
    description: expense.description,
    amount: String(expense.amount),
    category: expense.category as string,
    date: new Date(expense.date).toISOString().slice(0, 10), // Convert to YYYY-MM-DD
    notes: expense.notes || "",
  };

  // Initialize form with expense data
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Create mutation for updating an expense
  const updateExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      // Convert string amount to number and prepare payload
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
      };
      
      const response = await apiRequest("PUT", `/api/expenses/${data.id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Expense updated",
        description: "Your expense has been updated successfully.",
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/by-category"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/by-month"] });
      
      setIsSubmitting(false);
      onClose();
    },
    onError: (error) => {
      console.error("Error updating expense:", error);
      toast({
        title: "Failed to update expense",
        description: "There was an error updating your expense. Please try again.",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    },
  });

  // Create mutation for deleting an expense
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`, undefined);
    },
    onSuccess: () => {
      // Show success message
      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully.",
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/by-category"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/by-month"] });
      
      setIsDeleting(false);
      onDeleteDialogClose();
      onClose();
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast({
        title: "Failed to delete expense",
        description: "There was an error deleting your expense. Please try again.",
        variant: "destructive",
      });
      
      setIsDeleting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: ExpenseFormValues) => {
    setIsSubmitting(true);
    updateExpenseMutation.mutate(data);
  };

  // Handle expense deletion
  const handleDelete = () => {
    setIsDeleting(true);
    deleteExpenseMutation.mutate(expense.id);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Make changes to your expense here.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <Input 
                          type="text"
                          className="pl-7 pr-12" 
                          {...field} 
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">USD</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional details" 
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:justify-between">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => onDeleteDialogClose()}
                  className="mr-auto"
                >
                  Delete
                </Button>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
