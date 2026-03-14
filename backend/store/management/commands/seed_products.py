from django.core.management.base import BaseCommand
from django.utils.text import slugify
from store.models import Category, Product


class Command(BaseCommand):
    help = 'Seed the database with example product data (categories + products).'

    def handle(self, *args, **options):
        categories = [
            'Men',
            'Women',
            'Shoes',
            'Clothing',
            'Accessories',
            'Sports',
            'Outdoor',
            'Training',
        ]

        category_objs = {}
        for name in categories:
            cat, created = Category.objects.get_or_create(
                slug=slugify(name),
                defaults={'name': name},
            )
            category_objs[name] = cat
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {name}'))

        product_templates = [
            {
                'name': 'Speed Runner Sneakers',
                'brand': 'PureFit',
                'description': 'Lightweight running shoes with breathable mesh and responsive foam.',
                'color': 'Black/White',
                'size': '42 EU',
                'price': 89.99,
                'category': category_objs['Shoes'],
                'stock': 120,
            },
            {
                'name': 'Everyday Hoodie',
                'brand': 'UrbanFlex',
                'description': 'Soft cotton blend hoodie with a relaxed fit and front kangaroo pocket.',
                'color': 'Charcoal Grey',
                'size': 'M',
                'price': 59.99,
                'category': category_objs['Clothing'],
                'stock': 80,
            },
            {
                'name': 'Lightweight Training Shorts',
                'brand': 'MotionPro',
                'description': 'Moisture-wicking shorts with stretch side panels for full range of motion.',
                'color': 'Navy Blue',
                'size': 'L',
                'price': 34.99,
                'category': category_objs['Training'],
                'stock': 60,
            },
            {
                'name': 'Classic Snapback Cap',
                'brand': 'StreetLine',
                'description': 'Adjustable fit cap with embroidered logo and structured front.',
                'color': 'Black',
                'size': 'One Size',
                'price': 24.99,
                'category': category_objs['Accessories'],
                'stock': 200,
            },
            {
                'name': 'Performance Running Tee',
                'brand': 'PureFit',
                'description': 'Quick-dry tee with reflective accents for early morning runs.',
                'color': 'Orange',
                'size': 'S',
                'price': 29.99,
                'category': category_objs['Sports'],
                'stock': 90,
            },
            {
                'name': 'Mid-Weight Track Jacket',
                'brand': 'UrbanFlex',
                'description': 'Zip-up jacket with side pockets and breathable mesh lining.',
                'color': 'Blue/Grey',
                'size': 'L',
                'price': 75.0,
                'category': category_objs['Men'],
                'stock': 50,
            },
            {
                'name': 'High-Rise Leggings',
                'brand': 'MotionPro',
                'description': 'Stretchy high-waisted leggings with hidden waistband pocket.',
                'color': 'Black',
                'size': 'M',
                'price': 49.99,
                'category': category_objs['Women'],
                'stock': 110,
            },
            {
                'name': 'Everyday Backpack',
                'brand': 'StreetLine',
                'description': 'Durable backpack with laptop sleeve and water-resistant finish.',
                'color': 'Olive',
                'size': 'One Size',
                'price': 69.99,
                'category': category_objs['Outdoor'],
                'stock': 45,
            },
        ]

        # Duplicate templates with small variations to create ~30 products
        products_created = 0
        for idx in range(1, 31):
            template = product_templates[(idx - 1) % len(product_templates)]
            name = f"{template['name']} {idx}"
            price = template['price'] + (idx % 10) * 2
            stock = template['stock']

            product, created = Product.objects.get_or_create(
                name=name,
                defaults={
                    'description': template['description'],
                    'price': price,
                    'category': template['category'],
                    'size': template['size'],
                    'color': template['color'],
                    'brand': template['brand'],
                    'stock': stock,
                },
            )
            if created:
                products_created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {products_created} example products.'))
