import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertExpenseSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/expense-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Extend the base schema with form-specific validation
const formSchema = insertExpenseSchema.extend({
  // Ensure the amount is a string for the input, but will be converted to number
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
  // Date should be in YYYY-MM-DD format for HTML input
  date: z.string().min(1, "Date is required"),
});

// Define new type for form values with string amount
type ExpenseFormValues = z.infer<typeof formSchema>;

export default function AddExpenseForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
      notes: "",
    },
  });

  // Create mutation for adding a new expense
  const addExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseFormValues) => {
      // Convert string amount to number and prepare payload
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
      };
      
      const response = await apiRequest("POST", "/api/expenses", payload);
      return response.json();
    },
    onSuccess: () => {
      // Reset form and show success message
      form.reset({
        description: "",
        amount: "",
        category: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/by-category"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/by-month"] });
      
      toast({
        title: "Expense added successfully",
        description: "Your expense has been recorded.",
        variant: "default",
      });
      
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
      toast({
        title: "Failed to add expense",
        description: "There was an error adding your expense. Please try again.",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: ExpenseFormValues) => {
    setIsSubmitting(true);
    addExpenseMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Add New Expense</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Grocery shopping" 
                      {...field} 
                    />
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
                        placeholder="0.00" 
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

            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-primary-500 hover:bg-primary-600" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
