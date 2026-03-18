document.addEventListener('DOMContentLoaded', function() {
    renderCart();
});

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('STUPID_DOG_CART')) || [];
    const cartList = document.getElementById('cartList');
    let totalVND = 0;

    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="empty-cart">
                <p>Giỏ hàng của bạn đang trống.</p>
                <a href="san-pham.html">Đi mua sắm ngay!</a>
            </div>`;
        updateSummary(0);
        return;
    }

    let html = '';
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        totalVND += itemTotal;
        
        html += `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p class="price">${item.price.toLocaleString('vi-VN')}đ</p>
                    <div class="quantity-controls">
                        <button onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="item-remove">
                    <button onclick="removeItem(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    cartList.innerHTML = html;
    updateSummary(totalVND);
}

function changeQty(index, delta) {
    let cart = JSON.parse(localStorage.getItem('STUPID_DOG_CART'));
    cart[index].quantity += delta;
    
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    
    localStorage.setItem('STUPID_DOG_CART', JSON.stringify(cart));
    renderCart();
    // Gọi hàm update số lượng trên Menu (nếu có)
    if(typeof updateCartCount === 'function') updateCartCount();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('STUPID_DOG_CART'));
    cart.splice(index, 1);
    localStorage.setItem('STUPID_DOG_CART', JSON.stringify(cart));
    renderCart();
    if(typeof updateCartCount === 'function') updateCartCount();
}

function updateSummary(total) {
    const currency = localStorage.getItem('currency') || 'VND';
    const subtotalEl = document.getElementById('subtotal');
    const finalTotalEl = document.getElementById('finalTotal');

    if(currency === 'USD') {
        const usd = (total / 25000).toFixed(2);
        subtotalEl.innerText = `$${usd}`;
        finalTotalEl.innerText = `$${usd}`;
    } else {
        subtotalEl.innerText = total.toLocaleString('vi-VN') + 'đ';
        finalTotalEl.innerText = total.toLocaleString('vi-VN') + 'đ';
    }
}