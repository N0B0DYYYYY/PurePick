from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter as default_router
from drf_yasg import openapi
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView)
from rest_framework import permissions
from store import views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', views.current_user, name='current_user'),
]
