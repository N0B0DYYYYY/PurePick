from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, RegisterView

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', include('rest_framework.urls', namespace='rest_framework')),
    path('register/', RegisterView.as_view({'post': 'create'}), name='register'),
]