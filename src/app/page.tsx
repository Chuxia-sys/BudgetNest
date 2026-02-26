'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Expense, Category, UserSettings } from '@/types';
import { 
  TrendingUp, 
  TrendingDown, 
  CircleDollarSign, 
  Receipt, 
  AlertTriangle,
  Plus,
  ArrowRight,
  Calendar,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardSkeleton } from '@/components/skeletons/PageSkeletons';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [thisMonthSpent, setThisMonthSpent] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState('₱');
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
    // Fetch expenses
    const expensesRes = await fetch(`/api/expenses?uid=${user.uid}`);
    const expensesData = await expensesRes.json();
    setExpenses(expensesData.expenses || []);

    // Calculate totals
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthExpenses = (expensesData.expenses || []).filter(
      (e: Expense) => e.date.startsWith(currentMonth)
    );
    
    const total = (expensesData.expenses || []).reduce((sum: number, e: Expense) => sum + e.amount, 0);
    const monthTotal = thisMonthExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);
    
    setTotalSpent(total);
    setThisMonthSpent(monthTotal);

    // Fetch categories
    const categoriesRes = await fetch(`/api/categories?uid=${user.uid}`);
    const categoriesData = await categoriesRes.json();
    setCategories(categoriesData.categories || []);

    // Fetch settings
    const settingsRes = await fetch(`/api/settings?uid=${user.uid}`);
    const settingsData = await settingsRes.json();
    setSettings(settingsData.settings);
    
    // Set currency symbol
    const CURRENCIES: { [key: string]: string } = {
      'PHP': '₱', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥',
      'CAD': 'C$', 'AUD': 'A$', 'INR': '₹', 'CNY': '¥'
    };
    const userCurrency = settingsData.settings?.currency || 'PHP';
    setCurrencySymbol(CURRENCIES[userCurrency] || '₱');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
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
  }, [user]);

  const getSpendingStatus = () => {
    if (!settings || !settings.spendingLimit) return null;
    
    const percentage = (thisMonthSpent / settings.spendingLimit) * 100;
    
    if (percentage >= 100) {
      return { type: 'danger', message: `You've exceeded your monthly budget by ${currencySymbol}${(thisMonthSpent - settings.spendingLimit).toFixed(2)}` };
    } else if (percentage >= 80) {
      return { type: 'warning', message: `You've used ${percentage.toFixed(0)}% of your monthly budget` };
    }
    return null;
  };

  const getCategoryBreakdown = () => {
    const breakdown: { [key: string]: number } = {};
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    expenses
      .filter(e => e.date.startsWith(currentMonth))
      .forEach(expense => {
        breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
      });

    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const recentExpenses = expenses.slice(0, 5);

  // Show skeleton while auth is loading or data is being fetched
  if (loading || dataLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return null;
  }

  const spendingStatus = getSpendingStatus();
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-6 sm:py-7 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-7 lg:mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold">Dashboard</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
            Welcome back! Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <Button onClick={() => router.push('/add-expense')} className="w-full sm:w-auto shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Spending Alert */}
      {spendingStatus && (
        <Alert variant={spendingStatus.type === 'danger' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span>{spendingStatus.message}.</span>
            <Button variant="link" className="h-auto p-0 text-left sm:text-center" onClick={() => router.push('/settings')}>Adjust your budget</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 md:gap-4 lg:gap-5 grid-cols-2 md:grid-cols-4 mb-5 sm:mb-6 md:mb-7 lg:mb-8">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 md:px-5 lg:px-6 pt-3 sm:pt-4 md:pt-5 lg:pt-6">
            <CardTitle className="text-xs sm:text-xs md:text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-3.5 sm:h-4 md:h-4.5 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-5 lg:px-6 pb-3 sm:pb-4 md:pb-5 lg:pb-6">
            <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">{currencySymbol}{thisMonthSpent.toFixed(2)}</div>
            <p className="text-xs sm:text-xs md:text-sm text-muted-foreground mt-1">
              {expenses.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 md:px-5 lg:px-6 pt-3 sm:pt-4 md:pt-5 lg:pt-6">
            <CardTitle className="text-xs sm:text-xs md:text-sm font-medium">Total Spent</CardTitle>
            <Wallet className="h-3.5 sm:h-4 md:h-4.5 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-5 lg:px-6 pb-3 sm:pb-4 md:pb-5 lg:pb-6">
            <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">{currencySymbol}{totalSpent.toFixed(2)}</div>
            <p className="text-xs sm:text-xs md:text-sm text-muted-foreground mt-1">
              All time
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 md:px-5 lg:px-6 pt-3 sm:pt-4 md:pt-5 lg:pt-6">
            <CardTitle className="text-xs sm:text-xs md:text-sm font-medium">Monthly Limit</CardTitle>
            <CircleDollarSign className="h-3.5 sm:h-4 md:h-4.5 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-5 lg:px-6 pb-3 sm:pb-4 md:pb-5 lg:pb-6">
            <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">
              {currencySymbol}{settings?.spendingLimit?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs sm:text-xs md:text-sm text-muted-foreground mt-1">
              {settings?.spendingLimit ? `${((thisMonthSpent / settings.spendingLimit) * 100).toFixed(0)}% used` : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 md:px-5 lg:px-6 pt-3 sm:pt-4 md:pt-5 lg:pt-6">
            <CardTitle className="text-xs sm:text-xs md:text-sm font-medium">Top Category</CardTitle>
            <Receipt className="h-3.5 sm:h-4 md:h-4.5 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-5 lg:px-6 pb-3 sm:pb-4 md:pb-5 lg:pb-6">
            <div className="text-lg sm:text-lg sm:text-xl md:text-2xl font-bold capitalize">
              {categoryBreakdown[0]?.category || 'None'}
            </div>
            <p className="text-xs sm:text-xs md:text-sm text-muted-foreground mt-1">
              {currencySymbol}{categoryBreakdown[0]?.amount.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Expenses */}
      <div className="grid gap-4 sm:gap-5 md:gap-5 lg:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">Spending by Category</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your top spending categories this month</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {categoryBreakdown.map(({ category, amount }) => {
                  const cat = categories.find(c => c.id === category || c.name.toLowerCase() === category.toLowerCase());
                  const percentage = (amount / thisMonthSpent) * 100;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl md:text-2xl">{cat?.icon || '📦'}</span>
                          <span className="font-medium capitalize text-sm sm:text-sm md:text-base">{category}</span>
                        </div>
                        <span className="font-semibold text-sm sm:text-sm md:text-base">{currencySymbol}{amount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 sm:h-2 md:h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: cat?.color || '#6b7280',
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of monthly spending</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No expenses this month yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
            <CardTitle className="text-base sm:text-lg md:text-xl">Recent Expenses</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            {recentExpenses.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentExpenses.map((expense) => {
                  const cat = categories.find(c => c.id === expense.category || c.name.toLowerCase() === expense.category.toLowerCase());
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-2 sm:p-3 md:p-4 lg:p-5 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/reports`)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                        <div
                          className="flex h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full text-base sm:text-lg md:text-xl lg:text-2xl flex-shrink-0"
                          style={{ backgroundColor: cat?.color + '20' }}
                        >
                          {cat?.icon || '📦'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium capitalize text-xs sm:text-sm md:text-base truncate">{cat?.name || expense.category}</p>
                          <p className="text-xs sm:text-xs md:text-sm text-muted-foreground">
                            {format(new Date(expense.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="font-semibold text-red-500 text-xs sm:text-sm md:text-base">-{currencySymbol}{expense.amount.toFixed(2)}</p>
                        {expense.note && (
                          <p className="text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-[100px] md:max-w-[120px] hidden sm:block">
                            {expense.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/reports')}
                >
                  View All Expenses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No expenses yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => router.push('/add-expense')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Expense
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
