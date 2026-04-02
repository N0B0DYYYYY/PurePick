from django.db.models import Q
from django.shortcuts import render
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets, permissions, status
from django.contrib.auth.models import User
from .models import Product, Category, CartItem, Cart, Order, OrderItem
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from .serializers import ProductSerializer, CategorySerializer, UserSerializer, RegisterSerializer, CartItemSerializer
from rest_framework.permissions import IsAuthenticated
import stripe
import logging

logger = logging.getLogger(__name__)


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


@csrf_exempt
def stripe_webhook(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    # we want to verify the webhook signature to ensure it's from Stripe
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )

    except ValueError as e:
        # Invalid payload
        return JsonResponse({'error': 'Invalid payload'}, status=400)

    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return JsonResponse({'error': 'Invalid signature'}, status=400)

    # handle the event

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata']['user_id']
        cart_id = session['metadata']['cart_id']
        cart = Cart.objects.get(id=cart_id)
        user = User.objects.get(id=user_id)

        order = Order.objects.create(
            user=user,
            total_amount=session["amount_total"] / 100,
            status=Order.PAID,
            stripe_session_id=session["id"],
            stripe_payment_intent=session.get("payment_intent"),
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product_name=item.product.name,
                unit_price=item.product.price,
                quantity=item.quantity,
                total_price=item.product.price * item.quantity,
            )

        cart.items.all().delete()

    return JsonResponse({'status': 'success'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    user = request.user
    cart = Cart.objects.get(user=user)
    items = cart.items.all()

    if not items.exists():
        return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    # Create line items for Stripe

    line_items = []

    for item in items:
        line_items.append({
            'price_data': {
                'currency': 'usd',
                # Stripe expects amount in cents
                'unit_amount': int(item.product.price * 100),
                'product_data': {
                    'name': item.product.name,
                    'description': item.product.description[:255] if item.product.description else '',
                },
            },
            'quantity': item.quantity,
        })

    try:
        # Create a Stripe Checkout Session

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            # redirect to success page after payment
            success_url='http://localhost:5173/checkout/success',
            # redirect to cancel page if payment is cancelled
            cancel_url='http://localhost:5173/checkout/cancel',
            metadata={
                'user_id': str(user.id),
                'cart_id': str(cart.id)
            }
        )

        return Response({
            'sessionId': session.id,
            'url': session.url
        })

    except Exception as e:
        logger.error(f"Stripe checkout error: {str(e)}", exc_info=True)
        print(f"ERROR: {str(e)}")
        return Response({'error': str(e)}, status=400)
