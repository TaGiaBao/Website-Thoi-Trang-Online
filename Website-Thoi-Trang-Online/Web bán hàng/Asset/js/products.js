// Lấy dữ liệu sản phẩm từ API PHP
async function fetchProducts(category) {
    try {
        const url = `../api/products.json`;
        console.log('[products] fetching static JSON', url);
        const resp = await fetch(url);
        if (!resp.ok) {
            console.error('[products] fetch failed', resp.status);
            return [];
        }
        const data = await resp.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('[products] fetch error', e);
        return [];
    }
}

// Normalize image path depending on current page location
function normalizeImgPath(path) {
    if (!path) return path;
    const isInPages = window.location.pathname.includes('/Pages/');
    // already relative up one level (Pages -> ../Asset)
    if (path.startsWith('../') || path.startsWith('./')) return path;
    // absolute-like starting with / => remove leading slash and adjust
    if (path.startsWith('/')) {
        path = path.substring(1);
    }
    // common stored format: Asset/img/...
    if (path.startsWith('Asset/')) {
        return (isInPages ? '../' : '') + path;
    }
    // already Asset path without prefix handled, otherwise return as-is
    return path;
}

// Dữ liệu tĩnh dự phòng (sử dụng khi API không trả dữ liệu)
const staticProductsData = {
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

// Nếu API trả rỗng, dùng dữ liệu tĩnh
async function fetchWithFallback(category) {
    const apiData = await fetchProducts(category);
    if (apiData.length > 0) return apiData.map(p => ({ ...p, product_id: p.product_id || p.id }));

    // build fallback
    if (!category) {
        // all categories
        let all = [];
        Object.keys(staticProductsData).forEach(cat => {
            const arr = staticProductsData[cat].map(p => ({ ...p, product_id: p.id }));
            all = all.concat(arr);
        });
        return all;
    }
    const catArr = staticProductsData[category] || [];
    return catArr.map(p => ({ ...p, product_id: p.id }));
}

// Hàm hiển thị sản phẩm (lấy dữ liệu trước)
async function renderProducts(category, sortBy = 'newest', priceMin = 0, priceMax = Infinity) {
    const products = await fetchWithFallback(category);
    const container = document.getElementById('productGrid');

    let filtered = products.filter(p => {
        const price = Number(p.price) || 0;
        return price >= priceMin && price <= priceMax;
    });

    // Sắp xếp
    switch(sortBy) {
        case 'price-low':
            filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
            break;
        case 'price-high':
            filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
            break;
        case 'name':
            filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi'));
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => (Number(b.product_id) || 0) - (Number(a.product_id) || 0));
    }

    // Render HTML
    let html = '';
    filtered.forEach(product => {
        const badgeHtml = product.badge ? `<span class="badge">${product.badge}</span>` : '';
        const rawImg = product.img || product.image || 'Asset/img/product/quan-au-1.jpg';
        const rawBack = product.back || rawImg;
        const img = normalizeImgPath(rawImg);
        const back = normalizeImgPath(rawBack);
        const basePrice = Number(product.price) || 0;
        const discounts = JSON.parse(localStorage.getItem('productDiscounts') || '{}');
        const d = discounts[product.product_id || product.id] || { active: false, percent: 0 };
        let priceHtml = '';
        if (d && d.active && d.percent > 0) {
            const discounted = Math.round(basePrice * (1 - d.percent/100));
            priceHtml = `<p class="product-price"><span class="old-price">${basePrice.toLocaleString('vi-VN')}đ</span> <span class="new-price">${discounted.toLocaleString('vi-VN')}đ</span></p>`;
        } else {
            priceHtml = `<p class="product-price" data-vnd="${basePrice}">${basePrice.toLocaleString('vi-VN')}đ</p>`;
        }
        html += `
            <div class="product-card">
                <div class="product-thumb">
                    ${badgeHtml}
                    <img src="${img}" alt="${product.name}" class="img-main" onerror="this.onerror=null;this.src='../Asset/img/product/quan-au-1.jpg'">
                    <img src="${back}" alt="Back" class="img-hover" onerror="this.onerror=null;this.src='../Asset/img/product/quan-au-1.jpg'">
                    <button class="add-to-cart-btn" onclick="addToCart('${(product.name||'').replace(/'/g, "\\'")}', ${basePrice}, '${img}')">
                        THÊM VÀO GIỎ
                    </button>
                </div>
                <div class="product-info">
                    <p class="brand">STUPID DOG 90S</p>
                    <h3 class="name">${product.name || ''}</h3>
                    ${priceHtml}
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