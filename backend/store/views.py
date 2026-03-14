from django.db.models import Q
from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from django.contrib.auth.models import User
from .models import Product, Category, CartItem, Cart
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .serializers import ProductSerializer, CategorySerializer, UserSerializer, RegisterSerializer, CartItemSerializer
from rest_framework.permissions import IsAuthenticated


class RegisterView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get(
            'search') or self.request.query_params.get('q')
        if q:
            return qs.filter(
                Q(name__icontains=q) |
                Q(description__icontains=q) |
                Q(brand__icontains=q) |
                Q(color__icontains=q)
            )

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        return qs


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class Store(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        return self.request.user


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.all()
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(
            cart=cart, product_id=product_id)
        if not created:
            item.quantity += quantity
            item.save()
        serializer = CartItemSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def remove(self, request):
        product_id = request.data.get('product_id')
        cart = Cart.objects.get(user=request.user)
        try:
            item = CartItem.objects.get(cart=cart, product_id=product_id)
            item.delete()
            return Response({'status': 'item removed'})
        except CartItem.DoesNotExist:
            return Response({'error': 'item not in cart'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """A simple checkout placeholder. Replace with a real payment provider integration."""
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.all()
        if not items.exists():
            return Response({'error': 'cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        total = sum(item.product.price * item.quantity for item in items)
        # TODO: integrate with a real payment provider (Stripe, PayPal, etc.)
        items.delete()
        return Response({'status': 'success', 'total': total})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Get current user profile
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        # Add any other user fields you need
    })
