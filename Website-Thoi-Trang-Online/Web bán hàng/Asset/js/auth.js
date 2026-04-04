// Login Modal Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Determine API base path depending on location
const apiBase = window.location.pathname.includes('/Pages/') ? '../' : '';

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    try {
        const url = apiBase + 'api/users.json';
        console.log('Static login ->', url);
        const resp = await fetch(url);
        if (!resp.ok) {
            alert('Không thể truy vấn dữ liệu người dùng');
            return;
        }
        const users = await resp.json();
        const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
        const allUsers = users.concat(created);
        const user = allUsers.find(u => u.email === email && u.password === password);
        if (!user) {
            alert('Email hoặc mật khẩu không đúng');
            return;
        }
        const safeUser = { id: user.id, name: user.name || user.firstName || user.email, email: user.email, role: user.role || 'user' };
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        localStorage.setItem('userLoggedIn', 'true');
        closeLoginModal();
        updateUserUI();
    } catch (err) {
        console.error('Login fetch error', err);
        alert('Lỗi kết nối');
    }
}

function computeAdminHref() {
    // Return a relative path so Live Server resolves correctly.
    const isInPages = window.location.pathname.includes('/Pages/');
    return isInPages ? 'admin/index.html' : 'Pages/admin/index.html';
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLoggedIn');
    updateUserUI();

    // Nếu đang ở trong khu admin, ẩn header và nav của trang người dùng
    try {
        if (window.location.pathname.includes('/Pages/admin/')) {
            const header = document.querySelector('.main-header');
            const nav = document.querySelector('.main-nav');
            const announcementBar = document.getElementById('announcementBar');
            if (header) header.style.display = 'none';
            if (nav) nav.style.display = 'none';
            if (announcementBar) announcementBar.style.display = 'none';
        }
    } catch (e) {
        console.warn('hide main nav on admin page error', e);
    }
    alert('Bạn đã đăng xuất');
}

// Register user (can be called from Pages/dang-ki.html)
async function registerUser(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const confirmEmail = document.getElementById('confirmEmail').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone') ? document.getElementById('phone').value : '';

    if (email !== confirmEmail) {
        alert('Email không trùng khớp!');
        return;
    }
    if (password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }

    try {
        const url = apiBase + 'api/users.json';
        console.log('Static register check ->', url);
        const resp = await fetch(url);
        const users = resp.ok ? await resp.json() : [];
        const created = JSON.parse(localStorage.getItem('createdUsers') || '[]');
        const allUsers = users.concat(created);
        if (allUsers.find(u => u.email === email)) {
            alert('Email đã tồn tại');
            return;
        }
        const newUser = { id: Date.now(), name: firstName + ' ' + lastName, email, password, role: 'user', phone };
        created.push(newUser);
        localStorage.setItem('createdUsers', JSON.stringify(created));
        localStorage.setItem('currentUser', JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }));
        localStorage.setItem('userLoggedIn', 'true');
        alert('Tạo tài khoản thành công! Bạn đã được đăng nhập tạm thời.');
        window.location.href = apiBase + 'index.html';
    } catch (err) {
        console.error('Register fetch error', err);
        alert('Lỗi kết nối');
    }
}

function updateUserUI() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const loginAnchor = document.querySelector('.user-actions a[title="Đăng nhập / Đăng kí"]');
    const adminMenuItem = document.getElementById('adminMenuItem');
    const announcementBar = document.getElementById('announcementBar');

    if (user) {
        if (announcementBar) announcementBar.style.display = 'none';
        // show admin link for admins
        if (adminMenuItem) {
            adminMenuItem.style.display = (user.role === 'admin') ? 'inline-block' : 'none';
            const adminLink = document.getElementById('adminLink');
            if (adminLink) adminLink.href = computeAdminHref();
        }
        // update login anchor to show name and logout action
        if (loginAnchor) {
            const shortName = (user.name || user.email || '').split(' ')[0];
            loginAnchor.innerHTML = `<span class="user-name">${shortName || 'Tài khoản'}</span>`;
            loginAnchor.title = 'Đăng xuất';
            loginAnchor.onclick = function(e) { e.preventDefault(); if (confirm('Bạn muốn đăng xuất?')) handleLogout(); return false; };
        }
    } else {
        if (announcementBar) announcementBar.style.display = '';
        if (adminMenuItem) adminMenuItem.style.display = 'none';
        const adminLink = document.getElementById('adminLink');
        if (adminLink) adminLink.href = computeAdminHref();
        if (loginAnchor) {
            loginAnchor.innerHTML = '<i class="far fa-user"></i>';
            loginAnchor.title = 'Đăng nhập / Đăng kí';
            loginAnchor.onclick = function(e) { e.preventDefault(); openLoginModal(); return false; };
        }
    }
}

// Check on page load
document.addEventListener('DOMContentLoaded', function() {
    // sanitize session: ensure userLoggedIn flag matches currentUser
    try {
        const stored = localStorage.getItem('currentUser');
        const flag = localStorage.getItem('userLoggedIn');
        if (!stored || flag !== 'true') {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userLoggedIn');
        }
    } catch (e) {
        console.warn('session sanitize error', e);
    }
    updateUserUI();
    // try to resolve correct admin href for Live Server variations
    try { resolveAdminHref(); } catch(e) { console.warn('resolveAdminHref failed', e); }
});

async function resolveAdminHref() {
    const adminLink = document.getElementById('adminLink');
    if (!adminLink) return;
    const encodedFolder = encodeURIComponent(window.location.pathname.split('/').filter(Boolean)[0] || '');
    const candidates = [
        'Pages/admin/index.html',
        './Pages/admin/index.html',
        '/Pages/admin/index.html',
        'admin/index.html',
        './admin/index.html',
        '../Pages/admin/index.html',
        '/'+encodedFolder + '/Pages/admin/index.html'
    ];
    for (const c of candidates) {
        try {
            const resp = await fetch(c, { method: 'HEAD' });
            if (resp && resp.ok) {
                adminLink.href = c;
                return c;
            }
        } catch (e) {
            // ignore
        }
    }
    // leave default if none found
    return null;
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('loginModal');
    if (modal && event.target === modal) {
        closeLoginModal();
    }
});

// Expose handlers as globals to ensure inline onsubmit attributes work
try {
    window.registerUser = registerUser;
    window.handleLogin = handleLogin;
    window.handleLogout = handleLogout;
    window.updateUserUI = updateUserUI;
    console.log('auth.js loaded and handlers attached');
} catch (e) {
    console.warn('Could not attach auth handlers to window', e);
}
// Navigate to register page with correct relative path
function goToRegister() {
    const isInPages = window.location.pathname.includes('/Pages/');
    const target = isInPages ? 'dang-ki.html' : 'Pages/dang-ki.html';
    window.location.href = target;
}
try { window.goToRegister = goToRegister; } catch(e) {}

// Make requireAdminPage available globally for admin pages
function requireAdminPage() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!user || user.role !== 'admin') {
            alert('Bạn cần quyền admin để truy cập trang này');
            // if we're under Pages/admin, go up two levels to root index
            if (window.location.pathname.includes('/Pages/admin/')) {
                window.location.href = '../../index.html';
            } else {
                window.location.href = '/index.html';
            }
            return false;
        }
        return true;
    } catch (e) {
        console.warn('requireAdminPage error', e);
        return false;
    }
}
try { window.requireAdminPage = requireAdminPage; } catch(e) {}