let currentTelegramId = null;
let energy = 100;
let maxEnergy = 100;
let balance = 0;
let lastEnergyUpdate = parseInt(localStorage.getItem('lastEnergyUpdate')) || Date.now();
let lastEarningCheck = parseInt(localStorage.getItem('lastEarningCheck')) || Date.now();
let hourlyRate = 0;
let isLocalMode = true;
let energyRegenerationInterval = null;
let isVibrationEnabled = localStorage.getItem('vibrationEnabled') === 'true';

// Инициализация переменных
let clickCount = 0;
let lastClickTime = 0;
let clickMultiplier = 1;
let isClicking = false;

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

// Функция обновления отображения энергии
function updateEnergyDisplay() {
    const energyText = document.querySelector('#energyText span');
    const energyBar = document.querySelector('#energyBar');
    
    if (energyText) {
        energyText.textContent = `${energy}/${maxEnergy}`;
    }
    if (energyBar) {
        energyBar.style.width = `${(energy / maxEnergy) * 100}%`;
    }
}

// Функция обновления отображения баланса
function updateBalanceDisplay() {
    const balanceElement = document.querySelector('.balance-value');
    if (balanceElement) {
        balanceElement.textContent = balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
}

// Функция для запуска регенерации энергии
function startEnergyRegeneration() {
    if (energyRegenerationInterval) {
        clearInterval(energyRegenerationInterval);
    }

    energyRegenerationInterval = setInterval(() => {
        if (energy < maxEnergy) {
            energy = Math.min(maxEnergy, energy + 1);
            updateEnergyDisplay();
            saveUserData();
        }
    }, 1000);
}

// Функция сохранения данных пользователя
async function saveUserData() {
    try {
        const userData = {
            energy: energy,
            balance: balance,
            max_energy: maxEnergy
        };
        
        if (window.tg?.initDataUnsafe?.user?.id) {
            await window.db.updateUserData(window.tg.initDataUnsafe.user.id, userData);
        } else {
            localStorage.setItem('userData', JSON.stringify(userData));
        }
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
    }
}

// Функция загрузки данных пользователя
async function loadUserData() {
    try {
        let userData;
        
        if (window.tg?.initDataUnsafe?.user?.id) {
            userData = await window.db.getUserData(window.tg.initDataUnsafe.user.id);
        } else {
            const savedData = localStorage.getItem('userData');
            if (savedData) {
                userData = JSON.parse(savedData);
            }
        }

        if (userData) {
            energy = userData.energy || maxEnergy;
            balance = userData.balance || 0;
            maxEnergy = userData.max_energy || 100;
            
            updateEnergyDisplay();
            updateBalanceDisplay();
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

// Функция для проверки поддержки вибрации
function checkVibrationSupport() {
    return 'vibrate' in navigator;
}

// Функция для вибрации
function vibrate(duration = 50) {
    try {
        if (isVibrationEnabled && checkVibrationSupport()) {
            navigator.vibrate(duration);
        }
    } catch (error) {
        console.error('Ошибка при вибрации:', error);
    }
}

// Обработчик клика
function handleClick(e) {
    e.preventDefault();
    if (!isClicking) {
        isClicking = true;
        
        if (energy > 0) {
            // Уменьшаем энергию
            energy--;
            // Увеличиваем баланс
            balance++;
            
            // Вибрация при клике
            vibrate();
            
            // Обновляем отображение
            updateEnergyDisplay();
            updateBalanceDisplay();
            
            // Сохраняем данные
            saveUserData();
            
            // Добавляем анимацию клика
            const clickerButton = document.querySelector('.clicker-button');
            if (clickerButton) {
                clickerButton.classList.add('clicked');
                setTimeout(() => {
                    clickerButton.classList.remove('clicked');
                }, 100);
            }
        }
        
        setTimeout(() => {
            isClicking = false;
        }, 100);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные пользователя
    loadUserData();
    
    // Запускаем регенерацию энергии
    startEnergyRegeneration();
    
    // Добавляем обработчик для кнопки кликера
    const clickerButton = document.querySelector('.clicker-button');
    if (clickerButton) {
        clickerButton.addEventListener('mousedown', handleClick);
        clickerButton.addEventListener('touchstart', handleClick, { passive: false });
        clickerButton.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Предотвращаем прокрутку на мобильных устройствах
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.click-section')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Отключаем контекстное меню
        clickerButton.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        
        // Предотвращаем выделение текста
        clickerButton.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
        
        // Предотвращаем перетаскивание изображений
        const images = clickerButton.getElementsByTagName('img');
        for (let img of images) {
            img.addEventListener('dragstart', (e) => {
                e.preventDefault();
            });
        }
    }
    
    // Обновляем отображение при возвращении на вкладку
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadUserData();
        }
    });
});

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

// Функция для восстановления энергии
function restoreEnergy() {
    const lastUpdate = parseInt(localStorage.getItem('lastEnergyUpdate')) || Date.now();
    const currentTime = Date.now();
    const secondsPassed = Math.floor((currentTime - lastUpdate) / 1000);
    
    // Добавляем по 1 единице энергии за каждую прошедшую секунду
    energy = Math.min(maxEnergy, energy + secondsPassed);
    updateEnergyDisplay();
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