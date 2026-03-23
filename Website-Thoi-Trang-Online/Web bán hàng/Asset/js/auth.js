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
        const url = apiBase + 'login_process.php';
        const body = JSON.stringify({ email, password });
        console.log('Login request ->', url, body);
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        });
        const text = await resp.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Non-JSON response from login_process.php', text);
            alert('Lỗi server: phản hồi không hợp lệ');
            return;
        }
        console.log('Login response', resp.status, data);
        if (data.success) {
            const user = data.user || { email };
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('userLoggedIn', 'true');
            closeLoginModal();
            updateUserUI();
        } else {
            alert(data.message || 'Đăng nhập thất bại');
        }
    } catch (err) {
        console.error('Login fetch error', err);
        alert('Lỗi kết nối');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLoggedIn');
    updateUserUI();
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
        const url = apiBase + 'register_process.php';
        const body = JSON.stringify({ email, password, firstName, lastName, phone });
        console.log('Register request ->', url, body);
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        });
        const text = await resp.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Non-JSON response from register_process.php', text);
            alert('Lỗi server: phản hồi không hợp lệ');
            return;
        }
        console.log('Register response', resp.status, data);
        if (data.success) {
            alert('Tạo tài khoản thành công! Vui lòng đăng nhập.');
            window.location.href = apiBase + 'index.html';
        } else {
            alert(data.message || 'Không thể đăng ký');
        }
    } catch (err) {
        console.error('Register fetch error', err);
        alert('Lỗi kết nối');
    }
}

function updateUserUI() {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userFa = document.querySelector('.user-actions .fa-user');
    const userIcon = userFa ? (userFa.parentElement || userFa) : null;

    if (isLoggedIn && userIcon) {
        userIcon.textContent = '👤';
        userIcon.style.cursor = 'pointer';
        userIcon.onclick = function() {
            if (confirm('Bạn muốn đăng xuất?')) {
                handleLogout();
            }
        };
    }
}

// Check on page load
document.addEventListener('DOMContentLoaded', function() {
    updateUserUI();
});

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