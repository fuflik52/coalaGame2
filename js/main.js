// Общие переменные
let notificationShown = false;

// Текст новостей
const NEWS_TEXT = `🎮 Обновление Koala Game 1.0.1

🌟 Основные изменения:

1. Система покупок:
   ✓ Исправлена проблема с покупкой карточек
   ✓ Улучшено отображение баланса
   ✓ Добавлена защита от случайных покупок

2. Ежедневные награды:
   ✓ Добавлены новые награды (250,000 на 6 день)
   ✓ Увеличена награда за 7 день (500,000)
   ✓ Добавлен 8 день с наградой 1,000,000
   ✓ Сокращено время между получением наград до 1 минуты

3. Промокоды:
   ✓ Добавлена система промокодов
   ✓ Промокод "bonus" даёт 500,000 монет
   ✓ Добавлена защита от повторного использования

4. Интерфейс:
   ✓ Улучшен дизайн настроек
   ✓ Добавлен скролл в разделе Frens
   ✓ Центрирование элементов интерфейса`;

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
    if (!notificationShown) {
        // Проверяем существование контейнера для уведомлений
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.querySelector('.main-content').appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);
        
        notificationShown = true;
        
        setTimeout(() => {
            notification.style.animation = 'slideOutTop 0.3s ease-out forwards';
            setTimeout(() => {
                container.removeChild(notification);
                notificationShown = false;
                
                // Удаляем контейнер, если он пустой
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Навигация между секциями
function switchSection(sectionId) {
    console.log('Switching to section:', sectionId);
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.nav-item');
    
    sections.forEach(section => {
        if (section.id === sectionId + 'Section') {
            section.style.display = 'block';
            section.classList.add('active');
        } else {
            section.style.display = 'none';
            section.classList.remove('active');
        }
    });
    
    navItems.forEach(item => {
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Функция для управления этапами загрузки
function updateLoadingStep(step) {
    const steps = document.querySelectorAll('.loader-step');
    steps.forEach((s, index) => {
        if (index < step) {
            // Этап пройден
            s.classList.remove('active');
            s.classList.add('completed');
            setTimeout(() => {
                s.style.display = 'none';
            }, 500);
        } else if (index === step) {
            // Текущий этап
            s.classList.add('active');
            s.classList.remove('completed');
        } else {
            // Будущий этап
            s.classList.remove('active', 'completed');
        }
    });
}

// Функция инициализации приложения
async function initializeApp() {
    try {
        // Шаг 1: Подключение
        updateLoadingStep(0);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Проверяем наличие Telegram WebApp
        const isTelegramWebApp = window.Telegram?.WebApp != null;
        let userData = null;

        // Шаг 2: Загрузка данных
        updateLoadingStep(1);
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isTelegramWebApp) {
            // Если есть Telegram WebApp, используем его данные
            const telegramId = window.Telegram.WebApp.initDataUnsafe?.user?.id?.toString();
            if (telegramId) {
                userData = await window.db.getUserData(telegramId);
                if (!userData) {
                    userData = await window.db.createNewUser(telegramId);
                }
            }
        }

        // Если нет данных Telegram или произошла ошибка, используем локальные данные
        if (!userData) {
            userData = {
                balance: parseInt(localStorage.getItem('balance')) || 0,
                energy: parseInt(localStorage.getItem('energy')) || 100,
                max_energy: parseInt(localStorage.getItem('maxEnergy')) || 100,
                username: localStorage.getItem('username') || 'Гость'
            };
        }

        // Шаг 3: Инициализация
        updateLoadingStep(2);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Инициализируем интерфейс
        updateBalanceDisplay(userData.balance);
        updateEnergyDisplay(userData.energy, userData.max_energy);
        
        // Показываем основной контент
        const mainContent = document.getElementById('mainContent');
        mainContent.style.display = 'block';
        
        // Активируем домашнюю секцию по умолчанию
        switchSection('home');
        
        // Шаг 4: Готово
        updateLoadingStep(3);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Скрываем загрузочный экран
        const loaderScreen = document.getElementById('loaderScreen');
        loaderScreen.classList.add('fade-out');
        setTimeout(() => {
            loaderScreen.style.display = 'none';
        }, 500);

        // Инициализируем карточки
        if (typeof initializeCardsSection === 'function') {
            initializeCardsSection();
        }

        // Настраиваем обработчики событий
        setupEventListeners();

    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        showNotification('Произошла ошибка при загрузке приложения', 'error');
    }
}

// Запускаем инициализацию при загрузке страницы
document.addEventListener('DOMContentLoaded', initializeApp);

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчик для кнопки Home
    document.querySelector('.home-button')?.addEventListener('click', () => {
        console.log('Home button clicked');
        switchSection('home');
    });

    // Обработчик для кнопки Avatar
    document.querySelector('.avatar-button')?.addEventListener('click', () => {
        console.log('Avatar button clicked');
        switchSection('profile');
    });

    // Обработчик для кнопки новостей
    document.querySelector('.news-button')?.addEventListener('click', () => {
        console.log('News button clicked');
        showNews();
    });

    // Обработчики для навигационных элементов
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const section = e.currentTarget.getAttribute('data-section');
            console.log('Navigation item clicked:', section);
            switchSection(section);
        });
    });
}

// Функция показа новостей
function showNews() {
    const newsModal = document.createElement('div');
    newsModal.className = 'news-modal';
    newsModal.innerHTML = `
        <div class="news-content">
            <button class="close-news">×</button>
            <h2>Новости и обновления</h2>
            <pre class="news-text">${NEWS_TEXT}</pre>
        </div>
    `;
    document.body.appendChild(newsModal);
    
    // Показываем модальное окно
    setTimeout(() => {
        newsModal.style.opacity = '1';
    }, 10);
    
    // Обработчик закрытия
    const closeBtn = newsModal.querySelector('.close-news');
    closeBtn.addEventListener('click', () => {
        newsModal.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(newsModal);
        }, 300);
    });
}

// Функция включения всех элементов управления
function enableAllControls() {
    document.querySelectorAll('button, .nav-item, .card, .home-button, .avatar-button').forEach(element => {
        element.style.pointerEvents = 'auto';
        element.style.cursor = 'pointer';
    });
}

// Функция для обновления отображения баланса
async function updateBalanceDisplay(balance) {
    const balanceElement = document.querySelector('.balance-value');
    if (balanceElement) {
        // Если баланс передан как параметр, используем его
        if (typeof balance === 'number') {
            balanceElement.textContent = balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            return;
        }
        
        // Иначе получаем актуальный баланс из базы данных
        try {
            const userData = await window.db.getUserData(window.tg?.initDataUnsafe?.user?.id?.toString());
            if (userData) {
                balanceElement.textContent = userData.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }
        } catch (error) {
            console.error('Ошибка при обновлении отображения баланса:', error);
        }
    }
}

// Функция обновления отображения энергии
function updateEnergyDisplay(currentEnergy, maxEnergy) {
    const energyText = document.querySelector('#energyText span');
    const energyBar = document.querySelector('#energyBar');
    
    if (energyText) {
        energyText.textContent = `${currentEnergy}/${maxEnergy}`;
    }
    if (energyBar) {
        energyBar.style.width = `${(currentEnergy / maxEnergy) * 100}%`;
    }
}
