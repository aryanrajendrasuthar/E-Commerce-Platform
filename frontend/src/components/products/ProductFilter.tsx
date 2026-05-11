import { useState, useEffect } from 'react';
import { ProductFilters } from '../../types';
import { productApi } from '../../services/api';
import { SlidersHorizontal, X } from 'lucide-react';

interface ProductFilterProps {
  filters: ProductFilters;
  onFilterChange: (f: Partial<ProductFilters>) => void;
  onReset: () => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function ProductFilter({ filters, onFilterChange, onReset }: ProductFilterProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    productApi.getCategories().then((r) => setCategories(r.data.categories));
  }, []);

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </div>
        <button onClick={onReset} className="text-xs text-amber-600 hover:underline flex items-center gap-1">
          <X className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
          className="w-full rounded-lg border border-gray-200 text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
        <div className="space-y-1.5">
          <button
            onClick={() => onFilterChange({ category: '' })}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${!filters.category ? 'bg-amber-50 text-amber-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange({ category: cat })}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition ${filters.category === cat ? 'bg-amber-50 text-amber-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
            className="w-full border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            min="0"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
            className="w-full border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            min="0"
          />
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Min Rating</label>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => onFilterChange({ minRating: r === 0 ? '' : String(r) })}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                (filters.minRating || '0') === String(r)
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'border-gray-200 text-gray-600 hover:border-amber-400'
              }`}
            >
              {r === 0 ? 'Any' : `${r}+★`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
        onClick={() => setMobileOpen(true)}
      >
        <SlidersHorizontal className="w-4 h-4" /> Filters
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-white w-72 p-6 h-full overflow-y-auto ml-auto">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4">
              <X className="w-5 h-5" />
            </button>
            {filterContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">{filterContent}</div>
    </>
  );
}
