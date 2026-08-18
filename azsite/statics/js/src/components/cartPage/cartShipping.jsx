// =============================================================================
// FILE: cartShipping.jsx
// =============================================================================
import React from 'react';
import { Truck, Clock } from 'react-feather';

const shippingOptions = [
    { value: 'express', label: 'ارسال فوری (پیک)', time: '۱ روز کاری', cost: '۵۰,۰۰۰ تومان' },
    { value: 'post', label: 'پست پیشتاز', time: '۳-۵ روز کاری', cost: '۲۵,۰۰۰ تومان' },
    { value: 'tipax', label: 'تیپاکس', time: '۲-۴ روز کاری', cost: '۳۵,۰۰۰ تومان' },
];

const CartShipping = ({ selected, onSelect }) => (
    <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
            <Truck size={16} className="text-[#002874] dark:text-[#4C6FB6]" />
            روش ارسال
        </h3>
        <div className="space-y-2">
            {shippingOptions.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onSelect(opt.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selected === opt.value
                            ? 'border-[#002874] dark:border-[#4C6FB6] bg-[#002874]/5 dark:bg-[#4C6FB6]/10'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                >
                    <div className="text-right">
                        <p className={`text-sm font-medium ${selected === opt.value ? 'text-[#002874] dark:text-[#4C6FB6]' : 'text-gray-800 dark:text-gray-200'}`}>
                            {opt.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} />
                            {opt.time}
                        </p>
                    </div>
                    <span className={`text-xs font-medium ${selected === opt.value ? 'text-[#002874] dark:text-[#4C6FB6]' : 'text-gray-500 dark:text-gray-400'}`}>
            {opt.cost}
          </span>
                </button>
            ))}
        </div>
    </div>
);

export default CartShipping;