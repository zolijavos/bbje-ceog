/**
 * Loading skeleton for the applicants page
 * Displayed while server-side data is being fetched
 */

export default function ApplicantsLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="ml-4 h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs Skeleton */}
        <div className="mb-4 border-b border-gray-200">
          <div className="flex space-x-8 pb-4">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Applicant Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-24 bg-amber-100 rounded-full animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-40 bg-gray-200 rounded animate-pulse mt-4" />
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-8 w-20 bg-green-100 rounded-md animate-pulse" />
                    <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
