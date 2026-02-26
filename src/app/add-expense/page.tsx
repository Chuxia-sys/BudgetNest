'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Category } from '@/types';
import { Calendar as CalendarIcon, Plus, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ExpenseFormSkeleton } from '@/components/skeletons/PageSkeletons';

export default function AddExpensePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₱');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
    const [categoriesRes, settingsRes] = await Promise.all([
      fetch(`/api/categories?uid=${user.uid}`),
      fetch(`/api/settings?uid=${user.uid}`)
    ]);
    const categoriesData = await categoriesRes.json();
    const settingsData = await settingsRes.json();
    setCategories(categoriesData.categories || []);
    
    // Set currency symbol
    const CURRENCIES: { [key: string]: string } = {
      'PHP': '₱', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
      'CAD': 'C$', 'AUD': 'A$', 'INR': '₹', 'CNY': '¥'
    };
    const userCurrency = settingsData.settings?.currency || 'PHP';
    setCurrencySymbol(CURRENCIES[userCurrency] || '₱');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!selectedCategory || !amount) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          amount: parseFloat(amount),
          category: selectedCategory,
          date: format(date, 'yyyy-MM-dd'),
          note,
        }),
      });

      if (!res.ok) throw new Error('Failed to add expense');

      toast({
        title: 'Success',
        description: 'Expense added successfully!',
      });

      // Reset form
      setAmount('');
      setNote('');
      setSelectedCategory('');
      setDate(new Date());

      // Optionally redirect to dashboard
      // router.push('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add expense. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || dataLoading) {
    return <ExpenseFormSkeleton />;
  }

  if (!user) return null;

  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <div className="container px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8 md:mb-10 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Add Expense</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-1">Record a new expense to track your spending</p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Expense Details</CardTitle>
          <CardDescription className="text-sm">Fill in the information below to add a new expense</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  {currencySymbol}
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 text-lg"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCategoryObj && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                  <span className="text-2xl">{selectedCategoryObj.icon}</span>
                  <div>
                    <p className="font-medium">{selectedCategoryObj.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Selected category
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      if (selectedDate) {
                        setDate(selectedDate);
                        setShowCalendar(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note about this expense..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Add Expense
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Add Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Quick Add</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {categories.slice(0, 4).map((category) => (
            <Button
              key={category.id}
              variant="outline"
              className="h-auto flex-col gap-2 py-3 sm:py-4 px-2"
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="text-xs sm:text-sm text-center">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
