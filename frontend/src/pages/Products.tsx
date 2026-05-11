import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, ProductFilters } from '../types';
import { productApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import ProductFilter from '../components/products/ProductFilter';
import SkeletonCard from '../components/ui/SkeletonCard';
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const getFilters = useCallback((): ProductFilters => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  }), [searchParams]);

  const filters = getFilters();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { limit: 12, page: filters.page || 1 };
        if (filters.search) params.search = filters.search;
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.minRating) params.minRating = filters.minRating;
        if (filters.sort) params.sort = filters.sort;

        const res = await productApi.getAll(params);
        setProducts(res.data.products);
        setTotal(res.data.total);
        setPages(res.data.pages);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]); // eslint-disable-line

  const updateFilter = (updates: Partial<ProductFilters>) => {
    const current = Object.fromEntries(searchParams.entries());
    const next: Record<string, string> = { ...current };
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') next[k] = String(v);
      else delete next[k];
    });
    if (updates.page === undefined) delete next.page;
    setSearchParams(next);
  };

  const resetFilters = () => setSearchParams({});

  const goToPage = (p: number) => updateFilter({ page: p });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {filters.category || filters.search ? (
            <>{filters.search ? `Results for "${filters.search}"` : filters.category}</>
          ) : 'All Products'}
        </h1>
        {!loading && <p className="text-sm text-gray-500 mt-1">{total} product{total !== 1 ? 's' : ''} found</p>}
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <ProductFilter filters={filters} onFilterChange={updateFilter} onReset={resetFilters} />

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No products found</h3>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
              <button onClick={resetFilters} className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => goToPage((filters.page || 1) - 1)}
                    disabled={(filters.page || 1) <= 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                        p === (filters.page || 1)
                          ? 'bg-amber-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage((filters.page || 1) + 1)}
                    disabled={(filters.page || 1) >= pages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
