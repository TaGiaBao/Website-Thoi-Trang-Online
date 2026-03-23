document.addEventListener("DOMContentLoaded", function() {
    // Load Menu - chỉ load nếu chưa có menu-container
    if (!document.getElementById('menu-container')) {
        const isRootPath = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
        const menuPath = isRootPath ? 'Pages/menu-template.html' : 'menu-template.html';
        
        fetch(menuPath)
            .then(res => res.text())
            .then(data => {
                // Fix paths based on current location
                if (!isRootPath) {
                    // If in Pages folder, adjust relative paths
                    // Replace Asset/ with ../Asset/ for images
                    data = data.replace(/src="Asset\//g, 'src="../Asset/');
                    data = data.replace(/href="\/Asset\//g, 'href="../Asset/');
                    // Replace /Pages/xxx.html with xxx.html for navigation
                    data = data.replace(/href="\/Pages\//g, 'href="');
                    // Replace ./index.html with ../index.html for home link
                    data = data.replace(/href="\.\/index.html"/g, 'href="../index.html"');
                } else {
                    // If at root, already OK with ./index.html
                    // No need to change anything, . is relative to current dir
                }
                document.body.insertAdjacentHTML('afterbegin', data);
                updateCartCount();
            })
            .catch(err => console.error('Error loading menu:', err));
    }
});

// Khởi tạo giỏ hàng từ LocalStorage hoặc mảy rỗng
let cart = JSON.parse(localStorage.getItem('STUPID_DOG_CART')) || [];

function addToCart(name, price, img) {
    const item = { name, price, img, quantity: 1 };
    
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const index = cart.findIndex(i => i.name === name);
    if(index > -1) {
        cart[index].quantity += 1;
    } else {
        cart.push(item);
    }
    
    // Lưu lại và cập nhật số hiển thị trên Menu
    localStorage.setItem('STUPID_DOG_CART', JSON.stringify(cart));
    updateCartCount();
    alert("Đã thêm " + name + " vào giỏ hàng!");
}

function updateCartCount() {
    const countElement = document.querySelector('.cart-count');
    if(countElement) {
        const cart = JSON.parse(localStorage.getItem('STUPID_DOG_CART')) || [];
        const total = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.innerText = total;
    }
}

// Chạy hàm cập nhật số lượng khi trang load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateCartCount, 100);
    window.addEventListener('focus', updateCartCount);
    
    // Load login modal
    const isRootPath = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    const loginModalPath = isRootPath ? 'Pages/login-modal.html' : 'login-modal.html';
    
    fetch(loginModalPath)
        .then(res => res.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
        })
        .catch(err => console.log('Modal load skipped'));
    
    // Global image error fallback: set missing images to a valid product image
    document.addEventListener('error', function(e) {
        const t = e.target;
        if (t && t.tagName === 'IMG' && t.src) {
            // if image cannot load, replace with existing product image
            t.src = 'Asset/img/product/quan-au-1.jpg';
        }
    }, true);
});