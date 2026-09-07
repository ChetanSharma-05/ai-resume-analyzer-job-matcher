from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    """
    Wraps DRF's default exception handler so every error response
    follows a consistent shape:
    { "success": false, "message": "...", "errors": {...} }
    """
    response = exception_handler(exc, context)

    if response is not None:
        message = "An error occurred."
        errors = {}

        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
            else:
                errors = response.data
                first_key = next(iter(errors), None)
                if first_key:
                    first_val = errors[first_key]
                    if isinstance(first_val, list) and first_val:
                        message = f"{first_key}: {first_val[0]}"
        elif isinstance(response.data, list) and response.data:
            message = str(response.data[0])

        response.data = {
            "success": False,
            "message": message,
            "errors": errors,
        }

    return response


def success_response(data=None, message="Success", status_code=200):
    from rest_framework.response import Response
    return Response(
        {"success": True, "message": message, "data": data},
        status=status_code,
    )
