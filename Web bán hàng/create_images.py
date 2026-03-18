from PIL import Image, ImageDraw, ImageFont
import os

# Tạo các thư mục nếu chưa có
os.makedirs('Asset/img/background', exist_ok=True)
os.makedirs('Asset/img/logo', exist_ok=True)
os.makedirs('Asset/img/product', exist_ok=True)

# 1. Logo placeholder (200x80)
logo = Image.new('RGB', (200, 80), color='#000000')
draw = ImageDraw.Draw(logo)
draw.text((50, 30), 'LOGO', fill='#FFFFFF')
logo.save('Asset/img/logo/logo.png')
print('✓ Logo created')

# 2. Background placeholder (1200x500)
bg = Image.new('RGB', (1200, 500), color='#eeeeee')
draw = ImageDraw.Draw(bg)
draw.text((500, 220), 'BACKGROUND', fill='#999999')
bg.save('Asset/img/background/hero-bg.png')
print('✓ Background created')

# 3. Tạo ảnh sản phẩm (300x350) - mặt trước
product_front = Image.new('RGB', (300, 350), color='#dddddd')
draw = ImageDraw.Draw(product_front)
draw.rectangle([50, 50, 250, 250], fill='#999999')
draw.text((90, 150), 'PRODUCT', fill='#FFFFFF')
product_front.save('Asset/img/product/quan-au-1.jpg')
print('✓ Product front created')

# 4. Ảnh sản phẩm - mặt sau (hover)
product_back = Image.new('RGB', (300, 350), color='#cccccc')
draw = ImageDraw.Draw(product_back)
draw.rectangle([50, 50, 250, 250], fill='#888888')
draw.text((100, 150), 'BACK VIEW', fill='#FFFFFF')
product_back.save('Asset/img/product/quan-au-1-back.jpg')
print('✓ Product back created')

print('')
print('✓ Tất cả ảnh tạm đã tạo xong!')
