// src/components/user/userProfile/profilePasswordChange.jsx
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Save } from 'react-feather';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';

const ProfilePasswordChange = ({ onSave }) => {
    const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.currentPassword) newErrors.currentPassword = 'رمز فعلی را وارد کنید';
        if (!formData.newPassword || formData.newPassword.length < 8) newErrors.newPassword = 'حداقل ۸ کاراکتر';
        if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'رمز جدید مطابقت ندارد';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return toast.error('لطفاً خطاها را بررسی کنید');

        let cleanData = { ...formData };

        // پاک‌سازی امن فیلدهای رمز عبور
        if (typeof window !== 'undefined' && DOMPurify) {
            cleanData.currentPassword = DOMPurify.sanitize(formData.currentPassword);
            cleanData.newPassword = DOMPurify.sanitize(formData.newPassword);
            cleanData.confirmPassword = DOMPurify.sanitize(formData.confirmPassword);
        }

        onSave(cleanData);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const toggleShow = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const fields = [
        { name: 'currentPassword', label: 'رمز عبور فعلی', show: showPasswords.current, toggle: () => toggleShow('current') },
        { name: 'newPassword', label: 'رمز عبور جدید', show: showPasswords.new, toggle: () => toggleShow('new') },
        { name: 'confirmPassword', label: 'تکرار رمز جدید', show: showPasswords.confirm, toggle: () => toggleShow('confirm') },
    ];

    return (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            {fields.map(field => (
                <div key={field.name}>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{field.label}</label>
                    <div className="relative">
                        <input
                            name={field.name}
                            type={field.show ? 'text' : 'password'}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className={`w-full p-2.5 pl-7 rounded-xl border bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-[#002874] dark:focus:ring-[#4C6FB6] transition dir-ltr text-left ${
                                errors[field.name] ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        />
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <button
                            type="button"
                            onClick={field.toggle}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors[field.name] && <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>}
                </div>
            ))}
            <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#002874]  text-white rounded-xl text-sm font-medium hover:bg-[#001d5a] transition"
            >
                <Save size={16} /> تغییر رمز عبور
            </button>
        </form>
    );
};

export default ProfilePasswordChange;