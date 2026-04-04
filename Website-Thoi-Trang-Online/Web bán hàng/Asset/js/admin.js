document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Bạn cần đăng nhập bằng tài khoản admin để truy cập trang này.');
        window.location.href = '../../index.html';
        return;
    }

    // cập nhật element hiển thị tên admin (tương thích nhiều id)
    const adminInfoEl = document.getElementById('adminInfo') || document.getElementById('admin-welcome') || document.getElementById('admin-welcome-text');
    if (adminInfoEl) adminInfoEl.innerText = `Xin chào, ${currentUser.name} (${currentUser.email})`;
    loadNotifications();
    loadOrders();
    initDiscountManager();
    initUserManager();
});

function loadNotifications() {
    const notes = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const ul = document.getElementById('notificationsList');
    ul.innerHTML = '';
    if (!notes.length) {
        ul.innerHTML = '<li>Không có thông báo</li>';
        return;
    }
    notes.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    notes.forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = `${n.message} <small style="color:#666">(${new Date(n.created_at).toLocaleString()})</small> ${n.read?'<strong>(Đã đọc)</strong>':'<button onclick="markRead('+n.id+')">Đánh dấu đã đọc</button>'}`;
        ul.appendChild(li);
    });
}

function markRead(id) {
    const notes = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const n = notes.find(x => x.id === id);
    if (n) n.read = true;
    localStorage.setItem('adminNotifications', JSON.stringify(notes));
    loadNotifications();
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('staticOrders') || '[]');
    const ul = document.getElementById('ordersList');
    const stats = document.getElementById('stats');
    ul.innerHTML = '';
    if (!orders.length) {
        ul.innerHTML = '<li>Chưa có đơn hàng nào</li>';
        stats.innerText = 'Doanh thu: 0đ';
        return;
    }
    orders.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    let total = 0;
    orders.forEach(o => {
        total += o.total || 0;
        const li = document.createElement('li');
        li.innerHTML = `<strong>#${o.id}</strong> - ${o.user.name} - ${o.items.length} sản phẩm - ${(o.total||0).toLocaleString('vi-VN')}đ - <small>${new Date(o.created_at).toLocaleString()}</small>`;
        ul.appendChild(li);
    });
    stats.innerText = 'Doanh thu: ' + total.toLocaleString('vi-VN') + 'đ';
}

// normalize image path for admin pages (shared helper)
function normalizeAdminImg(path) {
    if (!path) return '../../Asset/img/product/quan-au-1.jpg';
    // If path already relative up one level (Pages -> ../Asset) or starts with ./ keep
    if (path.startsWith('../') || path.startsWith('./')) return path;
    if (path.startsWith('/')) path = path.substring(1);
    let prefix = '';
    if (window.location.pathname.includes('/Pages/admin/')) prefix = '../../';
    else if (window.location.pathname.includes('/Pages/')) prefix = '../';
    if (path.startsWith('Asset/')) return prefix + path;
    return prefix + path;
}

// Discount manager
async function initDiscountManager() {
    const refreshBtn = document.getElementById('refreshProductsBtn');
    const saveBtn = document.getElementById('saveDiscountsBtn');
    refreshBtn && refreshBtn.addEventListener('click', renderDiscountControls);
    saveBtn && saveBtn.addEventListener('click', saveDiscounts);
    // initial render
    renderDiscountControls();
}

// Product manager (admin CRUD for products)
async function initProductManager() {
    document.getElementById('productForm') && document.getElementById('productForm').addEventListener('submit', onSaveProductForm);
    document.getElementById('cancelProductBtn') && document.getElementById('cancelProductBtn').addEventListener('click', onCancelEditProduct);
    document.getElementById('refreshProductsBtn') && document.getElementById('refreshProductsBtn').addEventListener('click', renderProductManager);
    document.getElementById('exportProductsBtn') && document.getElementById('exportProductsBtn').addEventListener('click', exportProductsJson);
    await renderProductManager();
}

