import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-7 sm:h-8 w-48 sm:w-64" />
        <Skeleton className="h-3 sm:h-4 w-72 sm:w-96 max-w-full" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <Skeleton className="h-7 sm:h-8 w-24 sm:w-32 mb-1" />
              <Skeleton className="h-2 sm:h-3 w-16 sm:w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Content Skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Left Column */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
            <Skeleton className="h-3 sm:h-4 w-48 sm:w-64 mt-2" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <Skeleton className="h-48 sm:h-64 w-full" />
          </CardContent>
        </Card>

        {/* Right Column */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-3 sm:h-4 w-full" />
                  <Skeleton className="h-2 sm:h-3 w-2/3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-6xl space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
          <Skeleton className="h-3 sm:h-4 w-56 sm:w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-full sm:w-40" />
      </div>

      {/* Categories Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3\">\n        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded shrink-0" />
                  <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                </div>
                <Skeleton className="h-7 w-14 sm:h-8 sm:w-16 shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <Skeleton className="h-3 sm:h-4 w-full mb-2" />
              <Skeleton className="h-2 sm:h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ExpenseFormSkeleton() {
  return (
    <div className="container max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <Card className="overflow-hidden">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <Skeleton className="h-6 sm:h-7 w-40 sm:w-48" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64 mt-2" />
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
          {/* Form Fields */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
              <Skeleton className="h-9 sm:h-10 w-full" />
            </div>
          ))}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-9 sm:h-10 flex-1" />
            <Skeleton className="h-9 sm:h-10 w-full sm:w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 sm:h-8 w-28 sm:w-32" />
        <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
      </div>

      {/* Settings Sections */}
      {[1, 2, 3].map((section) => (
        <Card key={section} className="overflow-hidden">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
            <Skeleton className="h-3 sm:h-4 w-72 sm:w-96 max-w-full mt-2" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
                  <Skeleton className="h-9 sm:h-10 w-full sm:max-w-sm" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl space-y-4 sm:space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 w-32 sm:w-40" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3\">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <Skeleton className="h-8 sm:h-10 w-32 sm:w-40 mb-2" />
              <Skeleton className="h-2 sm:h-3 w-20 sm:w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <Skeleton className="h-5 sm:h-6 w-40 sm:w-48" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <Skeleton className="h-64 sm:h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function GoalsSkeleton() {
  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 w-44 sm:w-56" />
          <Skeleton className="h-3 sm:h-4 w-64 sm:w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-full sm:w-36" />
      </div>

      {/* Goals Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3\">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                <Skeleton className="h-7 w-16 sm:h-8 sm:w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-2 sm:h-3 w-16 sm:w-20" />
                  <Skeleton className="h-2 sm:h-3 w-16 sm:w-20" />
                </div>
              </div>
              <Skeleton className="h-8 sm:h-9 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
