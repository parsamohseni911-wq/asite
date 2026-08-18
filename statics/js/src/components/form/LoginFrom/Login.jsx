import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import OtpInput from 'react-otp-input';
import { z } from 'zod';
import DOMPurify from 'dompurify';
import {
    Phone, Check, X, Eye, EyeOff, ArrowLeft, User, Lock,
    CheckCircle, XCircle, Sun, Moon
} from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';

// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------
const phoneSchema = z.object({
    phone: z
        .string()
        .regex(/^09\d{9}$/, 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود'),
});
const profileSchema = z.object({
    firstName: z.string().min(2, 'نام حداقل ۲ حرف'),
    lastName: z.string().min(2, 'نام خانوادگی حداقل ۲ حرف'),
    password: z
        .string()
        .min(8, 'حداقل ۸ کاراکتر')
        .regex(/[a-z]/, 'حداقل یک حرف کوچک')
        .regex(/[A-Z]/, 'حداقل یک حرف بزرگ'),
});

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const preventPersianChars = (e) => {
    const persianRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    if (persianRegex.test(e.key)) e.preventDefault();
};
const allowOnlyDigits = (e) => {
    if (!/^\d$/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
const LoginPage = () => {
    const [step, setStep] = useState('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Dark Mode Logic
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const handlePhoneSuccess = (phone) => {
        setPhoneNumber(phone);
        setStep('otp');
        toast.success('کد تایید به شماره شما ارسال شد');
    };
    const handleOtpSuccess = () => setStep('profile');
    const handleProfileSuccess = () => {
        toast.success('ثبت‌نام با موفقیت انجام شد!');
        navigate('/user');
    };
    const handleBack = () => {
        if (step === 'otp') setStep('phone');
        else if (step === 'profile') setStep('otp');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-6 transition-colors duration-300">
            {/* Dark Mode Toggle */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#002874] dark:hover:border-[#4C6FB6] transition-all"
                aria-label="تغییر تم"
            >
                {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link to="/">
                        <img
                            src="/images/logos/with-border.svg"
                            alt="Logo"
                            className="h-16 w-auto dark:brightness-90"
                        />
                    </Link>
                </div>
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                    <div className="flex items-center p-4 border-b border-gray-100 dark:border-gray-800 relative">
                        {/* دکمه برگشت - چپ */}
                        {step !== 'phone' && (
                            <button
                                onClick={handleBack}
                                className="absolute left-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        {/* عنوان - وسط */}
                        <h2 className="w-full text-center font-bold text-gray-900 dark:text-white text-lg">
                            {step === 'phone' && 'ورود / ثبت‌نام'}
                            {step === 'otp' && 'تایید کد'}
                            {step === 'profile' && 'تکمیل اطلاعات'}
                        </h2>
                    </div>
                    <div className="p-6">
                        <AnimatePresence mode="wait" initial={false}>
                            {step === 'phone' && <PhoneStep key="phone" onSuccess={handlePhoneSuccess} />}
                            {step === 'otp' && <OtpStep key="otp" phone={phoneNumber} onSuccess={handleOtpSuccess} />}
                            {step === 'profile' && (
                                <ProfileStep
                                    key="profile"
                                    phone={phoneNumber}
                                    showPassword={showPassword}
                                    setShowPassword={setShowPassword}
                                    onSuccess={handleProfileSuccess}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                    <p className="text-center p-3 text-xs text-gray-500 dark:text-gray-400 mt-4">
                        با ورود و ثبت‌نام،
                        <Link to="/terms" className="text-[#002874] dark:text-[#4C6FB6] hover:underline">
                            &nbsp; قوانین و مقررات&nbsp;
                        </Link>
                        و
                        <Link to="/privacy" className="text-[#002874] dark:text-[#4C6FB6] hover:underline">
                            &nbsp; حریم خصوصی&nbsp;
                        </Link>
                        را می‌پذیرید
                    </p>
                </div>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// Step 1: Phone Input
// -----------------------------------------------------------------------------
const PhoneStep = ({ onSuccess }) => {
    const { control, handleSubmit, formState: { errors, isValid }, watch, trigger } = useForm({
        resolver: zodResolver(phoneSchema),
        mode: 'onChange',
        defaultValues: { phone: '' },
    });
    const phoneValue = watch('phone');
    const isPhoneValid = phoneValue && /^09\d{9}$/.test(phoneValue);

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit((data) => onSuccess(data.phone))}
            className="space-y-6"
        >
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                لطفاً شماره موبایل خود را وارد کنید
            </div>
            <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                    <div>
                        <div className="relative">
                            <div
                                className={`
                  flex items-center rounded-xl border bg-gray-50 dark:bg-gray-900 transition-all
                  ${errors.phone ? 'border-red-500' : isPhoneValid ? 'border-green-500' : 'border-gray-300 dark:border-gray-700'}
                  focus-within:ring-2 focus-within:ring-[#002874] dark:focus-within:ring-[#4C6FB6] focus-within:border-transparent
                `}
                            >
                                <span className="ps-3 text-gray-400"><Phone size={18} /></span>
                                <input
                                    {...field}
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="۰۹xxxxxxxxx"
                                    className="w-full py-3 px-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-400 text-left dir-ltr"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                        field.onChange(val);
                                        trigger('phone');
                                    }}
                                    onKeyDown={allowOnlyDigits}
                                />
                                <div className="pe-3">
                                    {errors.phone && <XCircle size={18} className="text-red-500" />}
                                    {isPhoneValid && !errors.phone && <CheckCircle size={18} className="text-green-500" />}
                                </div>
                            </div>
                        </div>
                        {errors.phone && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <X size={12} /> {errors.phone.message}
                            </p>
                        )}
                    </div>
                )}
            />
            <button
                type="submit"
                disabled={!isValid}
                className="w-full py-3 rounded-xl bg-[#002874] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#001d5a] transition-all duration-200 shadow-sm hover:shadow-md"
            >
                دریافت کد تایید
            </button>
        </motion.form>
    );
};

// -----------------------------------------------------------------------------
// Step 2: OTP Input
// -----------------------------------------------------------------------------
const OtpStep = ({ phone, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const isValid = otp.length === 6;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isValid) return;
        // کد تستی 123456
        if (otp === '123456') {
            onSuccess();
        } else {
            setError('کد وارد شده اشتباه است');
            toast.error('کد تایید نامعتبر');
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <p className="text-gray-600 dark:text-gray-300 text-sm">کد ۶ رقمی ارسال شده به</p>
                <p className="font-mono text-gray-900 dark:text-white text-lg dir-ltr">{phone}</p>
                <button
                    type="button"
                    className="text-sm text-[#002874]  dark:text-[#4C6FB6] hover:underline"
                    onClick={() => toast.info('کد مجدد ارسال شد')}
                >
                    ارسال مجدد کد
                </button>
                <p className="text-gray-500 dark:text-gray-400 text-xs">(کد آزمایشی: 123456)</p>
            </div>
            <div className="flex justify-center" dir="ltr">
                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span className="w-2" />}
                    renderInput={(props) => (
                        <input
                            {...props}
                            inputMode="numeric"
                            className="!w-12 h-14 text-center text-xl font-bold rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#002874] dark:focus:ring-[#4C6FB6] focus:border-transparent transition-all outline-none"
                            style={{ borderColor: error ? '#ef4444' : isValid ? '#22c55e' : '#d1d5db' }}
                            onKeyDown={allowOnlyDigits}
                        />
                    )}
                    shouldAutoFocus
                />
            </div>
            {error && (
                <p className="text-center text-sm text-red-500 flex items-center justify-center gap-1">
                    <X size={14} /> {error}
                </p>
            )}
            <button
                type="submit"
                disabled={!isValid}
                className="w-full py-3 rounded-xl bg-[#002874] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#001d5a] transition-all duration-200 shadow-sm hover:shadow-md"
            >
                تایید و ادامه
            </button>
        </motion.form>
    );
};

// -----------------------------------------------------------------------------
// Step 3: Complete Profile
// -----------------------------------------------------------------------------
const ProfileStep = ({ phone, showPassword, setShowPassword, onSuccess }) => {
    const { register, handleSubmit, formState: { errors, isValid }, watch, trigger } = useForm({
        resolver: zodResolver(profileSchema),
        mode: 'onChange',
        defaultValues: { firstName: '', lastName: '', password: '' },
    });
    const passwordValue = watch('password', '');
    const passwordChecks = {
        minLength: passwordValue.length >= 8,
        hasLower: /[a-z]/.test(passwordValue),
        hasUpper: /[A-Z]/.test(passwordValue),
    };
    const strength = () => {
        const count = Object.values(passwordChecks).filter(Boolean).length;
        if (count === 0) return { color: 'gray', text: '' };
        if (count === 1) return { color: 'red', text: 'ضعیف' };
        if (count === 2) return { color: 'orange', text: 'متوسط' };
        return { color: 'green', text: 'قوی' };
    };
    const { color, text } = strength();

    // تابع onSubmit اصلاح شده
    const onSubmit = (data) => {
        let cleanFirstName = data.firstName;
        let cleanLastName = data.lastName;

        // فقط اگر در مرورگر هستیم (برای جلوگیری از خطای Node.js)
        if (typeof window !== 'undefined' && DOMPurify) {
            cleanFirstName = DOMPurify.sanitize(data.firstName);
            cleanLastName = DOMPurify.sanitize(data.lastName);
        }

        // تابع کمکی برای بررسی خالی بودن یا فقط فاصله بودن رشته
        const isEmptyOrSpaces = (str) => {
            return str.trim().length === 0;
        };

        // بررسی نام
        if (isEmptyOrSpaces(cleanFirstName)) {
            toast.error('لطفاً نام معتبری وارد کنید (بدون کد مخرب)');
            return; // توقف ارسال فرم
        }

        // بررسی نام خانوادگی
        if (isEmptyOrSpaces(cleanLastName)) {
            toast.error('لطفاً نام خانوادگی معتبری وارد کنید (بدون کد مخرب)');
            return; // توقف ارسال فرم
        }

        const finalData = {
            firstName: cleanFirstName,
            lastName: cleanLastName,
            phone: data.phone,
        };

        // لاگ در کنسول برای توسعه‌دهنده
        console.log('Profile Data (Sanitized & Valid):', finalData);

        // ادامه فرآیند
        onSuccess();
    };

    return (
        <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
        >
            {/* First Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">نام</label>
                <div className="relative">
                    <div
                        className={`
              flex items-center rounded-xl border bg-gray-50 dark:bg-gray-900 transition-all
              ${errors.firstName ? 'border-red-500' : watch('firstName')?.length >= 2 ? 'border-green-500' : 'border-gray-300 dark:border-gray-700'}
              focus-within:ring-2 focus-within:ring-[#002874] dark:focus-within:ring-[#4C6FB6] focus-within:border-transparent
            `}
                    >
                        <span className="ps-3 text-gray-400"><User size={18} /></span>
                        <input
                            {...register('firstName')}
                            type="text"
                            className="w-full py-3 px-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
                            onChange={async (e) => {
                                await register('firstName').onChange(e);
                                trigger('firstName');
                            }}
                        />
                        <div className="pe-3">
                            {errors.firstName && <XCircle size={18} className="text-red-500" />}
                            {!errors.firstName && watch('firstName')?.length >= 2 && <CheckCircle size={18} className="text-green-500" />}
                        </div>
                    </div>
                    {errors.firstName && <p className="mt-1.5 text-xs text-red-500">{errors.firstName.message}</p>}
                </div>
            </div>
            {/* Last Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">نام خانوادگی</label>
                <div className="relative">
                    <div
                        className={`
              flex items-center rounded-xl border bg-gray-50 dark:bg-gray-900 transition-all
              ${errors.lastName ? 'border-red-500' : watch('lastName')?.length >= 2 ? 'border-green-500' : 'border-gray-300 dark:border-gray-700'}
              focus-within:ring-2 focus-within:ring-[#002874] dark:focus-within:ring-[#4C6FB6] focus-within:border-transparent
            `}
                    >
                        <span className="ps-3 text-gray-400"><User size={18} /></span>
                        <input
                            {...register('lastName')}
                            type="text"
                            className="w-full py-3 px-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white"
                            onChange={async (e) => {
                                await register('lastName').onChange(e);
                                trigger('lastName');
                            }}
                        />
                        <div className="pe-3">
                            {errors.lastName && <XCircle size={18} className="text-red-500" />}
                            {!errors.lastName && watch('lastName')?.length >= 2 && <CheckCircle size={18} className="text-green-500" />}
                        </div>
                    </div>
                    {errors.lastName && <p className="mt-1.5 text-xs text-red-500">{errors.lastName.message}</p>}
                </div>
            </div>
            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">کلمه عبور</label>
                <div className="relative">
                    <div
                        className={`
              flex items-center rounded-xl border bg-gray-50 dark:bg-gray-900 transition-all
              ${errors.password ? 'border-red-500' : passwordValue && Object.values(passwordChecks).every(Boolean) ? 'border-green-500' : 'border-gray-300 dark:border-gray-700'}
              focus-within:ring-2 focus-within:ring-[#002874] dark:focus-within:ring-[#4C6FB6] focus-within:border-transparent
            `}
                    >
                        <span className="ps-3 text-gray-400"><Lock size={18} /></span>
                        <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            className="w-full py-3 px-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white dir-ltr text-left"
                            onChange={async (e) => {
                                await register('password').onChange(e);
                                trigger('password');
                            }}
                            onKeyDown={preventPersianChars}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <div className="pe-3">
                            {errors.password && <XCircle size={18} className="text-red-500" />}
                            {!errors.password && passwordValue && Object.values(passwordChecks).every(Boolean) && (
                                <CheckCircle size={18} className="text-green-500" />
                            )}
                        </div>
                    </div>
                    {passwordValue && (
                        <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${
                                            color === 'red' ? 'bg-red-500 w-1/3' : color === 'orange' ? 'bg-orange-500 w-2/3' : 'bg-green-500 w-full'
                                        }`}
                                    />
                                </div>
                                <span className={`text-xs font-medium ${
                                    color === 'red' ? 'text-red-500' : color === 'orange' ? 'text-orange-500' : 'text-green-500'
                                }`}>
                  {text}
                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                <div className="flex items-center gap-1">
                                    {passwordChecks.minLength ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-gray-400" />}
                                    <span className="text-[10px] text-gray-500">۸+ کاراکتر</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {passwordChecks.hasLower ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-gray-400" />}
                                    <span className="text-[10px] text-gray-500">حرف کوچک</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {passwordChecks.hasUpper ? <Check size={12} className="text-green-500" /> : <X size={12} className="text-gray-400" />}
                                    <span className="text-[10px] text-gray-500">حرف بزرگ</span>
                                </div>
                            </div>
                            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    )}
                </div>
            </div>
            <button
                type="submit"
                disabled={!isValid}
                className="w-full py-3 rounded-xl bg-[#002874] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#001d5a] transition-all duration-200 shadow-sm hover:shadow-md mt-6"
            >
                تکمیل ثبت‌نام
            </button>
        </motion.form>
    );
};

export default LoginPage;