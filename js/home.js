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

// Инициализация Telegram ID из URL
async function initializeTelegramId() {
    // Ждем инициализацию Telegram WebApp
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        window.currentTelegramId = String(window.Telegram.WebApp.initDataUnsafe.user.id);
        return true;
    }
    console.error('Telegram ID не найден');
    return false;
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
    event.preventDefault();
    
    if (isClicking) return;
    isClicking = true;

    try {
        // Получаем текущие данные пользователя
        const userData = await window.db.getUserData(window.telegramId);
        if (!userData) {
            showNotification('Ошибка получения данных пользователя', 'error');
            return;
        }

        // Синхронизируем локальное значение энергии с базой данных
        energy = userData.energy;
        maxEnergy = userData.max_energy;
        updateEnergy();

        if (energy <= 0) {
            showNotification('Недостаточно энергии!', 'error');
            return;
        }

        // Тратим энергию
        energy--;
        updateEnergy();
        await window.db.spendEnergy(window.telegramId);

        // Добавляем анимацию нажатия
        const clickerButton = document.querySelector('.clicker-button');
        const koalaImage = clickerButton?.querySelector('.clicker-koala');
        
        if (clickerButton) clickerButton.classList.add('clicked');
        if (koalaImage) koalaImage.classList.add('clicked');

        // Вибрация при клике
        if (isVibrationEnabled && checkVibrationSupport()) {
            vibrate(50);
        }

        // Обновляем счетчик кликов и множитель
        const currentTime = Date.now();
        if (currentTime - lastClickTime < 300) {
            clickCount++;
            if (clickCount >= 10) {
                clickMultiplier = 2;
            }
        } else {
            clickCount = 1;
            clickMultiplier = 1;
        }
        lastClickTime = currentTime;

        // Обновляем баланс
        const reward = 1 * clickMultiplier;
        await window.db.updateUserBalance(window.telegramId, userData.balance + reward);

        // Показываем анимацию награды
        showRewardAnimation(reward, event);

        // Убираем анимацию нажатия
        setTimeout(() => {
            if (clickerButton) clickerButton.classList.remove('clicked');
            if (koalaImage) koalaImage.classList.remove('clicked');
        }, 100);

    } catch (error) {
        console.error('Ошибка при обработке клика:', error);
        showNotification('Произошла ошибка!', 'error');
    } finally {
        isClicking = false;
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
    
    // Добавляем обработчики для всех типов устройств
    clickerButton.addEventListener('mousedown', handleClick);
    clickerButton.addEventListener('touchstart', handleClick, { passive: false });
    
    // Предотвращаем стандартные действия браузера
    clickerButton.addEventListener('click', (e) => e.preventDefault());
    clickerButton.addEventListener('contextmenu', (e) => e.preventDefault());
    clickerButton.addEventListener('touchend', (e) => e.preventDefault());
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ждем инициализацию Telegram
        const hasTelegramId = await initializeTelegramId();
        if (!hasTelegramId) {
            showNotification('Ошибка: не удалось получить данные пользователя', 'error');
            return;
        }

        // Ждем инициализацию базы данных
        await waitForDatabase();

        // Инициализируем остальные компоненты
        initializeHomeSection();
        initializeEventListeners();
        
        // Запускаем обновление энергии
        setInterval(updateEnergy, 1000);
        
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showNotification('Произошла ошибка при инициализации', 'error');
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

async function updateEnergy() {
    try {
        if (!window.db) {
            await waitForDatabase();
        }
        
        if (!currentTelegramId) {
            console.error('Telegram ID не определен');
            return;
        }

        await window.db.regenerateEnergy(currentTelegramId);
        const userData = await window.db.getUserData(currentTelegramId);
        if (userData && typeof updateEnergyDisplay === 'function') {
            updateEnergyDisplay(userData.energy, userData.max_energy);
        }
    } catch (error) {
        console.error('Ошибка при обновлении энергии:', error);
    }
}

function initializeEventListeners() {
    const clickerButton = document.querySelector('.clicker-button');
    if (clickerButton) {
        clickerButton.addEventListener('click', handleClick);
        clickerButton.addEventListener('touchstart', handleClick, { passive: false });
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