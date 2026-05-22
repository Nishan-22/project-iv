from django.http import JsonResponse


def home(request):
    return JsonResponse(
        {
            "name": "IT Club Voting API",
            "status": "running",
            "links": {
                "api": "/api/",
                "admin": "/admin/",
                "elections": "/api/elections/",
                "login": "/api/auth/login/",
            },
            "frontend": "http://127.0.0.1:5173",
            "note": "Use the React frontend for the voting interface.",
        }
    )
