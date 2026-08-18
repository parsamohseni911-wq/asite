// =============================================================================
// FILE: categories.jsx
// =============================================================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Grid } from 'react-feather';
import InfiniteScroll from 'react-infinite-scroll-component';
import categoriesData from '../../../public/jsons/categories.json';
import productsData from '../../../public/jsons/products.json';
import { Breadcrumb } from '../../utils/helpers/breadcrumb';
import categoriesPageSkeleton from '../skeleton/CategoriesPageSkeleton/CategoriesPageSkeleton.jsx';
import categoriesHero from './categoriesHero';
import categoriesStats from './categoriesStats';
import categoriesFilterBar from './categoriesFilterBar';
import categoriesGrid from './categoriesGrid';
import categoriesFeatured from './categoriesFeatured';
import categoriesEmpty from './categoriesEmpty';
import { toast } from 'react-toastify';

const ITEMS_PER_LOAD = 10;

const CategoriesPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);

    const allCategories = useMemo(() => categoriesData.categories || [], []);
    const allProducts = useMemo(() => productsData.products || [], []);

    // محاسبه اطلاعات کامل هر دسته
    const enrichedCategories = useMemo(() => {
        return allCategories.map(cat => {
            const catProducts = allProducts.filter(p => p.categoryId === cat.id);
            const brandCount = new Set(catProducts.map(p => p.brandId)).size;
            const avgRating = catProducts.length
                ? catProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / catProducts.length
                : 0;

            return {
                ...cat,
                productsCount: catProducts.length,
                subcategoriesCount: cat.subcategories?.length || 0,
                brandsCount: brandCount,
                avgRating: Math.round(avgRating * 10) / 10,
                hasProducts: catProducts.length > 0,
                isFeatured: cat.featured || catProducts.length >= 10
            };
        });
    }, [allCategories, allProducts]);

    // فیلتر و مرتب‌سازی (همان منطق قبلی)
    const filteredCategories = useMemo(() => {
        let result = [...enrichedCategories];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.subcategories && c.subcategories.some(s => s.name.toLowerCase().includes(q)))
            );
        }

        const sorters = {
            alphabet: (a, b) => a.name.localeCompare(b.name, 'fa'),
            products: (a, b) => b.productsCount - a.productsCount,
            brands: (a, b) => b.brandsCount - a.brandsCount,
            rating: (a, b) => b.avgRating - a.avgRating,
            popular: (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.productsCount - a.productsCount
        };

        result.sort(sorters[sortBy] || sorters.popular);

        return result;
    }, [enrichedCategories, searchQuery, sortBy]);

    // دسته‌های ویژه
    const featuredCategories = useMemo(() =>
            enrichedCategories.filter(c => c.isFeatured).slice(0, 12),
        [enrichedCategories]
    );

    // آمار
    const stats = useMemo(() => ({
        totalCategories: allCategories.length,
        totalProducts: allProducts.length,
        totalBrands: new Set(allProducts.map(p => p.brandId)).size,
        activeCategories: enrichedCategories.filter(c => c.hasProducts).length
    }), [allCategories, allProducts, enrichedCategories]);

    // ریست displayCount با هر تغییر فیلتر/مرتب‌سازی
    useEffect(() => {
        setDisplayCount(ITEMS_PER_LOAD);
    }, [searchQuery, sortBy]);

    // لود اولیه
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1);
        window.scrollTo(0, 0);
        return () => clearTimeout(timer);
    }, []);

    // آرایه‌ای که واقعاً نمایش داده می‌شود
    const visibleCategories = useMemo(() => {
        return filteredCategories.slice(0, displayCount);
    }, [filteredCategories, displayCount]);

    const hasMore = displayCount < filteredCategories.length;

    const fetchMoreData = () => {
        // افزایش ۱۰ تایی
        setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + ITEMS_PER_LOAD, filteredCategories.length));
        }, 1); // تأخیر مصنوعی برای نمایش اسپینر
    };

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearchQuery('');
        setSortBy('popular');
        toast.success('فیلترها پاک شدند');
    }, []);

    const hasActiveFilters = searchQuery || sortBy !== 'popular';

    if (isLoading) return React.createElement(categoriesPageSkeleton);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">

                <Breadcrumb items={[{ title: "دسته‌بندی‌ها", link: "/categories", icon: Grid }]} />

                {React.createElement(categoriesHero, {
                    totalCategories: stats.totalCategories,
                    searchQuery,
                    onSearch: handleSearch,
                    onClear: () => handleSearch('')
                })}

                {React.createElement(categoriesStats, { stats })}

                {React.createElement(categoriesFilterBar, {
                    sortBy,
                    onSortChange: setSortBy,
                    viewMode,
                    onViewModeChange: setViewMode,
                    totalResults: filteredCategories.length,
                    hasActiveFilters,
                    onClearFilters: handleClearFilters
                })}

                {!searchQuery && featuredCategories.length > 0 && (
                    React.createElement(categoriesFeatured, { categories: featuredCategories })
                )}

                {filteredCategories.length > 0 ? (
                    <InfiniteScroll
                        dataLength={visibleCategories.length}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={
                            <div className="flex justify-center py-6">
                                <div className="w-8 h-8 border-4 border-[#002874] border-t-transparent rounded-full animate-spin" />
                            </div>
                        }
                        endMessage={
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-6">
                                همه دسته‌بندی‌ها نمایش داده شد.
                            </p>
                        }
                        scrollThreshold="300px"
                    >
                        {React.createElement(categoriesGrid, { categories: visibleCategories, viewMode })}
                    </InfiniteScroll>
                ) : (
                    React.createElement(categoriesEmpty, { onClear: handleClearFilters })
                )}

            </div>
        </div>
    );
};

export default CategoriesPage;