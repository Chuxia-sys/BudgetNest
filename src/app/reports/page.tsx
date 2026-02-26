'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Expense, Category } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Trash2, Calendar, TrendingUp, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#6b7280'];

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [viewMode, setViewMode] = useState<'category' | 'daily' | 'trend'>('category');
  const [currencySymbol, setCurrencySymbol] = useState('₱');

  const fetchData = async () => {
    if (!user) return;

    const [expensesRes, categoriesRes, settingsRes] = await Promise.all([
      fetch(`/api/expenses?uid=${user.uid}`),
      fetch(`/api/categories?uid=${user.uid}`),
      fetch(`/api/settings?uid=${user.uid}`)
    ]);

    const expensesData = await expensesRes.json();
    const categoriesData = await categoriesRes.json();
    const settingsData = await settingsRes.json();

    setExpenses(expensesData.expenses || []);
    setCategories(categoriesData.categories || []);
    
    // Set currency symbol
    const CURRENCIES: { [key: string]: string } = {
      'PHP': '₱', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
      'CAD': 'C$', 'AUD': 'A$', 'INR': '₹', 'CNY': '¥'
    };
    const userCurrency = settingsData.settings?.currency || 'PHP';
    setCurrencySymbol(CURRENCIES[userCurrency] || '₱');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedMonth]);

  const deleteExpense = async (expenseId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await fetch(`/api/expenses/${expenseId}?uid=${user.uid}`, {
        method: 'DELETE',
      });
      
      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
    }
  };

  // Get filtered expenses for selected month
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalEntries = monthlyExpenses.length;

  // Category breakdown data
  const categoryData = categories.map(cat => {
    const catTotal = monthlyExpenses
      .filter(e => e.category === cat.id || e.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      name: cat.name,
      value: catTotal,
      icon: cat.icon,
      color: cat.color,
    };
  }).filter(d => d.value > 0);

  // Daily expenses data
  const dailyData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dayStr = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
    const dayTotal = monthlyExpenses
      .filter(e => e.date === dayStr)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      day: `Day ${day}`,
      amount: dayTotal,
    };
  }).filter(d => d.amount > 0);

  // Monthly trend data (last 6 months)
  const monthlyTrendData = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  }).map(date => {
    const monthStr = format(date, 'yyyy-MM');
    const monthTotal = expenses
      .filter(e => e.date.startsWith(monthStr))
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      month: format(date, 'MMM'),
      amount: monthTotal,
    };
  });

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Category', 'Amount', 'Note'],
      ...monthlyExpenses.map(e => {
        const cat = categories.find(c => c.id === e.category || c.name.toLowerCase() === e.category.toLowerCase());
        return [
          e.date,
          cat?.name || e.category,
          e.amount.toFixed(2),
          e.note || '',
        ];
      }),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your spending patterns and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {eachMonthOfInterval({
                start: subMonths(new Date(), 11),
                end: new Date(),
              }).reverse().map(date => (
                <SelectItem key={format(date, 'yyyy-MM')} value={format(date, 'yyyy-MM')}>
                  {format(date, 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencySymbol}{totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalEntries} transactions this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {categoryData[0]?.name || 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currencySymbol}{categoryData[0]?.value.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencySymbol}{totalEntries > 0 ? (totalSpent / totalEntries).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <CardTitle>Spending Visualization</CardTitle>
              <CardDescription>Visual breakdown of your expenses</CardDescription>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end gap-2">
              <Badge
                variant={viewMode === 'category' ? 'default' : 'outline'}
                className="cursor-pointer text-xs sm:text-sm"
                onClick={() => setViewMode('category')}
              >
                By Category
              </Badge>
              <Badge
                variant={viewMode === 'daily' ? 'default' : 'outline'}
                className="cursor-pointer text-xs sm:text-sm"
                onClick={() => setViewMode('daily')}
              >
                Daily
              </Badge>
              <Badge
                variant={viewMode === 'trend' ? 'default' : 'outline'}
                className="cursor-pointer text-xs sm:text-sm"
                onClick={() => setViewMode('trend')}
              >
                Trend
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px]">
            {viewMode === 'category' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₱${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {viewMode === 'daily' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₱${value.toFixed(2)}`} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {viewMode === 'trend' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₱${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense History */}
      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>
            All transactions for {format(new Date(selectedMonth), 'MMMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyExpenses.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {monthlyExpenses.map((expense) => {
                const cat = categories.find(c => c.id === expense.category || c.name.toLowerCase() === expense.category.toLowerCase());
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <div
                        className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full text-lg sm:text-xl flex-shrink-0"
                        style={{ backgroundColor: cat?.color + '20' }}
                      >
                        {cat?.icon || '📦'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium capitalize text-sm sm:text-base truncate">{cat?.name || expense.category}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                          {expense.note && ` • ${expense.note}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 ml-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-red-500 text-sm sm:text-base">-{currencySymbol}{expense.amount.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExpense(expense.id)}
                        className="text-muted-foreground hover:text-destructive h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No expenses this month</p>
              <p className="text-sm mt-1">Add your first expense to start tracking</p>
              <Button className="mt-4" onClick={() => router.push('/add-expense')}>
                Add Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
