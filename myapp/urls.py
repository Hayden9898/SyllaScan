from django.urls import path
# from . import views
from myapp import views
from django.contrib import admin

urlpatterns = [
    path("", views.home, name ="home"),
    # path('admin/', admin.site.urls),
    # path('oauth2', views.home, name='oauth2')
]