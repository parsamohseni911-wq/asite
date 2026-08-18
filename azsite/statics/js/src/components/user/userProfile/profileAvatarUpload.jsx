// src/components/user/userProfile/profileAvatarUpload.jsx
import React, { useRef, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Camera, Trash2 } from 'react-feather';
import { toast } from 'react-toastify'; // اضافه کردن toast برای نمایش پیام خطا

const ProfileAvatarUpload = ({ avatar, userName, isLoading, onAvatarChange }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (file) {
            // لیست فرمت‌های مجاز
            const allowedTypes = [
                'image/png',
                'image/jpeg',
                'image/jpg',
                'image/webp',
                'image/svg+xml'
            ];

            // بررسی نوع فایل
            if (!allowedTypes.includes(file.type)) {
                toast.error('فرمت فایل مجاز نیست. لطفاً از png, jpg, jpeg, webp یا svg استفاده کنید.');
                // پاک کردن اینپوت برای اینکه کاربر بتواند دوباره انتخاب کند
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            // بررسی حجم فایل (مثلاً حداکثر 2 مگابایت)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                toast.error('حجم فایل نباید بیشتر از ۲ مگابایت باشد.');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result;
                setPreview(imageUrl);
                onAvatarChange(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onAvatarChange('1.png');
    };

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-4">
                    <Skeleton width={80} height={80} borderRadius={20} className="dark:!bg-gray-800" />
                    <div>
                        <Skeleton width={120} height={20} className="dark:!bg-gray-800 mb-2" />
                        <Skeleton width={80} height={14} className="dark:!bg-gray-800" />
                    </div>
                </div>
            </div>
        );
    }

    const currentAvatar = preview || `${avatar || '1.png'}`;

    return (
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-5">
                <div className="relative group">
                    <img
                        src={currentAvatar}
                        alt={userName}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 dark:border-gray-700 shadow-md"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Camera size={20} className="text-white" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        // محدودیت فرمت در اینپوت هم اضافه شد (هرچند جاوااسکریپت امن‌تر است)
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{userName}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002874]  text-white rounded-lg text-xs font-medium hover:bg-[#001d5a] transition"
                        >
                            <Camera size={14} /> تغییر تصویر
                        </button>
                        {preview && (
                            <button
                                onClick={handleRemove}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                                <Trash2 size={14} /> حذف
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">فرمت‌های مجاز: JPG, PNG, WebP, SVG. حداکثر ۲ مگابایت</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileAvatarUpload;