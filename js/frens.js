let friendCount = 0;
let totalEarnings = 0;
let tg = window.Telegram.WebApp;

function updateFriendStats() {
    const friendCountElements = document.querySelectorAll('#friendCount, #friendCountBadge');
    friendCountElements.forEach(element => {
        if (element) {
            element.textContent = friendCount;
        }
    });
}

function getUserInfo() {
    if (tg.initDataUnsafe?.user) {
        return {
            username: tg.initDataUnsafe.user.username || 'Пользователь',
            id: tg.initDataUnsafe.user.id,
            firstName: tg.initDataUnsafe.user.first_name,
            lastName: tg.initDataUnsafe.user.last_name
        };
    }
    return null;
}

function copyReferralLink() {
    const user = getUserInfo();
    const referralLink = `https://t.me/CoalaGame_Bot/play?startapp=${user ? user.id : 'u0'}`;
    
    navigator.clipboard.writeText(referralLink)
        .then(() => {
            showNotification('Реферальная ссылка скопирована!', 'success');
        })
        .catch(() => {
            showNotification('Не удалось скопировать ссылку', 'error');
        });
}

function generateReferralCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    const frensSection = document.getElementById('frensSection');
    const user = getUserInfo();
    
    frensSection.innerHTML = `
        <div class="frens-container">
            <div class="frens-header">
                <div class="frens-title">
                    <h2>Приглашай друзей!</h2>
                    <p>Получайте бонусы вместе с друзьями</p>
                </div>
                <div class="frens-stats">
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <div class="stat-info">
                            <span class="stat-value" id="friendCount">0</span>
                            <span class="stat-label">Друзей</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-coins"></i>
                        <div class="stat-info">
                            <span class="stat-value">25%</span>
                            <span class="stat-label">Бонус</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="referral-section">
                <div class="referral-card">
                    <div class="referral-info">
                        <i class="fas fa-link"></i>
                        <div>
                            <h3>Твоя реферальная ссылка</h3>
                            <p>Поделись с друзьями и получай бонусы</p>
                        </div>
                    </div>
                    <button id="copyReferralLink" class="copy-link-button">
                        <i class="fas fa-copy"></i>
                        <span>Копировать</span>
                    </button>
                </div>
            </div>

            <div class="referral-info-card">
                <div class="info-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="info-content">
                    <h3>Двухуровневая реферальная система</h3>
                    <p>Получайте ¼ от токенов пользователей, приглашенных вашими друзьями</p>
                </div>
            </div>

            <div class="friends-list-section">
                <div class="friends-list-header">
                    <h3>Список друзей</h3>
                    <span class="friends-count" id="friendCountBadge">0</span>
                </div>
                <div class="friends-list" id="friendList">
                    <div class="empty-friends-message">
                        <i class="fas fa-user-plus"></i>
                        <p>Пригласите друзей, чтобы начать зарабатывать вместе</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Обработчик копирования реферальной ссылки
    const copyButton = document.getElementById('copyReferralLink');
    if (copyButton) {
        copyButton.addEventListener('click', copyReferralLink);
    }

    // Загружаем сохраненные данные
    const savedFriendCount = localStorage.getItem('friendCount');
    if (savedFriendCount) {
        friendCount = parseInt(savedFriendCount);
        updateFriendStats();
    }

    // Обновляем имя пользователя, если это Telegram WebApp
    if (user) {
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = user.username || `${user.firstName} ${user.lastName}`.trim();
        });
    }

    // Сохраняем данные перед закрытием
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('friendCount', friendCount);
        localStorage.setItem('totalEarnings', totalEarnings);
    });
});

function copyRefLink() {
    navigator.clipboard.writeText('https://koala-game.com/?ref=123456')
        .then(() => {
            showNotification('Реферальная ссылка скопирована!', 'success');
        })
        .catch(() => {
            showNotification('Не удалось скопировать ссылку', 'error');
        });
} 