# employees/views.py
from django.http import JsonResponse, HttpResponseNotAllowed
from django.contrib.auth import get_user_model

def ping(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    return JsonResponse({"status": "ok"})

def all_users(request):
    User = get_user_model()
    data = list(User.objects.values("id", "username", "email", "first_name", "last_name"))
    return JsonResponse(data, safe=False)
