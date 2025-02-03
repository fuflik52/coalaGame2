let currentTelegramId = null;
let energy = parseInt(localStorage.getItem('energy')) || 100;
let maxEnergy = 100;
let balance = parseInt(localStorage.getItem('balance')) || 0;
let lastEnergyUpdate = parseInt(localStorage.getItem('lastEnergyUpdate')) || Date.now();
let lastEarningCheck = parseInt(localStorage.getItem('lastEarningCheck')) || Date.now();
let hourlyRate = 0; // Общая прибыль в час от всех карточек
let isLocalMode = true; // Добавляем флаг локального режима
const energyBar = document.getElementById('energyBar');

// Инициализация переменных
let clickCount = 0;
let lastClickTime = 0;
let clickMultiplier = 1;
let isClicking = false;
let isVibrationEnabled = localStorage.getItem('vibrationEnabled') === 'true';

// Инициализация Telegram ID
async function initializeTelegramId() {
    return new Promise((resolve) => {
        const maxAttempts = 50;
        let attempts = 0;

        const checkTelegram = () => {
            if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
                const userId = String(window.Telegram.WebApp.initDataUnsafe.user.id);
                window.currentTelegramId = userId;
                console.log('Telegram ID успешно получен:', userId);
                return true;
            }
            return false;
        };

        // Проверяем сразу
        if (checkTelegram()) {
            resolve(true);
            return;
        }

        // Если не получилось, запускаем интервал
        const interval = setInterval(() => {
            attempts++;
            if (checkTelegram()) {
                clearInterval(interval);
                resolve(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error('Не удалось получить Telegram ID');
                resolve(false);
            }
        }, 100);
    });
}

function updateEnergy() {
    energy = Math.min(maxEnergy, energy);
    energy = Math.max(0, energy);
    energyBar.style.width = `${energy}%`;
    
    // Обновляем текст энергии
    const energyText = document.getElementById('energyText');
    if (energyText) {
        energyText.textContent = `${energy}/${maxEnergy}`;
    }
    
    // Сохраняем текущее значение энергии
    localStorage.setItem('energy', energy);
    localStorage.setItem('lastEnergyUpdate', Date.now());
}

function updateEnergyDisplay(currentEnergy, maxEnergy) {
    const energyBar = document.getElementById('energyBar');
    const energyText = document.getElementById('energyText');
    
    if (energyBar) {
        energyBar.style.width = `${(currentEnergy / maxEnergy) * 100}%`;
    }
    
    if (energyText) {
        const energySpan = energyText.querySelector('span');
        if (energySpan) {
            energySpan.textContent = `${currentEnergy}/${maxEnergy}`;
        }
    }
}

// Функция для проверки поддержки вибрации
function checkVibrationSupport() {
    return 'vibrate' in navigator;
}

// Функция для вибрации
function vibrate(duration = 50) {
    try {
        const isVibrationEnabled = localStorage.getItem('vibrationEnabled') === 'true';
        if (isVibrationEnabled && checkVibrationSupport()) {
            navigator.vibrate(duration);
            console.log('Вибрация активирована:', duration, 'мс');
        }
    } catch (error) {
        console.error('Ошибка при вибрации:', error);
    }
}

async function handleClick(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (!window.currentTelegramId) {
        console.error('Ошибка: telegram_id не определен');
        return;
    }

    try {
        // Получаем текущие данные пользователя
        const userData = await window.db.getUserData(window.currentTelegramId);
        if (!userData) return;

        if (userData.energy <= 0) return;

        // Тратим энергию
        const success = await window.db.spendEnergy(window.currentTelegramId);
        if (!success) return;

        // Обновляем баланс
        await window.db.updateUserBalance(window.currentTelegramId, userData.balance + 1);

        // Обновляем отображение
        const updatedUserData = await window.db.getUserData(window.currentTelegramId);
        if (updatedUserData) {
            updateEnergyDisplay(updatedUserData.energy, updatedUserData.max_energy);
            updateBalanceDisplay(updatedUserData.balance);
        }

        // Добавляем анимацию клика
        const clickerButton = document.querySelector('.clicker-button');
        if (clickerButton) {
            clickerButton.classList.add('clicked');
            setTimeout(() => {
                clickerButton.classList.remove('clicked');
            }, 100);
        }

    } catch (error) {
        console.error('Ошибка при обработке клика:', error);
    }
}

function showRewardAnimation(reward, event) {
    const rewardElement = document.createElement('div');
    rewardElement.className = 'reward-animation';
    
    // Создаем контейнер для текста и иконки
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '5px';
    
    // Добавляем текст
    const text = document.createElement('span');
    text.textContent = `+${reward}`;
    
    // Добавляем иконку
    const icon = document.createElement('img');
    icon.src = 'https://i.postimg.cc/FFx7T4Bh/image.png';
    icon.style.width = '20px';
    icon.style.height = '20px';
    icon.style.objectFit = 'contain';
    
    // Сначала добавляем текст, потом иконку
    container.appendChild(text);
    container.appendChild(icon);
    rewardElement.appendChild(container);
    
    // Позиционируем анимацию относительно клика
    const x = event.type.includes('touch') ? event.touches[0].clientX : event.clientX;
    const y = event.type.includes('touch') ? event.touches[0].clientY : event.clientY;
    
    rewardElement.style.left = `${x}px`;
    rewardElement.style.top = `${y}px`;
    
    document.body.appendChild(rewardElement);
    
    // Запускаем анимацию
    requestAnimationFrame(() => {
        rewardElement.style.transform = 'translateY(-100px)';
        rewardElement.style.opacity = '0';
    });
    
    // Удаляем элемент после анимации
    setTimeout(() => {
        document.body.removeChild(rewardElement);
    }, 2000);
}

