// src/components/user/userProfile/userProfile.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProfileInfoForm from './profileInfoForm';
import ProfileAvatarUpload from './profileAvatarUpload';
import ProfilePasswordChange from './profilePasswordChange';
import ProfileNotificationsSettings from './profileNotificationsSettings';
import usersData from '../../../../public/jsons/users.json';

const TABS = [
    { id: 'info', label: 'اطلاعات شخصی' },
    { id: 'password', label: 'تغییر رمز عبور' },
    { id: 'notifications', label: 'تنظیمات اعلان‌ها' },
];

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            const loadedUser = usersData[0] || null;
            setUser({
                ...loadedUser,
                firstName: loadedUser?.name?.split(' ')[0] || '',
                lastName: loadedUser?.name?.split(' ')[1] || '',
                birthDate: '۱۳۷۵/۰۴/۱۵',
                nationalCode: '۰۰۱۲۳۴۵۶۷۸',
                avatar: loadedUser?.avatar || '1.png',
            });
            setIsLoading(false);
        };
        loadUser();
    }, []);

    const handleUpdateInfo = (formData) => {
        setUser(prev => ({ ...prev, ...formData }));
        toast.success('اطلاعات با موفقیت به‌روزرسانی شد');
    };

    const handleAvatarChange = (newAvatar) => {
        setUser(prev => ({ ...prev, avatar: newAvatar }));
        toast.success('تصویر پروفایل با موفقیت تغییر کرد');
    };

    const handlePasswordChange = (data) => {
        console.log('Password changed:', data);
        toast.success('رمز عبور با موفقیت تغییر کرد');
    };

    const handleNotificationsChange = (settings) => {
        console.log('Notifications updated:', settings);
        toast.success('تنظیمات اعلان‌ها ذخیره شد');
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">پروفایل کاربری</h1>
            </div>

            {/* آواتار */}
            <ProfileAvatarUpload
                avatar={user?.avatar}
                userName={user?.name}
                isLoading={isLoading}
                onAvatarChange={handleAvatarChange}
            />

            {/* تب‌ها */}
            <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 lg:px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-[#002874] text-[#002874]  dark:border-[#4C6FB6] dark:text-[#4C6FB6]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5 lg:p-6">
                    {activeTab === 'info' && (
                        <ProfileInfoForm user={user} isLoading={isLoading} onSave={handleUpdateInfo} />
                    )}
                    {activeTab === 'password' && (
                        <ProfilePasswordChange onSave={handlePasswordChange} />
                    )}
                    {activeTab === 'notifications' && (
                        <ProfileNotificationsSettings user={user} isLoading={isLoading} onSave={handleNotificationsChange} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;