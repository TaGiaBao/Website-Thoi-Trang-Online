// Hàm tìm kiếm sản phẩm
function searchProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if(!searchTerm) {
        displaySearchResults([], '');
        return;
    }
    
    // Lấy tất cả sản phẩm
    let allProducts = [];
    Object.keys(productsData).forEach(category => {
        allProducts = allProducts.concat(productsData[category]);
    });
    
    // Lọc sản phẩm theo keyword
    const results = allProducts.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
               product.id.toString().includes(searchTerm);
    });
    
    // Sắp xếp theo độ liên quan (tên đúng xác hơn lên trước)
    results.sort((a, b) => {
        const aIndex = a.name.toLowerCase().indexOf(searchTerm);
        const bIndex = b.name.toLowerCase().indexOf(searchTerm);
        return aIndex - bIndex;
    });
    
    displaySearchResults(results, searchTerm);
}

// Hiển thị kết quả tìm kiếm
function displaySearchResults(results, searchTerm) {
    const container = document.getElementById('productGrid');
    const searchInfo = document.getElementById('searchInfo');
    
    if(searchInfo) {
        if(searchTerm) {
            searchInfo.textContent = `Tìm thấy ${results.length} sản phẩm cho: "${searchTerm}"`;
        } else {
            searchInfo.textContent = 'Nhập từ khóa để tìm kiếm';
        }
    }
    
    if(results.length === 0) {
        container.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 60px 20px;">Không tìm thấy sản phẩm nào. Vui lòng thử từ khóa khác.</p>';
        return;
    }
    
    let html = '';
    results.forEach(product => {
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
    
    container.innerHTML = html;
}

// Khởi tạo trang tìm kiếm
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if(query) {
        if(searchInput) searchInput.value = query;
        searchProducts();
    }
}

// Hàm tìm kiếm từ header (global)
function performHeaderSearch() {
    const headerSearchInput = document.querySelector('.search-bar input');
    if(headerSearchInput) {
        const searchTerm = headerSearchInput.value.trim();
        if(searchTerm) {
            // Redirect to search page with query
            window.location.href = `/Pages/tim-kiem.html?q=${encodeURIComponent(searchTerm)}`;
        }
    }
}