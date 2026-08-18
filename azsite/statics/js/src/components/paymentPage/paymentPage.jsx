// =============================================================================
// FILE: paymentPage.jsx
// =============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CreditCard } from 'react-feather';
import productsData from '../../../public/jsons/products.json';
import addressesData from '../../../public/jsons/addresses.json';
import { Breadcrumb } from '../../utils/helpers/breadcrumb';
import { toast } from 'react-toastify';
import PaymentPageSkeleton from '../skeleton/PaymentPageSkeleton/PaymentPageSkeleton.jsx';
import PaymentProgress from './paymentProgress';
import PaymentMethods from './paymentMethods';
import PaymentWallet from './paymentWallet';
import PaymentOrderSummary from './paymentOrderSummary';
import PaymentCoupon from './paymentCoupon';
import PaymentStickyFooter from './paymentStickyFooter';

const PaymentPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('gateway');
    const [walletPassword, setWalletPassword] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    const [cartItems] = useState(() => {
        const allProducts = productsData.products || [];
        return allProducts.slice(0, 3).map(p => ({
            ...p,
            quantity: Math.floor(Math.random() * 3) + 1,
        }));
    });

    const addresses = useMemo(() => addressesData.addresses || [], []);
    const selectedAddress = useMemo(() => addresses.find(a => a.isDefault) || addresses[0], [addresses]);
    const deliveryTime = 'morning';

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const price = parseInt(String(item.price).replace(/[^\d]/g, ''));
            return sum + (isNaN(price) ? 0 : price * item.quantity);
        }, 0);
    }, [cartItems]);

    const shippingCost = selectedAddress?.province === 'تهران' ? 25000 : 40000;
    const discountAmount = appliedDiscount ? Math.floor(subtotal * appliedDiscount.percent / 100) : 0;
    const total = subtotal - discountAmount + shippingCost;

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        window.scrollTo(0, 0);
        return () => clearTimeout(timer);
    }, []);

    const handlePay = () => {
        if (paymentMethod === 'wallet' && !walletPassword) {
            toast.error('لطفاً رمز کیف پول را وارد کنید');
            return;
        }
        toast.success('پرداخت با موفقیت انجام شد');
        setTimeout(() => navigate('/payment/result?status=ok'), 1000);
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

    if (isLoading) return <PaymentPageSkeleton />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">

                <Breadcrumb items={[
                    { title: 'پرداخت', link: '/payment', icon: CreditCard }
                ]} />

                <PaymentProgress currentStep={3} />

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                    پرداخت
                </h1>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-4">

                        {/* روش پرداخت */}
                        <PaymentMethods
                            selected={paymentMethod}
                            onSelect={setPaymentMethod}
                        />

                        {/* کیف پول */}
                        {paymentMethod === 'wallet' && (
                            <PaymentWallet
                                password={walletPassword}
                                onPasswordChange={setWalletPassword}
                                balance={1250000}
                            />
                        )}

                        {/* کد تخفیف */}
                        <PaymentCoupon
                            discountCode={discountCode}
                            onDiscountChange={setDiscountCode}
                            onApply={handleApplyDiscount}
                            appliedDiscount={appliedDiscount}
                            onRemoveDiscount={handleRemoveDiscount}
                        />

                    </div>

                    {/* Sidebar - Desktop */}
                    <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
                        <div className="sticky top-24">
                            <PaymentOrderSummary
                                items={cartItems}
                                subtotal={subtotal}
                                shippingCost={shippingCost}
                                discountAmount={discountAmount}
                                total={total}
                                selectedAddress={selectedAddress}
                                deliveryTime={deliveryTime}
                                onPay={handlePay}
                                paymentMethod={paymentMethod}
                                appliedDiscount={appliedDiscount}
                            />
                        </div>
                    </div>

                </div>

                {/* Sticky Footer */}
                <PaymentStickyFooter
                    total={total}
                    onPay={handlePay}
                    paymentMethod={paymentMethod}
                />

            </div>
        </div>
    );
};

export default PaymentPage;