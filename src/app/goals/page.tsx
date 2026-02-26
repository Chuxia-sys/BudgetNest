'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SavingsGoal } from '@/types';
import { Target, Plus, Trash2, Loader2, TrendingUp, Calendar, CircleDollarSign } from 'lucide-react';
import { format, differenceInDays, isAfter } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { GoalsSkeleton } from '@/components/skeletons/PageSkeletons';

export default function GoalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', deadline: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₱');
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
    const [goalsRes, settingsRes] = await Promise.all([
      fetch(`/api/goals?uid=${user.uid}`),
      fetch(`/api/settings?uid=${user.uid}`)
    ]);
    const goalsData = await goalsRes.json();
    const settingsData = await settingsRes.json();
    setGoals(goalsData.goals || []);
    
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

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          title: newGoal.title,
          targetAmount: parseFloat(newGoal.targetAmount),
          deadline: newGoal.deadline,
        }),
      });

      if (!res.ok) throw new Error('Failed to add goal');

      toast({
        title: 'Success',
        description: 'Goal created successfully!',
      });

      setNewGoal({ title: '', targetAmount: '', deadline: '' });
      setIsDialogOpen(false);
      fetchGoals();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await fetch(`/api/goals?uid=${user.uid}&goalId=${goalId}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      });

      fetchGoals();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive',
      });
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return { text: 'Overdue', variant: 'destructive' as const };
    if (days === 0) return { text: 'Due today', variant: 'default' as const };
    if (days <= 7) return { text: `${days} days left`, variant: 'warning' as const };
    return { text: `${days} days left`, variant: 'default' as const };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (loading || dataLoading) {
    return <GoalsSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="container px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 md:py-8 lg:py-10 space-y-6 sm:space-y-8 md:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-bold">Savings Goals</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-2">Set and track your financial goals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto h-10">
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set a new savings goal to work towards
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ({currencySymbol}) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="1000.00"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Goal'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="text-2xl sm:text-3xl font-bold">{goals.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Total goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Target</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="text-2xl sm:text-3xl font-bold truncate">
              ₱{goals.reduce((sum, g) => sum + g.targetAmount, 0).toFixed(2)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Across all goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Saved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="text-2xl sm:text-3xl font-bold truncate">
              ₱{goals.reduce((sum, g) => sum + g.currentAmount, 0).toFixed(2)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {goals.length > 0
                ? `${((goals.reduce((sum, g) => sum + g.currentAmount, 0) / goals.reduce((sum, g) => sum + g.targetAmount, 0)) * 100).toFixed(0)}% complete`
                : 'No goals yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid gap-5 sm:gap-6 md:gap-7 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isOverdue = isAfter(new Date(), new Date(goal.deadline));

            return (
              <Card key={goal.id} className={isOverdue ? 'border-red-200 dark:border-red-900' : ''}>
                <CardHeader className="pb-4 px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg md:text-xl truncate">{goal.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-2">
                        Target: {currencySymbol}{goal.targetAmount.toFixed(2)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Progress</span>
                      <span className={percentage >= 100 ? 'text-green-600 dark:text-green-400 font-semibold' : ''}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={Math.min(percentage, 100)} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{currencySymbol}{goal.currentAmount.toFixed(2)} saved</span>
                      <span>{currencySymbol}{goal.targetAmount.toFixed(2)} goal</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Due: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {/* Days remaining */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Time remaining</span>
                    <span
                      className={`text-sm font-medium ${
                        daysRemaining.variant === 'destructive'
                          ? 'text-red-600 dark:text-red-400'
                          : daysRemaining.variant === 'warning'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {daysRemaining.text}
                    </span>
                  </div>

                  {/* Quick Add */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full text-sm sm:text-base"
                      onClick={() => {
                        const amount = prompt('Enter amount to add:');
                        if (amount && !isNaN(parseFloat(amount))) {
                          fetch('/api/goals', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              uid: user.uid,
                              goalId: goal.id,
                              currentAmount: goal.currentAmount + parseFloat(amount),
                            }),
                          }).then(() => fetchGoals());
                        }
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Savings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4 sm:px-6">
            <Target className="h-14 sm:h-16 md:h-20 w-14 sm:w-16 md:w-20 text-muted-foreground mb-4 sm:mb-6" />
            <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-center">No savings goals yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md mb-6">
              Create your first savings goal to start tracking your progress towards financial freedom.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="h-10">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
