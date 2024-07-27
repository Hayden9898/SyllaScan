from django.shortcuts import render
from django.http import HttpRequest, HttpResponse, JsonResponse

# Create your views here.

def home(request):
    return render(request, "home.html")

# def home(request: HttpRequest) -> JsonResponse:
#     return JsonResponse({"msg": "Hello World"})

# def googlePicker_login(request HttpRequest):
