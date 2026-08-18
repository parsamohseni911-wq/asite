import secrets

from django.conf import settings

from kavenegar import (
    KavenegarAPI,
    APIException,
    HTTPException,
)


def generate_otp():

    print("========== STEP 1 ==========")
    print("Generating OTP...")

    code = str(
        secrets.randbelow(900000) + 100000
    )

    print("OTP GENERATED:", code)
    print("============================")

    return code


def send_otp(phone, code):

    print("========== STEP 2 ==========")
    print("Starting Kavenegar...")
    print("PHONE:", phone)
    print("CODE:", code)

    print(
        "API KEY EXISTS:",
        bool(settings.KAVENEGAR_API_KEY)
    )

    print(
        "SENDER:",
        settings.KAVENEGAR_SENDER
    )

    api = KavenegarAPI(
        settings.KAVENEGAR_API_KEY
    )

    message = (
        f"کد تایید شما: {code}"
        "این کد تا 2 دقیقه معتبر است."
    )

    params = {
        "receptor": phone,
        "sender": settings.KAVENEGAR_SENDER,
        "message": message,
    }

    print("PARAMS:", params)
    print("Calling sms_send...")

    try:

        response = api.sms_send(params)

        print("========== STEP 3 ==========")
        print("KAVENEGAR RESPONSE:")
        print(response)
        print("============================")

        return response

    except APIException as e:

        print("========== KAVENEGAR API ERROR ==========")
        print("ERROR:", repr(e))
        print("==========================================")

        return None

    except HTTPException as e:

        print("========== KAVENEGAR HTTP ERROR ==========")
        print("ERROR:", repr(e))
        print("==========================================")

        return None

    except Exception as e:

        print("========== UNKNOWN ERROR ==========")
        print("ERROR TYPE:", type(e).name)
        print("ERROR:", repr(e))
        print("===================================")

        return None