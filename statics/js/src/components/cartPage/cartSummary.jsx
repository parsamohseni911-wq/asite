// =============================================================================
// FILE: cartSummary.jsx
// =============================================================================
import React from 'react';
import { ShoppingBag, Shield, Truck } from 'react-feather';
import {Link} from "react-router-dom";

const CartSummary = ({
                         subtotal = 0,
                         discountAmount = 0,
                         shippingCost = 0,
                         giftWrapCost = 0,
                         total = 0,
                         onCheckout,
                         appliedDiscount,
                     }) => (
    <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">خلاصه خرید</h3>

        <div className="space-y-3 text-sm">
            <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">جمع سبد خرید</span>
                <span className="text-gray-800 dark:text-gray-200">{subtotal.toLocaleString('fa-IR')} تومان</span>
            </div>

            {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">تخفیف ({appliedDiscount?.code})</span>
                    <span>-{discountAmount.toLocaleString('fa-IR')} تومان</span>
                </div>
            )}

            <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">هزینه ارسال</span>
                <span className="text-gray-800 dark:text-gray-200">{shippingCost.toLocaleString('fa-IR')} تومان</span>
            </div>

            {giftWrapCost > 0 && (
                <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">کادوپیچ</span>
                    <span className="text-gray-800 dark:text-gray-200">{giftWrapCost.toLocaleString('fa-IR')} تومان</span>
                </div>
            )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex justify-between text-base font-extrabold">
                <span className="text-gray-900 dark:text-white">مبلغ نهایی</span>
                <span className="text-[#002874] dark:text-[#4C6FB6]">{total.toLocaleString('fa-IR')} تومان</span>
            </div>
        </div>

       <Link to="/shipping">
           <button
               className="w-full py-3 bg-[#002874] text-white rounded-xl font-medium text-sm hover:bg-[#001d5a] transition-colors flex items-center justify-center gap-2"
           >
               <ShoppingBag size={18} />
               ادامه فرآیند خرید
           </button>
       </Link>

        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 justify-center">
            <Shield size={12} className="text-green-500" />
            پرداخت امن از درگاه بانکی
        </div>
    </div>
);

export default CartSummary;