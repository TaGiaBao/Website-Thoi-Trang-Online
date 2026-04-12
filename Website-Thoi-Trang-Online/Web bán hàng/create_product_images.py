from PIL import Image, ImageDraw
import os

# Tạo ảnh cho các loại sản phẩm
categories = {
    'ao-nam': [
        {'name': 'ao-thun-1.jpg', 'back': 'ao-thun-1-back.jpg', 'color': '#d4a574', 'box': '#a08968'},
        {'name': 'ao-thun-2.jpg', 'back': 'ao-thun-2-back.jpg', 'color': '#c9baa0', 'box': '#998877'},
        {'name': 'ao-polo-1.jpg', 'back': 'ao-polo-1-back.jpg', 'color': '#e8d5c4', 'box': '#b8a59c'},
        {'name': 'ao-somi-1.jpg', 'back': 'ao-somi-1-back.jpg', 'color': '#d9d9d9', 'box': '#a9a9a9'},
    ],
    'phu-kien': [
        {'name': 'that-lung-1.jpg', 'back': 'that-lung-1-back.jpg', 'color': '#8b6f47', 'box': '#6b4423'},
        {'name': 'vi-1.jpg', 'back': 'vi-1-back.jpg', 'color': '#3d3d3d', 'box': '#1a1a1a'},
        {'name': 'mu-1.jpg', 'back': 'mu-1-back.jpg', 'color': '#d4a469', 'box': '#a48249'},
        {'name': 'giay-1.jpg', 'back': 'giay-1-back.jpg', 'color': '#ffffff', 'box': '#cccccc'},
    ]
}

for category, products in categories.items():
    for p in products:
        # Front
        img = Image.new('RGB', (300, 350), color=p['color'])
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 250, 250], fill=p['box'])
        text = p['name'].replace('.jpg', '').upper()
        draw.text((50, 150), text, fill='#FFFFFF')
        img.save(f"Asset/img/product/{p['name']}")
        
        # Back
        img_back = Image.new('RGB', (300, 350), color=p['color'])
        draw_back = ImageDraw.Draw(img_back)
        draw_back.rectangle([50, 50, 250, 250], fill=p['box'])
        draw_back.text((60, 150), 'BACK VIEW', fill='#FFFFFF')
        img_back.save(f"Asset/img/product/{p['back']}")
        
        print(f"✓ {p['name']} created")

print('✓ Hoàn tất tất cả ảnh!')