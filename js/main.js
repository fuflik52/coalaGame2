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

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('mainContent');
    const loaderScreen = document.getElementById('loaderScreen');
    
    // Удаляем приветственное сообщение, если оно существует
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Показываем основной контент
    setTimeout(() => {
        loaderScreen.style.display = 'none';
        mainContent.style.display = 'block';
        initializeApp();
    }, 2000);

    // Добавляем обработчики событий
    setupEventListeners();
});

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

// Функция инициализации приложения
function initializeApp() {
    const mainContent = document.getElementById('mainContent');
    mainContent.style.display = 'block';
    
    // Активируем домашнюю секцию по умолчанию
    switchSection('home');
    
    // Обновляем отображение баланса
    updateBalanceDisplay();
    
    // Включаем все кнопки и элементы управления
    enableAllControls();
}

// Функция включения всех элементов управления
function enableAllControls() {
    document.querySelectorAll('button, .nav-item, .card, .home-button, .avatar-button').forEach(element => {
        element.style.pointerEvents = 'auto';
        element.style.cursor = 'pointer';
    });
}

function createCard(data) {
    return `
        <div class="card" onclick="tryBuyCard(${data.price})">
            <img src="${data.image}" alt="${data.title}">
            <div class="card-content">
                <h3>${data.title} ${data.isNew ? '<span class="new">NEW</span>' : ''}</h3>
                <p>${data.description}</p>
                <div class="card-footer">
                    <div class="price">
                        <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Монеты">
                        <span class="card-price">${data.price}</span>
                    </div>
                    <div class="income">
                        <span>+${data.income}/час</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Функция для обновления отображения баланса
async function updateBalanceDisplay(balance) {
    const balanceElement = document.querySelector('.balance');
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
