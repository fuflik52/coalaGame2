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
let hasUserInteracted = false;

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
                const username = window.Telegram.WebApp.initDataUnsafe.user.username || 'Пользователь';
                window.currentTelegramId = userId;
                
                // Обновляем отображаемое имя пользователя
                const usernameElement = document.querySelector('.username');
                if (usernameElement) {
                    usernameElement.textContent = username;
                }
                
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
        if (isVibrationEnabled && hasUserInteracted && checkVibrationSupport()) {
            navigator.vibrate(duration);
        }
    } catch (error) {
        console.error('Ошибка при вибрации:', error);
    }
}

// Функция для показа анимации награды
function showRewardAnimation(reward, coordinates) {
    try {
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
        
        // Собираем элементы
        container.appendChild(text);
        container.appendChild(icon);
        rewardElement.appendChild(container);
        
        // Позиционируем анимацию
        if (coordinates && typeof coordinates.clientX !== 'undefined' && typeof coordinates.clientY !== 'undefined') {
            rewardElement.style.left = `${coordinates.clientX}px`;
            rewardElement.style.top = `${coordinates.clientY}px`;
        } else {
            // Если координаты не переданы, используем центр экрана
            rewardElement.style.left = '50%';
            rewardElement.style.top = '50%';
            rewardElement.style.transform = 'translate(-50%, -50%)';
        }
        
        document.body.appendChild(rewardElement);
        
        // Запускаем анимацию
        requestAnimationFrame(() => {
            rewardElement.style.transform = 'translateY(-100px)';
            rewardElement.style.opacity = '0';
        });
        
        // Удаляем элемент после анимации
        setTimeout(() => {
            if (document.body.contains(rewardElement)) {
                document.body.removeChild(rewardElement);
            }
        }, 2000);
    } catch (error) {
        console.error('Ошибка при показе анимации награды:', error);
    }
}

// Обработчик клика
function handleClick(event) {
    if (!isClicking && energy > 0) {
        event.preventDefault();
        event.stopPropagation();
        isClicking = true;
        
        try {
            // Уменьшаем энергию и увеличиваем баланс
            energy--;
            balance++;

            // Обновляем отображение
            updateEnergyDisplay();
            updateBalanceDisplay();

            // Устанавливаем флаг взаимодействия при первом клике
            hasUserInteracted = true;

            // Получаем координаты для анимации
            let coordinates = {
                clientX: 0,
                clientY: 0
            };

            if (event.type === 'touchstart' && event.touches && event.touches[0]) {
                coordinates.clientX = event.touches[0].clientX;
                coordinates.clientY = event.touches[0].clientY;
            } else if (event.clientX !== undefined && event.clientY !== undefined) {
                coordinates.clientX = event.clientX;
                coordinates.clientY = event.clientY;
            } else {
                const button = event.target.closest('.clicker-button');
                if (button) {
                    const rect = button.getBoundingClientRect();
                    coordinates.clientX = rect.left + rect.width / 2;
                    coordinates.clientY = rect.top + rect.height / 2;
                }
            }

            // Показываем анимацию награды
            showRewardAnimation(1, coordinates);

            // Добавляем анимацию клика
            const clickerButton = event.target.closest('.clicker-button');
            if (clickerButton) {
                clickerButton.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    clickerButton.style.transform = 'scale(1)';
                }, 100);
            }

            // Вибрация после успешного клика
            if (hasUserInteracted) {
                vibrate();
            }

            // Сохраняем данные
            saveUserData();
        } catch (error) {
            console.error('Ошибка при обработке клика:', error);
        }

        // Сбрасываем флаг клика
        setTimeout(() => {
            isClicking = false;
        }, 100);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    // Инициализируем Telegram ID и имя пользователя
    await initializeTelegramId();
    
    // Загружаем данные пользователя
    loadUserData();
    
    // Запускаем регенерацию энергии
    startEnergyRegeneration();
    
    // Добавляем обработчики для кнопки кликера
    const clickerButton = document.querySelector('.clicker-button');
    if (clickerButton) {
        // Добавляем обработчик для первого взаимодействия
        const handleFirstInteraction = (e) => {
            hasUserInteracted = true;
            clickerButton.removeEventListener('mousedown', handleFirstInteraction);
            clickerButton.removeEventListener('touchstart', handleFirstInteraction);
        };

        // Обработчики для мыши и тачскрина с учетом первого взаимодействия
        clickerButton.addEventListener('mousedown', handleFirstInteraction);
        clickerButton.addEventListener('touchstart', handleFirstInteraction, { passive: false });
        
        // Основные обработчики событий
        clickerButton.addEventListener('mousedown', handleClick);
        clickerButton.addEventListener('touchstart', handleClick, { passive: false });
        
        // Предотвращаем стандартные события
        const preventDefaultHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        clickerButton.addEventListener('touchend', preventDefaultHandler, { passive: false });
        clickerButton.addEventListener('touchmove', preventDefaultHandler, { passive: false });
        clickerButton.addEventListener('contextmenu', preventDefaultHandler);
        clickerButton.addEventListener('selectstart', preventDefaultHandler);
        clickerButton.addEventListener('dragstart', preventDefaultHandler);

        // Предотвращаем перетаскивание изображений
        const images = clickerButton.getElementsByTagName('img');
        for (let img of images) {
            img.addEventListener('dragstart', preventDefaultHandler);
        }
    }

    // Добавляем обработчик для первого взаимодействия пользователя
    document.body.addEventListener('click', function onFirstInteraction() {
        hasUserInteracted = true;
        document.body.removeEventListener('click', onFirstInteraction);
    }, { once: true });

    // Обновляем отображение при возвращении на вкладку
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            loadUserData();
        }
    });
});

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