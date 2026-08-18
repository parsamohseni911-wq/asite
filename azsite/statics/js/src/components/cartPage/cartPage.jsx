// =============================================================================
// FILE: cartPage.jsx
// =============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Home } from 'react-feather';
import productsData from '../../../public/jsons/products.json';
import { Breadcrumb } from '../../utils/helpers/breadcrumb';
import { toast } from 'react-toastify';
import CartPageSkeleton from '../skeleton/CartPageSkeleton/cartPageSkeleton.jsx';
import CartEmpty from './cartEmpty';
import CartItemsList from './cartItemsList';
import CartSummary from './cartSummary';
import CartDiscount from './cartDiscount';
import CartShipping from './cartShipping';
import CartGiftWrapper from './cartGiftWrapper';
import CartStickyFooter from './cartStickyFooter';

const CartPage = () => {
    const [isLoading, setIsLoading] = useState(true);

    // سبد خرید با محصولات نمونه
    const [cartItems, setCartItems] = useState(() => {
        const allProducts = productsData.products || [];
        return allProducts.slice(0, 3).map(p => ({
            ...p,
            quantity: Math.floor(Math.random() * 3) + 1,
            selectedColor: p.colors?.[0] || null,
            selectedWarranty: 'گارانتی ۱۸ ماهه',
        }));
    });

    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [shippingMethod, setShippingMethod] = useState('post');
    const [giftWrap, setGiftWrap] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        window.scrollTo(0, 0);
        return () => clearTimeout(timer);
    }, []);

    // محاسبات
    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const price = parseInt(String(item.price).replace(/[^\d]/g, ''));
            return sum + (isNaN(price) ? 0 : price * item.quantity);
        }, 0);
    }, [cartItems]);

    const shippingCost = shippingMethod === 'express' ? 50000 : shippingMethod === 'post' ? 25000 : 35000;
    const discountAmount = appliedDiscount ? Math.floor(subtotal * appliedDiscount.percent / 100) : 0;
    const giftWrapCost = giftWrap ? 15000 : 0;
    const total = subtotal - discountAmount + shippingCost + giftWrapCost;

    // Handlers
    const handleUpdateQuantity = (productId, newQty) => {
        if (newQty < 1) return;
        setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item));
    };

    const handleRemoveItem = (productId) => {
        setCartItems(prev => prev.filter(item => item.id !== productId));
        toast.success('محصول از سبد خرید حذف شد');
    };

    const handleApplyDiscount = () => {
        if (discountCode.toLowerCase() === 'off10') {
            setAppliedDiscount({ code: 'OFF10', percent: 10 });
            toast.success('کد تخفیف اعمال شد');
        } else if (discountCode.toLowerCase() === 'off20') {
            setAppliedDiscount({ code: 'OFF20', percent: 20 });
            toast.success('کد تخفیف اعمال شد');
        } else {
            toast.error('کد تخفیف نامعتبر است');
        }
    };

    const handleRemoveDiscount = () => {
        setAppliedDiscount(null);
        setDiscountCode('');
        toast.success('کد تخفیف حذف شد');
    };

    const handleCheckout = () => {
        toast.success('در حال انتقال به درگاه پرداخت...');
    };

    if (isLoading) return <CartPageSkeleton />;
    if (!cartItems.length) return <CartEmpty />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">

                <Breadcrumb items={[{ title: 'سبد خرید', link: '/cart', icon: ShoppingBag }]} />

                <h1 className="text-xl sm:text-2xl lg:text-3xl mt-3 font-extrabold text-gray-900 dark:text-white mb-4">
                    سبد خرید
                </h1>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

                    {/* لیست محصولات */}
                    <div className="flex-1 min-w-0 space-y-4">
                        <CartItemsList
                            items={cartItems}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={handleRemoveItem}
                        />

                        <CartDiscount
                            discountCode={discountCode}
                            onDiscountChange={setDiscountCode}
                            onApply={handleApplyDiscount}
                            appliedDiscount={appliedDiscount}
                            onRemoveDiscount={handleRemoveDiscount}
                        />

                        <CartShipping
                            selected={shippingMethod}
                            onSelect={setShippingMethod}
                        />

                        <CartGiftWrapper
                            checked={giftWrap}
                            onChange={setGiftWrap}
                        />
                    </div>

                    {/* خلاصه خرید - دسکتاپ */}
                    <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
                        <div className="sticky top-24">
                            <CartSummary
                                subtotal={subtotal}
                                discountAmount={discountAmount}
                                shippingCost={shippingCost}
                                giftWrapCost={giftWrapCost}
                                total={total}
                                onCheckout={handleCheckout}
                                appliedDiscount={appliedDiscount}
                            />
                        </div>
                    </div>

                </div>

                {/* فوتر چسبنده موبایل */}
                <CartStickyFooter total={total} onCheckout={handleCheckout} />

            </div>
        </div>
    );
};

export default CartPage;