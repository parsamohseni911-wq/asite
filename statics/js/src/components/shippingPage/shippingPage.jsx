import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin } from 'react-feather';
import productsData from '../../../public/jsons/products.json';
import addressesData from '../../../public/jsons/addresses.json';
import { Breadcrumb } from '../../utils/helpers/breadcrumb';
import { toast } from 'react-toastify';
import ShippingPageSkeleton from '../skeleton/ShippingPageSkeleton/ShippingPageSkeleton.jsx';
import ShippingProgress from './shippingProgress';
import ShippingSavedAddresses from './shippingSavedAddresses';
import ShippingDeliveryTime from './shippingDeliveryTime';
import ShippingSummary from './shippingSummary';
import ShippingStickyFooter from './shippingStickyFooter';

const ShippingPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [deliveryTime, setDeliveryTime] = useState('');
    const [cartItems] = useState(() => {
        const allProducts = productsData.products || [];
        return allProducts.slice(0, 3).map(p => ({
            ...p,
            quantity: Math.floor(Math.random() * 3) + 1,
        }));
    });
    const [addresses] = useState(addressesData.addresses || []);

    useEffect(() => {
        if (addresses.length && !selectedAddress) {
            setSelectedAddress(addresses.find(a => a.isDefault) || addresses[0]);
        }
    }, [addresses]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 600);
        window.scrollTo(0, 0);
        return () => clearTimeout(timer);
    }, []);

    const subtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const price = parseInt(String(item.price).replace(/[^\d]/g, ''));
            return sum + (isNaN(price) ? 0 : price * item.quantity);
        }, 0);
    }, [cartItems]);

    const shippingCost = selectedAddress?.province === 'تهران' ? 25000 : 40000;
    const total = subtotal + shippingCost;

    const handleContinue = () => {
        if (!selectedAddress) {
            toast.error('لطفاً یک آدرس انتخاب کنید');
            return;
        }
        if (!deliveryTime) {
            toast.error('لطفاً زمان ارسال را انتخاب کنید');
            return;
        }
        navigate('/payment');
    };

    const handleAddAddress = () => {
        navigate('/user/addresses?redirect=shipping');
    };

    if (isLoading) return <ShippingPageSkeleton />;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">

                <Breadcrumb items={[
                    { title: 'آدرس و ارسال', link: '/shipping', icon: MapPin }
                ]} />

                <ShippingProgress currentStep={2} />

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                    آدرس و زمان ارسال
                </h1>

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

                    <div className="flex-1 min-w-0 space-y-4">

                        <ShippingSavedAddresses
                            addresses={addresses}
                            selectedId={selectedAddress?.id}
                            onSelect={setSelectedAddress}
                            onAddNew={handleAddAddress}
                        />

                        <ShippingDeliveryTime
                            value={deliveryTime}
                            onChange={setDeliveryTime}
                        />

                    </div>

                    <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0">
                        <div className="sticky top-24">
                            <ShippingSummary
                                items={cartItems}
                                subtotal={subtotal}
                                shippingCost={shippingCost}
                                total={total}
                                selectedAddress={selectedAddress}
                                deliveryTime={deliveryTime}
                                onContinue={handleContinue}
                            />
                        </div>
                    </div>

                </div>

                <ShippingStickyFooter
                    total={total}
                    selectedAddress={selectedAddress}
                    deliveryTime={deliveryTime}
                    onContinue={handleContinue}
                />

            </div>
        </div>
    );
};

export default ShippingPage;