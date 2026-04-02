from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryViewSet, RegisterView, CartViewSet
from . import views

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('categories', CategoryViewSet)
router.register('cart', CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', include('rest_framework.urls', namespace='rest_framework')),
    path('register/', RegisterView.as_view({'post': 'create'}), name='register'),
    path('create-checkout-session/', views.create_checkout_session, name='create_checkout_session'),
    path('webhooks/stripe/', views.stripe_webhook, name='stripe_webhook'),
]
