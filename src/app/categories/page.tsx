'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { CategoriesSkeleton } from '@/components/skeletons/PageSkeletons';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#84cc16', '#14b8a6', '#0ea5e9', '#8b5cf6'
];

const PRESET_ICONS = ['📦', '💰', '🎯', '⭐', '🏠', '🚗', '🍔', '🛒', '💳', '🎮', '💊', '📚', '🎵', '✈️', '🎁', '🔧', '💡', '📱', '⚡', '🎨'];

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#6b7280', icon: '📦' });

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/categories?uid=${user.uid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load categories');
      }

      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            categoryId: editingCategory.id,
            ...formData,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update category');
        }

        toast({
          title: 'Success',
          description: 'Category updated successfully',
        });
      } else {
        // Add new category
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            ...formData,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add category');
        }

        toast({
          title: 'Success',
          description: 'Category added successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      await fetchCategories();
    } catch (error: any) {
      console.error('Category save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save category',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories?uid=${user.uid}&categoryId=${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });

      fetchCategories();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({ name: '', color: '#6b7280', icon: '📦' });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', color: '#6b7280', icon: '📦' });
  };

  const isDefaultCategory = (categoryId: string) => {
    return ['crypto', 'load', 'allowance', 'food', 'gas', 'parcel'].includes(categoryId);
  };

  // Show skeleton while loading
  if (loading) {
    return <CategoriesSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to manage categories.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Manage Categories</h1>
          <p className="text-muted-foreground mt-2">
            Add, edit, and manage your expense categories
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  {!loading && `Total: ${categories.length} categories`}
                  {loading && 'Loading your categories...'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCategories()}
                  disabled={loading}
                  title="Refresh categories"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCategory ? 'Update your category details' : 'Create a new expense category'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Category Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Groceries"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  formData.color === color ? 'border-primary scale-110' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <div className="flex flex-wrap gap-2">
                            {PRESET_ICONS.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => setFormData({ ...formData, icon })}
                                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                                  formData.icon === icon ? 'border-primary scale-110' : 'border-border'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {editingCategory ? 'Updating...' : 'Adding...'}
                            </>
                          ) : (
                            <>{editingCategory ? 'Update' : 'Add'} Category</>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
                </div>
                <p className="text-muted-foreground">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-lg font-medium mb-2">No categories yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by adding your first expense category
                </p>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Category
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="flex items-center justify-between p-4 hover:shadow-md transition-shadow"
                    style={{ borderLeft: `4px solid ${category.color}` }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{category.icon}</span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{category.name}</p>
                        {isDefaultCategory(category.id) && (
                          <p className="text-xs text-muted-foreground">Default Category</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!isDefaultCategory(category.id) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(category)}
                            className="h-8 w-8"
                            title="Edit category"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
