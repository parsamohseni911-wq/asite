// =============================================================================
// FILE: categoryPage.jsx
// =============================================================================
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import Fuse from 'fuse.js';
import { Grid } from 'react-feather';
import categoriesData from '../../../public/jsons/categories.json';
import productsData from '../../../public/jsons/products.json';
import { Breadcrumb } from '../../utils/helpers/breadcrumb';
import { toast } from 'react-toastify';
import CategoryPageSkeleton from '../skeleton/CategoryPageSkeleton/CategoryPageSkeleton.jsx';
import CategoryNotFound from './categoryNotFound';
import CategoryHero from './categoryHero';
import CategorySubCategories from './categorySubCategories';
import CategoryTopBrands from './categoryTopBrands';
import CategoryFilterBar from './categoryFilterBar';
import CategoryProductGrid from './categoryProductGrid';
import CategoryEmpty from './categoryEmpty';

const ITEMS_PER_LOAD = 10;

const CategoryPage = () => {
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('newest');
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_LOAD);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const allCategories = useMemo(() => categoriesData.categories || [], []);
    const allProducts = useMemo(() => productsData.products || [], []);

    const category = useMemo(() => allCategories.find(c => c.id === parseInt(id)), [allCategories, id]);

    const categoryProducts = useMemo(() => {
        if (!category) return [];
        return allProducts.filter(p => p.categoryId === category.id);
    }, [category, allProducts]);

    const fuse = useMemo(() => {
        return new Fuse(categoryProducts, {
            keys: ['name', 'shortDescription', 'tags'],
            threshold: 0.3,
        });
    }, [categoryProducts]);

    const filteredProducts = useMemo(() => {
        if (searchQuery.trim()) {
            return fuse.search(searchQuery).map(r => r.item);
        }
        return categoryProducts;
    }, [categoryProducts, searchQuery, fuse]);

    const sortedProducts = useMemo(() => {
        let res = [...filteredProducts];
        switch (sortBy) {
            case 'cheapest':
                res.sort((a, b) => parseInt(a.price.replace(/,/g, '')) - parseInt(b.price.replace(/,/g, '')));
                break;
            case 'expensive':
                res.sort((a, b) => parseInt(b.price.replace(/,/g, '')) - parseInt(a.price.replace(/,/g, '')));
                break;
            case 'popular':
                res.sort((a, b) => b.rating - a.rating);
                break;
            case 'discount':
                res.sort((a, b) => b.discount - a.discount);
                break;
            default:
                res.sort((a, b) => b.id - a.id);
        }
        return res;
    }, [filteredProducts, sortBy]);

    const visibleProducts = useMemo(() => sortedProducts.slice(0, displayCount), [sortedProducts, displayCount]);
    const hasMore = displayCount < sortedProducts.length;

    const fetchMoreData = () => {
        setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + ITEMS_PER_LOAD, sortedProducts.length));
        }, 500);
    };

    useEffect(() => {
        setDisplayCount(ITEMS_PER_LOAD);
    }, [sortBy, searchQuery, id]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        window.scrollTo(0, 0);
        return () => clearTimeout(timer);
    }, [id]);

    const handleSearch = () => {
        setSearchQuery(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        toast.success('جستجو پاک شد');
    };

    const handleAddToCart = (product) => {
        toast.success(`${product.name} به سبد خرید اضافه شد`);
    };

    const handleToggleWishlist = () => {
        toast.success('به علاقه‌مندی‌ها اضافه شد');
    };

    if (isLoading) return <CategoryPageSkeleton />;
    if (!category) return <CategoryNotFound />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">

                <Breadcrumb items={[
                    { title: 'دسته‌بندی‌ها', link: '/categories', icon: Grid },
                    { title: category.name, link: `/category/${category.id}` }
                ]} />

                {/* Hero با جستجو */}
                <CategoryHero
                    category={category}
                    productsCount={categoryProducts.length}
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    onSearch={handleSearch}
                    onClearSearch={handleClearSearch}
                />

                {/* نتیجه جستجو */}
                {searchQuery && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-2">
                        {sortedProducts.length.toLocaleString('fa-IR')} نتیجه برای "{searchQuery}"
                    </p>
                )}

                <CategorySubCategories subcategories={category.subcategories} />
                <CategoryTopBrands categoryProducts={categoryProducts} />

                <CategoryFilterBar
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    totalResults={sortedProducts.length}
                    showingResults={visibleProducts.length}
                />

                {sortedProducts.length === 0 ? (
                    <CategoryEmpty searchQuery={searchQuery} onClear={handleClearSearch} />
                ) : (
                    <InfiniteScroll
                        dataLength={visibleProducts.length}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        scrollThreshold={0.7}
                        style={{ overflow: 'visible' }}
                        loader={
                            <div className="flex justify-center py-6">
                                <div className="w-8 h-8 border-4 border-[#002874] border-t-transparent rounded-full animate-spin" />
                            </div>
                        }
                        endMessage={
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-6">
                                همه محصولات نمایش داده شد.
                            </p>
                        }
                    >
                        <CategoryProductGrid
                            products={visibleProducts}
                            viewMode={viewMode}
                            onAddToCart={handleAddToCart}
                            onToggleWishlist={handleToggleWishlist}
                        />
                    </InfiniteScroll>
                )}

            </div>
        </div>
    );
};

export default CategoryPage;