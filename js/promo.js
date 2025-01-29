// Функция для создания и отображения формы ввода промокода
function showPromoCodeForm() {
    const promoSection = document.createElement('div');
    promoSection.className = 'promo-section';
    promoSection.innerHTML = `
        <div class="promo-form">
            <input type="text" id="promoCodeInput" placeholder="Введите промокод" maxlength="20">
            <button onclick="usePromoCode()">Активировать</button>
        </div>
    `;
    
    // Добавляем форму в секцию home
    const homeSection = document.getElementById('homeSection');
    if (homeSection) {
        homeSection.appendChild(promoSection);
    }
}

// Функция для использования промокода
async function usePromoCode() {
    const input = document.getElementById('promoCodeInput');
    if (!input || !input.value) {
        showNotification('Введите промокод', 'error');
        return;
    }

    const code = input.value.trim().toUpperCase();
    if (!code) {
        showNotification('Введите промокод', 'error');
        return;
    }

    try {
        // Получаем текущий Telegram ID
        const telegramId = window.tg?.initDataUnsafe?.user?.id?.toString();
        if (!telegramId) {
            showNotification('Ошибка: не удалось получить ID пользователя', 'error');
            return;
        }

        // Используем промокод
        const result = await window.db.usePromoCode(telegramId, code);
        
        if (result.success) {
            showNotification(result.message, 'success');
            input.value = ''; // Очищаем поле ввода
            
            // Обновляем баланс или энергию в зависимости от типа награды
            if (result.reward.type === 'coins') {
                updateBalanceDisplay();
            } else if (result.reward.type === 'energy') {
                const userData = await window.db.getUserData(telegramId);
                if (userData && typeof updateEnergyDisplay === 'function') {
                    updateEnergyDisplay(userData.energy, userData.max_energy);
                }
            }
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Ошибка при использовании промокода:', error);
        showNotification('Произошла ошибка при использовании промокода', 'error');
    }
}

// Добавляем стили для формы промокода
const style = document.createElement('style');
style.textContent = `
    .promo-section {
        margin: 20px 0;
        padding: 15px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    .promo-form {
        display: flex;
        gap: 10px;
    }
    .promo-form input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #30363d;
        border-radius: 6px;
        background: #21262d;
        color: #c9d1d9;
        font-size: 14px;
    }
    .promo-form button {
        padding: 8px 16px;
        background: #238636;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    }
    .promo-form button:hover {
        background: #2ea043;
    }
`;
document.head.appendChild(style);

// Инициализируем форму при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    showPromoCodeForm();
}); 