// Инициализация обработчиков событий
function initializeHomeSection() {
    const clickerButton = document.querySelector('.clicker-button');
    if (!clickerButton) return;
    
    // Удаляем старые обработчики
    clickerButton.removeEventListener('mousedown', handleClick);
    clickerButton.removeEventListener('touchstart', handleClick);
    clickerButton.removeEventListener('click', handleClick);
    
    // Добавляем новые обработчики
    if ('ontouchstart' in window) {
        // Для мобильных устройств
        clickerButton.addEventListener('touchstart', handleClick, { passive: false });
    } else {
        // Для десктопов
        clickerButton.addEventListener('mousedown', handleClick);
    }
    
    // Предотвращаем стандартные действия браузера
    clickerButton.addEventListener('click', (e) => e.preventDefault());
    clickerButton.addEventListener('contextmenu', (e) => e.preventDefault());
    clickerButton.addEventListener('touchend', (e) => e.preventDefault());
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ждем инициализацию Telegram
        const hasTelegramId = await initializeTelegramId();
        if (!hasTelegramId) return;

        // Ждем инициализацию базы данных
        await waitForDatabase();

        // Инициализируем компоненты
        initializeHomeSection();
        
        // Запускаем обновление энергии
        await updateEnergy(); // Первое обновление
        setInterval(updateEnergy, 1000); // Регулярное обновление
        
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
});

function updateBalance(amount) {
    balance += amount;
    localStorage.setItem('balance', balance);
    const balanceElement = document.querySelector('.balance-value');
    if (balanceElement && document.querySelector('.home-section.active')) {
        balanceElement.textContent = balance.toLocaleString();
    }
}

function calculateHourlyRate() {
    const cards = JSON.parse(localStorage.getItem('activeCards')) || [];
    hourlyRate = cards.reduce((total, card) => total + card.hourlyEarnings, 0);
    
    const hourlyProfitElement = document.querySelector('.hourly-profit');
    if (hourlyProfitElement && document.querySelector('.home-section.active')) {
        hourlyProfitElement.textContent = `${hourlyRate.toLocaleString()} /час`;
    }
}

function checkPassiveEarnings() {
    const now = Date.now();
    const timePassed = now - lastEarningCheck;
    const hoursPassedFraction = timePassed / (60 * 60 * 1000); // Сколько часов прошло (дробное число)
    
    if (hoursPassedFraction > 0 && hourlyRate > 0) {
        const earnedAmount = Math.floor(hourlyRate * hoursPassedFraction);
        if (earnedAmount > 0) {
            updateBalance(earnedAmount);
            showNotification(`Вы заработали ${earnedAmount.toLocaleString()} монет!`, 'success');
        }
    }
    
    lastEarningCheck = now;
    localStorage.setItem('lastEarningCheck', lastEarningCheck);
}

// Ждем инициализацию базы данных
function waitForDatabase() {
    return new Promise((resolve) => {
        const checkDb = () => {
            if (window.db) {
                resolve();
            } else {
                setTimeout(checkDb, 100);
            }
        };
        checkDb();
    });
}

// Функция обновления энергии
async function updateEnergy() {
    try {
        if (!window.currentTelegramId || !window.db) return;

        const userData = await window.db.getUserData(window.currentTelegramId);
        if (!userData) return;

        // Обновляем отображение энергии
        if (typeof updateEnergyDisplay === 'function') {
            updateEnergyDisplay(userData.energy, userData.max_energy);
        }

        // Регенерируем энергию
        await window.db.regenerateEnergy(window.currentTelegramId);
    } catch (error) {
        console.error('Ошибка при обновлении энергии:', error);
    }
}

function updateBalanceDisplay(balance) {
    const balanceElement = document.querySelector('.balance-value');
    if (balanceElement) {
        balanceElement.textContent = balance.toLocaleString();
    }
}

// Функция для восстановления энергии
function restoreEnergy() {
    const lastUpdate = parseInt(localStorage.getItem('lastEnergyUpdate')) || Date.now();
    const currentTime = Date.now();
    const secondsPassed = Math.floor((currentTime - lastUpdate) / 1000);
    
    // Добавляем по 1 единице энергии за каждую прошедшую секунду
    energy = Math.min(maxEnergy, energy + secondsPassed);
    updateEnergy();
}

// Инициализация энергии
document.addEventListener('DOMContentLoaded', () => {
    restoreEnergy();

    // Обработчик клика для траты энергии
    document.querySelector('.clicker-button')?.addEventListener('click', function() {
        if (energy > 0) {
            energy--;
            updateEnergy();
        } else {
            showNotification('Недостаточно энергии!', 'error');
        }
    });

    // Восстановление энергии каждую секунду
    setInterval(() => {
        if (energy < maxEnergy) {
            energy++;
            updateEnergy();
        }
    }, 1000);

    // Обновляем энергию при возвращении на вкладку
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            restoreEnergy();
        }
    });
});

function initializeHome() {
    // Инициализация основных компонентов
    const game = new NumberGame();
    
    // Инициализируем раздел друзей
    game.initializeFriendsSection();
    
    // Добавляем в window для отладки
    window.game = game;
} 
