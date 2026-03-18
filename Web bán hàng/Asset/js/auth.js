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

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password) {
        // Store user info
        localStorage.setItem('currentUser', JSON.stringify({ email, name: email.split('@')[0] }));
        localStorage.setItem('userLoggedIn', 'true');
        
        // Close modal and update UI
        closeLoginModal();
        updateUserUI();
        alert('Đăng nhập thành công!');
    } else {
        alert('Vui lòng điền đầy đủ thông tin');
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLoggedIn');
    updateUserUI();
    alert('Bạn đã đăng xuất');
}

function updateUserUI() {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userIcon = document.querySelector('.user-actions .fa-user').parentElement;
    
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
