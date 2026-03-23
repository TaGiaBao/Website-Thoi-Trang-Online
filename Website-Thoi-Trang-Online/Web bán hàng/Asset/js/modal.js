let modal, closeBtn, continueBtn, currencySelect, countrySelect, languageSelect;

document.addEventListener("DOMContentLoaded", function() {
    // Kiểm tra đường dẫn (root hay Pages)
    const isRootPath = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    const modalPath = isRootPath ? 'Pages/modal-template.html' : 'modal-template.html';
    
    fetch(modalPath)
        .then(res => res.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
            initModalLogic();
        })
        .catch(err => console.error('Error loading modal:', err));
});

function initModalLogic() {
    modal = document.getElementById('countryModalOverlay');
    closeBtn = document.getElementById('closeModal');
    continueBtn = document.getElementById('continueBtn');
    currencySelect = document.getElementById('currencySelect');
    countrySelect = document.getElementById('countrySelect');
    languageSelect = document.getElementById('languageSelect');

    // Kiểm tra nếu lần đầu tiên - chỉ show sau 1.5 giây
    if(!localStorage.getItem('userPreferences')) {
        setTimeout(() => {
            if(modal) modal.classList.add('active');
        }, 1500);
    }

    const close = () => {
        if(modal) modal.classList.remove('active');
    };
    
    if(closeBtn) closeBtn.onclick = close;
    
    if(continueBtn) {
        continueBtn.onclick = () => {
            const preferences = {
                country: countrySelect ? countrySelect.value : 'vn',
                language: languageSelect ? languageSelect.value : 'vi',
                currency: currencySelect ? currencySelect.value : 'vnd'
            };
            
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            updateAllPrices(preferences.currency);
            close();
        };
    }
}

// Hàm mở modal lại
function openPreferencesModal() {
    if(modal) {
        modal.classList.add('active');
    }
}

// Cập nhật giá sản phẩm theo tiền tệ
function updateAllPrices(currency) {
    const prices = document.querySelectorAll('.product-price');
    prices.forEach(p => {
        const vnd = parseInt(p.getAttribute('data-vnd')) || 0;
        
        switch(currency) {
            case 'usd':
                p.innerText = '$' + (vnd / 25000).toFixed(2);
                break;
            case 'jpy':
                p.innerText = '¥' + (vnd * 3.5).toLocaleString('ja-JP');
                break;
            case 'kwd':
                p.innerText = '₩' + (vnd * 1.2).toLocaleString('ko-KR');
                break;
            case 'vnd':
            default:
                p.innerText = vnd.toLocaleString('vi-VN') + 'đ';
        }
    });
}