document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    // attach checkout handler for static Live Server mode
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            handleCheckout();
        });
    }
});

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('STUPID_DOG_CART')) || [];
    const cartList = document.getElementById('cartList');
    let totalVND = 0;

    if (!cartList) return; // nothing to render
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

    if (!subtotalEl || !finalTotalEl) return;
    if(currency === 'USD') {
        const usd = (total / 25000).toFixed(2);
        subtotalEl.innerText = `$${usd}`;
        finalTotalEl.innerText = `$${usd}`;
    } else {
        subtotalEl.innerText = total.toLocaleString('vi-VN') + 'đ';
        finalTotalEl.innerText = total.toLocaleString('vi-VN') + 'đ';
    }
}

// Create an order in localStorage and notify admin (static preview)
function handleCheckout() {
    const cart = JSON.parse(localStorage.getItem('STUPID_DOG_CART')) || [];
    if (!cart.length) {
        alert('Giỏ hàng rỗng');
        return;
    }
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) {
        if (!confirm('Bạn chưa đăng nhập. Tiếp tục như khách?')) return;
    }
    const total = cart.reduce((s, it) => s + it.price * it.quantity, 0);
    const orders = JSON.parse(localStorage.getItem('staticOrders') || '[]');
    const orderId = Date.now();
    const order = {
        id: orderId,
        user: user ? { id: user.id, name: user.name, email: user.email } : { id: null, name: 'Khách', email: null },
        items: cart,
        total,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    orders.push(order);
    localStorage.setItem('staticOrders', JSON.stringify(orders));

    // admin notifications
    const notes = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    notes.push({ id: Date.now(), orderId, message: `Đơn hàng mới từ ${order.user.name}`, read: false, created_at: new Date().toISOString() });
    localStorage.setItem('adminNotifications', JSON.stringify(notes));

    // clear cart
    localStorage.removeItem('STUPID_DOG_CART');
    cart.length = 0;
    renderCart();
    if (typeof updateCartCount === 'function') updateCartCount();
    alert('Đặt hàng thành công! Cảm ơn bạn.');
    // Redirect to the correct site root index depending on current path
    try {
        if (window.location.pathname.includes('/Pages/')) {
            // cart page lives in /Pages/, so go one level up
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    } catch (e) {
        window.location.href = 'index.html';
    }
}