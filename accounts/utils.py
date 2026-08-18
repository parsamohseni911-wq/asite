import random


def generate_otp():
    """
    ساخت کد ۶ رقمی OTP
    """
    return str(random.randint(100000, 999999))


def send_otp(phone, code, purpose="verify_phone"):
    """
    ارسال OTP

    فعلاً برای تست، کد داخل ترمینال چاپ می‌شود.
    بعداً اتصال کاوه‌نگار را همین‌جا انجام می‌دهیم.
    """

    print("=" * 50)
    print("OTP SMS")
    print(f"Phone: {phone}")
    print(f"Purpose: {purpose}")
    print(f"Code: {code}")
    print("=" * 50)

    return True