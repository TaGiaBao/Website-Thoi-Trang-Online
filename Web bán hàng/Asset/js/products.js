// Dữ liệu sản phẩm
const productsData = {
    'quan-au': [
        { id: 1, name: 'Quần Âu Aristino', price: 850000, img: '../Asset/img/product/quan-au-1.jpg', back: '../Asset/img/product/quan-au-1-back.jpg', badge: 'NEW', size: ['S', 'M', 'L', 'XL'] },
        { id: 2, name: 'Quần Âu Premium', price: 950000, img: '../Asset/img/product/quan-au-2.jpg', back: '../Asset/img/product/quan-au-2-back.jpg', badge: '-20%', size: ['S', 'M', 'L'] },
        { id: 3, name: 'Quần Âu Classic', price: 750000, img: '../Asset/img/product/quan-au-3.jpg', back: '../Asset/img/product/quan-au-3-back.jpg', badge: 'SOLD OUT', size: ['L', 'XL'] },
        { id: 4, name: 'Quần Âu Limited', price: 1200000, img: '../Asset/img/product/quan-au-4.jpg', back: '../Asset/img/product/quan-au-4-back.jpg', badge: 'HOT', size: ['M', 'L', 'XL', 'XXL'] },
    ],
    'ao-nam': [
        { id: 5, name: 'Áo Thun Graphic 1', price: 350000, img: '../Asset/img/product/ao-thun-1.jpg', back: '../Asset/img/product/ao-thun-1-back.jpg', badge: 'NEW', size: ['XS', 'S', 'M', 'L', 'XL'] },
        { id: 6, name: 'Áo Thun Graphic 2', price: 380000, img: '../Asset/img/product/ao-thun-2.jpg', back: '../Asset/img/product/ao-thun-2-back.jpg', badge: '', size: ['S', 'M', 'L'] },
        { id: 7, name: 'Áo Polo Basic', price: 450000, img: '../Asset/img/product/ao-polo-1.jpg', back: '../Asset/img/product/ao-polo-1-back.jpg', badge: '-15%', size: ['M', 'L', 'XL'] },
        { id: 8, name: 'Sơ Mi Oversize', price: 520000, img: '../Asset/img/product/ao-somi-1.jpg', back: '../Asset/img/product/ao-somi-1-back.jpg', badge: 'HOT', size: ['M', 'L', 'XL', 'XXL'] },
    ],
    'phu-kien': [
        { id: 9, name: 'Thắt Lưng Da Cao Cấp', price: 280000, img: '../Asset/img/product/that-lung-1.jpg', back: '../Asset/img/product/that-lung-1-back.jpg', badge: '', size: ['Free'] },
        { id: 10, name: 'Ví Chia Khoá', price: 180000, img: '../Asset/img/product/vi-1.jpg', back: '../Asset/img/product/vi-1-back.jpg', badge: 'NEW', size: ['Free'] },
        { id: 11, name: 'Mũ Lưỡi Trai', price: 220000, img: '../Asset/img/product/mu-1.jpg', back: '../Asset/img/product/mu-1-back.jpg', badge: '', size: ['Free'] },
        { id: 12, name: 'Giày Sneaker', price: 890000, img: '../Asset/img/product/giay-1.jpg', back: '../Asset/img/product/giay-1-back.jpg', badge: 'HOT', size: ['36', '37', '38', '39', '40', '41', '42', '43'] },
    ]
};

// Hàm hiển thị sản phẩm
function renderProducts(category, sortBy = 'newest', priceMin = 0, priceMax = Infinity) {
    const products = productsData[category] || [];
    const container = document.getElementById('productGrid');
    
    // Lọc theo giá
    let filtered = products.filter(p => p.price >= priceMin && p.price <= priceMax);
    
    // Sắp xếp
    switch(sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => b.id - a.id);
    }
    
    // Render HTML
    let html = '';
    filtered.forEach(product => {
        const badgeHtml = product.badge ? `<span class="badge">${product.badge}</span>` : '';
        html += `
            <div class="product-card">
                <div class="product-thumb">
                    ${badgeHtml}
                    <img src="${product.img}" alt="${product.name}" class="img-main">
                    <img src="${product.back}" alt="Back" class="img-hover">
                    <button class="add-to-cart-btn" onclick="addToCart('${product.name}', ${product.price}, '${product.img}')">
                        THÊM VÀO GIỎ
                    </button>
                </div>
                <div class="product-info">
                    <p class="brand">STUPID DOG 90S</p>
                    <h3 class="name">${product.name}</h3>
                    <p class="product-price" data-vnd="${product.price}">${product.price.toLocaleString('vi-VN')}đ</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html || '<p style="text-align: center;">Không có sản phẩm nào</p>';
    updateProductCount(filtered.length);
}

// Cập nhật số lượng sản phẩm
function updateProductCount(count) {
    const countEl = document.getElementById('productCount');
    if(countEl) {
        countEl.textContent = count;
    }
}

// Event listeners cho filter & sort
document.addEventListener('DOMContentLoaded', function() {
    const sortSelect = document.getElementById('sortBy');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    
    if(sortSelect) {
        sortSelect.addEventListener('change', function() {
            const category = document.body.getAttribute('data-category');
            const priceMax = priceRange ? parseInt(priceRange.value) : Infinity;
            renderProducts(category, this.value, 0, priceMax);
        });
    }
    
    if(priceRange) {
        priceRange.addEventListener('input', function() {
            priceValue.textContent = parseInt(this.value).toLocaleString('vi-VN');
            const category = document.body.getAttribute('data-category');
            const sortBy = sortSelect ? sortSelect.value : 'newest';
            renderProducts(category, sortBy, 0, parseInt(this.value));
        });
    }
});