async function renderProductManager() {
    const base = await fetchProductsForAdmin();
    const adminSaved = JSON.parse(localStorage.getItem('adminProducts') || 'null');
    let list = base.slice();
    if (adminSaved && Array.isArray(adminSaved)) {
        // merge admin saved: replace items with same id, append new ones
        const map = {};
        list.forEach(p => { map[String(p.product_id || p.id)] = p; });
        adminSaved.forEach(p => { map[String(p.id)] = p; });
        list = Object.keys(map).map(k => map[k]);
    }
    const out = document.getElementById('productsList');
    out.innerHTML = '';
    if (!list.length) { out.innerHTML = '<p>Không có sản phẩm</p>'; return; }
    const table = document.createElement('table');
    table.style.width = '100%';
    table.innerHTML = `<thead><tr><th>ID</th><th>Tên</th><th>Ảnh</th><th>Giá</th><th>Thể loại</th><th>Hành động</th></tr></thead>`;
    const tbody = document.createElement('tbody');
    list.sort((a,b) => (Number(b.product_id||b.id)||0) - (Number(a.product_id||a.id)||0));
    list.forEach(p => {
        const id = p.product_id || p.id;
        const img = normalizeAdminImg(p.img || p.image || p.image_url || 'Asset/img/product/quan-au-1.jpg');
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${id}</td><td>${p.name||''}</td><td><img src="${img}" style="height:48px;object-fit:cover"></td><td>${(Number(p.price)||0).toLocaleString('vi-VN')}đ</td><td>${p.category||''}</td><td>
            <button class="editProductBtn" data-id="${id}">Sửa</button>
            <button class="deleteProductBtn" data-id="${id}">Xóa</button>
        </td>`;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    out.appendChild(table);
    Array.from(out.querySelectorAll('.editProductBtn')).forEach(b => b.addEventListener('click', () => onEditProduct(b.getAttribute('data-id'))));
    Array.from(out.querySelectorAll('.deleteProductBtn')).forEach(b => b.addEventListener('click', () => onDeleteProduct(b.getAttribute('data-id'))));
}

async function onEditProduct(id) {
    const base = await fetchProductsForAdmin();
    const adminSaved = JSON.parse(localStorage.getItem('adminProducts') || 'null') || [];
    const list = (adminSaved && Array.isArray(adminSaved)) ? adminSaved.concat(base.filter(b=>!adminSaved.find(a=>String(a.id)===String(b.product_id||b.id)))) : base;
    const p = list.find(x => String(x.product_id||x.id) === String(id));
    if (!p) return alert('Không tìm thấy sản phẩm');
    document.getElementById('productId').value = p.product_id || p.id || '';
    document.getElementById('productName').value = p.name || '';
    document.getElementById('productPrice').value = p.price || '';
    document.getElementById('productImg').value = p.img || p.image || '';
    document.getElementById('productBack').value = p.back || '';
    document.getElementById('productCategory').value = p.category || '';
    document.getElementById('productBadge').value = p.badge || '';
}

function onCancelEditProduct() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    document.getElementById('productId').value = '';
}

async function onSaveProductForm(e) {
    e.preventDefault();
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const price = Number(document.getElementById('productPrice').value) || 0;
    const img = document.getElementById('productImg').value.trim();
    const back = document.getElementById('productBack').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const badge = document.getElementById('productBadge').value.trim();
    let adminSaved = JSON.parse(localStorage.getItem('adminProducts') || 'null');
    if (!adminSaved || !Array.isArray(adminSaved)) adminSaved = [];
    if (id) {
        const idx = adminSaved.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
            adminSaved[idx] = { ...adminSaved[idx], name, price, img, back, category, badge };
        } else {
            adminSaved.push({ id, name, price, img, back, category, badge });
        }
    } else {
        const newId = Date.now();
        adminSaved.push({ id: newId, name, price, img, back, category, badge });
    }
    localStorage.setItem('adminProducts', JSON.stringify(adminSaved));
    onCancelEditProduct();
    await renderProductManager();
    alert('Lưu sản phẩm thành công (lưu tạm trong trình duyệt)');
}

async function onDeleteProduct(id) {
    if (!confirm('Xác nhận xóa sản phẩm này?')) return;
    let adminSaved = JSON.parse(localStorage.getItem('adminProducts') || 'null');
    if (adminSaved && Array.isArray(adminSaved)) {
        adminSaved = adminSaved.filter(x => String(x.id) !== String(id));
        localStorage.setItem('adminProducts', JSON.stringify(adminSaved));
    } else {
        // mark deletion by adding negative marker
        adminSaved = [{ id: id, _deleted: true }];
        localStorage.setItem('adminProducts', JSON.stringify(adminSaved));
    }
    await renderProductManager();
}

async function exportProductsJson() {
    const adminSaved = JSON.parse(localStorage.getItem('adminProducts') || 'null');
    const base = await fetchProductsForAdmin();
    const merged = (adminSaved && Array.isArray(adminSaved)) ? (()=>{
        const map = {};
        base.forEach(p=> map[String(p.product_id||p.id)] = p);
        adminSaved.forEach(p=> map[String(p.id)] = p);
        return Object.keys(map).map(k=>map[k]);
    })() : base;
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'products-export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    alert('Tải xuống xong: products-export.json — đặt tệp này vào `api/products.json` nếu muốn cập nhật file server.');
}

async function fetchProductsForAdmin() {
    // Try several candidate paths to handle Live Server base path differences
    const candidates = [];
    // relative guesses
    if (window.location.pathname.includes('/Pages/admin/')) {
        candidates.push('../../api/products.json');
        candidates.push('../api/products.json');
        candidates.push('/api/products.json');
        candidates.push('api/products.json');
    } else if (window.location.pathname.includes('/Pages/')) {
        candidates.push('../api/products.json');
        candidates.push('api/products.json');
        candidates.push('/api/products.json');
    } else {
        candidates.push('api/products.json');
        candidates.push('./api/products.json');
        candidates.push('/api/products.json');
    }
    // Also try origin-prefixed absolute path
    try {
        const originPref = window.location.origin + (window.location.pathname.split('/')[1] ? '/' + window.location.pathname.split('/')[1] : '');
        candidates.push(originPref + '/api/products.json');
    } catch (e) {
        // ignore
    }

    for (const url of candidates) {
        try {
            console.log('[admin] trying products url', url);
            const resp = await fetch(url, { method: 'GET' });
            if (resp && resp.ok) {
                const data = await resp.json();
                return Array.isArray(data) ? data : [];
            }
        } catch (err) {
            console.warn('[admin] fetch failed for', url, err);
            // try next
        }
    }
    console.error('[admin] all product fetch candidates failed');
    return [];
}

async function renderDiscountControls() {
    const products = await fetchProductsForAdmin();
    const container = document.getElementById('discountList');
    // When used in dedicated discount page, container may be different
    const pageContainer = document.getElementById('discountsContent');
    const out = container || pageContainer;
    const discounts = JSON.parse(localStorage.getItem('productDiscounts') || '{}');
    if (!out) return;
    out.innerHTML = '';
    if (!products.length) { out.innerHTML = '<p>Không có sản phẩm</p>'; return; }
    // use global normalizeAdminImg helper

    products.forEach(p => {
        const d = discounts[p.product_id || p.id] || { active: false, percent: 0 };
        const row = document.createElement('div');
        row.className = 'discount-row';
        const imgSrc = normalizeAdminImg(p.img || p.image || '../Asset/img/product/quan-au-1.jpg');
        row.innerHTML = `
            <label style="display:flex;align-items:center;gap:10px;">
                <input type="checkbox" data-id="${p.product_id || p.id}" ${d.active ? 'checked' : ''} class="discount-active"> 
                <img src="${imgSrc}" style="width:40px;height:40px;object-fit:cover;margin-right:8px"> 
                <span style="flex:1">${p.name}</span>
                <input type="number" min="0" max="100" value="${d.percent}" data-id="${p.product_id || p.id}" class="discount-percent" style="width:80px"> %
            </label>
        `;
        out.appendChild(row);
    });
}

function saveDiscounts() {
    const checks = Array.from(document.querySelectorAll('.discount-active'));
    const percents = Array.from(document.querySelectorAll('.discount-percent'));
    const map = {};
    checks.forEach(c => {
        const id = c.getAttribute('data-id');
        map[id] = map[id] || { active: false, percent: 0 };
        map[id].active = c.checked;
    });
    percents.forEach(p => {
        const id = p.getAttribute('data-id');
        map[id] = map[id] || { active: false, percent: 0 };
        const val = parseFloat(p.value) || 0;
        map[id].percent = Math.max(0, Math.min(100, val));
    });
    localStorage.setItem('productDiscounts', JSON.stringify(map));
    alert('Lưu giảm giá thành công');
    // notify products page to reflect changes (user can refresh)
}

// User manager: create/edit/delete + export
async function initUserManager() {
    const form = document.getElementById('userForm');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const exportBtn = document.getElementById('exportUsersBtn');
    form && form.addEventListener('submit', onSaveUserForm);
    cancelBtn && cancelBtn.addEventListener('click', onCancelEdit);
    exportBtn && exportBtn.addEventListener('click', exportUsersJson);
    await renderUsersList();
}

async function loadBaseUsers() {
    try {
        const resp = await fetch('../api/users.json');
        if (!resp.ok) return [];
        const data = await resp.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('loadBaseUsers error', e);
        return [];
    }
}

function getStoredUsers() {
    // adminUsers holds full array managed by admin, if present
    const stored = JSON.parse(localStorage.getItem('adminUsers') || 'null');
    if (stored && Array.isArray(stored)) return stored;
    // otherwise build from base + created
    const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
    // base users will be fetched separately; for render we try to merge later
    return null;
}

async function renderUsersList() {
    const container = document.getElementById('usersList') || document.getElementById('usersContent');
    const base = await loadBaseUsers();
    const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
    const adminSaved = JSON.parse(localStorage.getItem('adminUsers') || 'null');
    let list = adminSaved && Array.isArray(adminSaved) ? adminSaved : base.concat(created || []);
    container.innerHTML = '';
    if (!list.length) { container.innerHTML = '<p>Không có người dùng</p>'; return; }
    const table = document.createElement('table');
    table.innerHTML = `<thead><tr><th>ID</th><th>Họ & Tên</th><th>Email</th><th>Role</th><th>Hành động</th></tr></thead>`;
    const tbody = document.createElement('tbody');
    list.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${u.id || ''}</td><td>${u.name||''}</td><td>${u.email||''}</td><td>${u.role||'user'}</td><td>
            <button class="viewUserBtn" data-id="${u.id}">Xem</button>
            <button class="editUserBtn" data-id="${u.id}">Sửa</button>
            <button class="deleteUserBtn" data-id="${u.id}">Xóa</button>
        </td>`;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
    // attach handlers
    Array.from(container.querySelectorAll('.editUserBtn')).forEach(b => b.addEventListener('click', () => onEditUser(b.getAttribute('data-id'))));
    Array.from(container.querySelectorAll('.deleteUserBtn')).forEach(b => b.addEventListener('click', () => onDeleteUser(b.getAttribute('data-id'))));
    Array.from(container.querySelectorAll('.viewUserBtn')).forEach(b => b.addEventListener('click', () => onViewUser(b.getAttribute('data-id'))));
}

function onViewUser(id) {
    // find user from adminUsers / base / created
    const adminSaved = JSON.parse(localStorage.getItem('adminUsers') || 'null');
    const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
    loadBaseUsers().then(base => {
        const list = (adminSaved && Array.isArray(adminSaved) ? adminSaved : base.concat(created || []));
        const u = list.find(x => String(x.id) === String(id));
        if (!u) return alert('Không tìm thấy người dùng');
        const info = `ID: ${u.id}\nHọ tên: ${u.name}\nEmail: ${u.email}\nRole: ${u.role || 'user'}\nSố điện thoại: ${u.phone || ''}`;
        alert(info);
    }).catch(e => console.error(e));
}

function onEditUser(id) {
    const adminSaved = JSON.parse(localStorage.getItem('adminUsers') || 'null');
    const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
    // load from saved, created, or base
    const basePromise = loadBaseUsers();
    basePromise.then(base => {
        const list = (adminSaved && Array.isArray(adminSaved) ? adminSaved : base.concat(created || []));
        const u = list.find(x => String(x.id) === String(id));
        if (!u) return alert('Không tìm thấy người dùng');
        document.getElementById('userId').value = u.id || '';
        document.getElementById('userName').value = u.name || '';
        document.getElementById('userEmail').value = u.email || '';
        document.getElementById('userPassword').value = u.password || '';
        document.getElementById('userRole').value = u.role || 'user';
    }).catch(e => console.error(e));
}

function onCancelEdit() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
}

async function onSaveUserForm(e) {
    e.preventDefault();
    const id = document.getElementById('userId').value;
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    if (!name || !email) return alert('Vui lòng nhập tên và email');
    // build users list from base + created + adminSaved
    const base = await loadBaseUsers();
    const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
    let list = base.concat(created || []);
    let adminSaved = JSON.parse(localStorage.getItem('adminUsers') || 'null');
    if (!adminSaved || !Array.isArray(adminSaved)) adminSaved = list.slice();
    // if id provided -> update
    if (id) {
        const idx = adminSaved.findIndex(x => String(x.id) === String(id));
        if (idx !== -1) {
            adminSaved[idx] = { ...adminSaved[idx], name, email, password: password || adminSaved[idx].password, role };
        } else {
            adminSaved.push({ id, name, email, password, role });
        }
    } else {
        const newId = Date.now();
        adminSaved.push({ id: newId, name, email, password, role });
    }
    localStorage.setItem('adminUsers', JSON.stringify(adminSaved));
    onCancelEdit();
    await renderUsersList();
    alert('Lưu người dùng thành công (tạm trong trình duyệt)');
}

async function onDeleteUser(id) {
    if (!confirm('Xác nhận xóa người dùng này?')) return;
    let adminSaved = JSON.parse(localStorage.getItem('adminUsers') || 'null');
    if (adminSaved && Array.isArray(adminSaved)) {
        adminSaved = adminSaved.filter(x => String(x.id) !== String(id));
        localStorage.setItem('adminUsers', JSON.stringify(adminSaved));
    } else {
        // if no adminSaved, set from base minus id
        const base = await loadBaseUsers();
        const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
        const list = base.concat(created || []).filter(x => String(x.id) !== String(id));
        localStorage.setItem('adminUsers', JSON.stringify(list));
    }
    await renderUsersList();
}

async function exportUsersJson() {
    const adminSaved = JSON.parse(localStorage.getItem('adminUsers') || 'null');
    let users;
    if (adminSaved && Array.isArray(adminSaved)) users = adminSaved;
    else {
        const base = await loadBaseUsers();
        const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
        users = base.concat(created || []);
    }
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert('Tải xuống xong: users-export.json — đặt tệp này vào `api/users.json` nếu muốn cập nhật file server.')
}
