// Route-level fallback while a page's client bundle loads.
export default function Loading() {
  return (
    <div className="space-y-5 py-2">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-100" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}
