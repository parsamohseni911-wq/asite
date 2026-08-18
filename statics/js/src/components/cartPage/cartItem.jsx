// =============================================================================
// FILE: cartItem.jsx
// =============================================================================
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Plus, Minus, Trash2, Heart, Shield, Circle } from 'react-feather';
import 'react-lazy-load-image-component/src/effects/blur.css';
import {toast} from "react-toastify";

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const itemPrice = parseInt(String(item.price).replace(/[^\d]/g, ''));
    const itemTotal = !isNaN(itemPrice) ? (itemPrice).toLocaleString('fa-IR') : '۰';

    return (
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* تصویر */}
            <Link
                to={`/product/${item.id}`}
                className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-[#002874]/5 to-[#4C6FB6]/10 dark:from-[#002874]/20 dark:to-[#4C6FB6]/20 p-3 flex items-center justify-center overflow-hidden"
            >
                <LazyLoadImage
                    src={item.image}
                    alt={item.name}
                    effect="blur"
                    className="w-full h-full object-contain"
                />
            </Link>

            {/* اطلاعات */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <Link to={`/product/${item.id}`} className="text-sm font-bold text-gray-900 dark:text-white hover:text-[#002874] dark:hover:text-[#4C6FB6] transition-colors line-clamp-2">
                        {item.name}
                    </Link>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* رنگ و گارانتی */}
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    {item.selectedColor && (
                        <span className="flex items-center gap-1.5">
              <Circle size={12} />
              <span className="inline-block w-3 h-3 rounded-full border" style={{ backgroundColor: item.selectedColor }}></span>
                            {item.selectedColor}
            </span>
                    )}
                    <span className="flex items-center gap-1.5">
            <Shield size={12} />
                        {item.selectedWarranty}
          </span>
                </div>

                {/* قیمت و تعداد */}
                <div className="flex items-end justify-between mt-3">
                    <div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {itemPrice.toLocaleString('fa-IR')}
            </span>
                        <div className="font-bold text-base text-gray-900 dark:text-white">
                            {itemTotal}
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 mr-1">تومان</span>
                        </div>
                    </div>

                    {/* کنترل تعداد */}
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#111] hover:text-[#002874] dark:hover:text-[#4C6FB6] transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white tabular-nums">
              {item.quantity.toLocaleString('fa-IR')}
            </span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#111] hover:text-[#002874] dark:hover:text-[#4C6FB6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Minus size={14} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => toast.success('با موفقیت به علاقه‌مندی‌ها اضافه شد')}
                    className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                >
                    <Heart size={12} />
                    انتقال به علاقه‌مندی‌ها
                </button>
            </div>
        </div>
    );
};

export default CartItem;