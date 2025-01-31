function openSettings() {
    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) {
        settingsModal.classList.add('active');
    }
}

function closeSettings() {
    const settingsModal = document.querySelector('.settings-modal');
    if (settingsModal) {
        settingsModal.classList.remove('active');
    }
}

function toggleSetting(settingId) {
    const setting = document.getElementById(settingId);
    if (setting) {
        const isEnabled = setting.checked;
        localStorage.setItem(settingId, isEnabled);
        
        // Применяем настройки
        switch(settingId) {
            case 'soundEnabled':
                // Логика для включения/выключения звука
                break;
            case 'notificationsEnabled':
                // Логика для включения/выключения уведомлений
                break;
            case 'vibrationEnabled':
                // Логика для включения/выключения вибрации
                break;
        }
    }
}

function showNews() {
    // Создаем модальное окно для новостей, если его еще нет
    let newsModal = document.querySelector('.news-modal');
    if (!newsModal) {
        newsModal = document.createElement('div');
        newsModal.className = 'news-modal';
        document.body.appendChild(newsModal);
    }

    // Наполняем контентом
    newsModal.innerHTML = `
        <div class="news-content">
            <div class="news-header">
                <button class="news-close-button">✕</button>
                <h2 class="news-title">Новости и обновления</h2>
            </div>
            <div class="news-version">
                <img src="https://i.postimg.cc/ZnggtH7v/image.png" alt="Update">
                Обновление Koala Game 1.0.1
            </div>
            <div class="news-changes">
                <div class="news-category">
                    <div class="news-category-title">
                        <span>⚡ Основные изменения:</span>
                    </div>
                    <div class="news-category">
                        <div class="news-category-title">1. Система покупок:</div>
                        <div class="news-item">Исправлена проблема с покупкой карточек</div>
                        <div class="news-item">Улучшено отображение баланса</div>
                        <div class="news-item">Добавлена защита от случайных покупок</div>
                    </div>
                    <div class="news-category">
                        <div class="news-category-title">2. Ежедневные награды:</div>
                        <div class="news-item">Добавлены новые награды (250,000 на 6 день)</div>
                        <div class="news-item">Увеличена награда за 7 день (500,000)</div>
                        <div class="news-item">Добавлен 8 день с наградой 1,000,000</div>
                        <div class="news-item">Сокращено время между получением наград до 1 минуты</div>
                    </div>
                    <div class="news-category">
                        <div class="news-category-title">3. Промокоды:</div>
                        <div class="news-item">Добавлена система промокодов</div>
                        <div class="news-item">Промокод "bonus" даёт 500,000 монет</div>
                        <div class="news-item">Добавлена защита от повторного использования</div>
                    </div>
                    <div class="news-category">
                        <div class="news-category-title">4. Интерфейс:</div>
                        <div class="news-item">Улучшен дизайн настроек</div>
                        <div class="news-item">Добавлена анимация снега</div>
                        <div class="news-item">Улучшена анимация кликов</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Показываем модальное окно
    newsModal.style.display = 'block';
    requestAnimationFrame(() => {
        newsModal.style.opacity = '1';
    });

    // Добавляем обработчик закрытия
    const closeButton = newsModal.querySelector('.news-close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            newsModal.style.opacity = '0';
            setTimeout(() => {
                newsModal.style.display = 'none';
            }, 300);
        });
    }

    // Закрытие при клике вне контента
    newsModal.addEventListener('click', (e) => {
        if (e.target === newsModal) {
            newsModal.style.opacity = '0';
            setTimeout(() => {
                newsModal.style.display = 'none';
            }, 300);
        }
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const closeButton = settingsModal?.querySelector('.close-button');
    const newsButton = settingsModal?.querySelector('.news-button');
    const vibrationToggle = document.querySelector('.setting-item:nth-child(2) input[type="checkbox"]');
    const snowToggle = document.querySelector('.setting-item:nth-child(3) input[type="checkbox"]');

    // Проверяем наличие элементов
    if (!settingsButton || !settingsModal) {
        console.error('Не найдены элементы настроек');
        return;
    }

    // Инициализация состояния переключателей
    if (vibrationToggle) {
        vibrationToggle.checked = localStorage.getItem('vibrationEnabled') === 'true';
    }
    if (snowToggle) {
        const isSnowEnabled = localStorage.getItem('snowEnabled') === 'true';
        snowToggle.checked = isSnowEnabled;
        if (isSnowEnabled && window.snowAnimation) {
            window.snowAnimation.start();
        }
    }

    // Открытие модального окна
    settingsButton.addEventListener('click', () => {
        console.log('Клик по кнопке настроек');
        settingsModal.style.display = 'block';
        requestAnimationFrame(() => {
            settingsModal.style.opacity = '1';
        });
    });

    // Закрытие модального окна
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            settingsModal.style.opacity = '0';
            setTimeout(() => {
                settingsModal.style.display = 'none';
            }, 300);
        });
    }

    // Закрытие при клике вне модального окна
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.opacity = '0';
            setTimeout(() => {
                settingsModal.style.display = 'none';
            }, 300);
        }
    });

    // Обработчики переключателей
    if (vibrationToggle) {
        vibrationToggle.addEventListener('change', (e) => {
            localStorage.setItem('vibrationEnabled', e.target.checked);
        });
    }

    if (snowToggle) {
        snowToggle.addEventListener('change', (e) => {
            localStorage.setItem('snowEnabled', e.target.checked);
            if (window.snowAnimation) {
                if (e.target.checked) {
                    window.snowAnimation.start();
                } else {
                    window.snowAnimation.stop();
                }
            }
        });
    }

    // Обработчик кнопки новостей
    if (newsButton) {
        newsButton.addEventListener('click', () => {
            showNews();
        });
    }

    // Добавляем форму промокода в настройки
    const promoSection = document.createElement('div');
    promoSection.className = 'setting-item promo-section';
    promoSection.innerHTML = `
        <div class="promo-form">
            <input type="text" id="promoCodeInput" placeholder="Введите промокод" maxlength="20">
            <button onclick="usePromoCode()">Прменить</button>
        </div>
    `;
    settingsModal.querySelector('.settings-list').appendChild(promoSection);

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

    // Добавляем функцию использования промокода
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

    // Добавляем обработчик для кнопки активации промокода
    const promoButton = promoSection.querySelector('button');
    if (promoButton) {
        promoButton.onclick = usePromoCode;
    }
});

// Создаем HTML для настроек
function createSettingsHTML() {
    return `
        <div class="settings-container">
            <div class="settings-header">
                <h2>Настройки</h2>
                <button class="close-settings">✕</button>
            </div>
            <div class="settings-content">
                <div class="settings-section">
                    <h3>Игра</h3>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="vibrationToggle" ${isVibrationEnabled ? 'checked' : ''}>
                            <span>Вибрация</span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="soundToggle" ${isSoundEnabled ? 'checked' : ''}>
                            <span>Звук</span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Промокод</h3>
                    <div class="promo-code-input">
                        <input type="text" id="promoCodeInput" placeholder="Введите промокод">
                        <button id="applyPromoCode">Применить</button>
                    </div>
                </div>
            </div>
        </div>
    `;
} 