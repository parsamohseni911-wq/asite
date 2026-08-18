// =============================================================================
// FILE: paymentCoupon.jsx
// =============================================================================
import React from 'react';
import { Tag, X, Check } from 'react-feather';

const PaymentCoupon = ({ discountCode, onDiscountChange, onApply, appliedDiscount, onRemoveDiscount }) => (
    <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <Tag size={16} className="text-[#002874] dark:text-[#4C6FB6]" />
            کد تخفیف
        </h3>

        {appliedDiscount ? (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-800/30">
                        <Check size={14} className="text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">{appliedDiscount.code} ({appliedDiscount.percent}%)</p>
                </div>
                <button onClick={onRemoveDiscount} className="p-1.5 text-gray-400 hover:text-red-500"><X size={14} /></button>
            </div>
        ) : (
            <div className="flex gap-2">
                <input type="text" value={discountCode} onChange={(e) => onDiscountChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onApply()} placeholder="کد تخفیف" className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002874] dark:focus:ring-[#4C6FB6] focus:border-transparent" />
                <button onClick={onApply} className="px-4 py-2.5 bg-[#002874] text-white rounded-xl text-sm font-medium hover:bg-[#001d5a]">اعمال</button>
            </div>
        )}
    </div>
);

export default PaymentCoupon;