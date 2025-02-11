// Данные карточек
const cardsData = [
    {
        id: 1,
        title: "Начало пути",
        description: "Коала только начинает своё путешествие!",
        image: "https://res.cloudinary.com/dib4woqge/image/upload/v1735300135/1000000472_wu48p4.png",
        price: 10000,
        income: 120,
        level: 1
    },
    {
        id: 2,
        title: "Первые деньги",
        description: "Коала заработала свои первые деньги. Продолжаем в том же духе!",
        image: "https://i.postimg.cc/sxpJmh0S/image.png",
        price: 25000,
        income: 350,
        level: 2
    },
    {
        id: 3,
        title: "Коала на отдыхе",
        description: "После заработанных денег можно хорошенько отдохнуть!",
        image: "https://i.postimg.cc/pVwWnFHC/image.png",
        price: 50000,
        income: 800,
        level: 3
    },
    {
        id: 4,
        title: "Снежные забавы",
        description: "Зима подходит к концу, скоро масленица! Самое время для последних зимних развлечений!",
        image: "https://i.postimg.cc/nLCgk3KD/image.png",
        price: 100000,
        income: 1800,
        level: 4
    },
    {
        id: 5,
        title: "Коала-путешественник",
        description: "Наша коала отправляется в кругосветное путешествие, собирая эвкалипт по всему миру!",
        image: "https://i.postimg.cc/wTxjfh3V/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Koala-2.jpg",
        price: 200000,
        income: 3500,
        level: 5
    },
    {
        id: 6,
        title: "Бизнес-коала",
        description: "А вот и первый бизнес! Коала управляет сетью эвкалиптовых плантаций!",
        image: "https://i.postimg.cc/3JnrGd8c/Leonardo-Phoenix-10-A-whimsical-digital-illustration-of-a-koal-0.jpg",
        price: 500000,
        income: 7000,
        level: 6
    },
    {
        id: 7,
        title: "Космический исследователь",
        description: "Коала покоряет космос в поисках редких видов эвкалипта, древних артефактов и новых форм жизни!",
        image: "https://i.postimg.cc/zvqbJ67b/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Space-0.jpg",
        price: 1000000,
        income: 12000,
        level: 7
    },
    {
        id: 8,
        title: "Коала-маг",
        description: "Магия и эвкалипт - отличное сочетание! Коала овладела древними знаниями приумножения эвкалипта!",
        image: "https://i.postimg.cc/bv23bSh0/Leonardo-Phoenix-10-In-a-whimsical-vibrant-illustration-depict-0.jpg",
        price: 5000000,
        income: 20000,
        level: 8
    }
];

// Функция для создания карточек
function createCards() {
    const cardsGrid = document.getElementById('cardsGrid');
    if (!cardsGrid) return;
    
    cardsGrid.innerHTML = ''; // Очищаем контейнер

    cardsData.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        cardElement.dataset.description = card.description;
        cardElement.dataset.income = card.income;
        cardElement.dataset.level = card.level;
        
        cardElement.innerHTML = `
            <img src="${card.image}" alt="${card.title}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${card.title}</h3>
                <div class="card-stats">
                    <div class="card-price">
                        <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Currency">
                        <span>${card.price.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем обработчик клика для каждой карточки
        cardElement.addEventListener('click', () => showCardModal(card));
        
        cardsGrid.appendChild(cardElement);
    });
}

// Функция для отображения модального окна карточки
function showCardModal(cardData) {
    const cardsContainer = document.querySelector('.cards-container');
    if (!cardsContainer) return;

    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Определяем градиент фона в зависимости от ID карточки
    let backgroundGradient;
    switch(cardData.id) {
        case 1:
            backgroundGradient = 'linear-gradient(180deg, rgba(217, 196, 175, 0.95) 0%, rgba(186, 168, 150, 0.98) 100%)';
            break;
        case 2:
            backgroundGradient = 'linear-gradient(180deg, rgba(21, 71, 52, 0.95) 0%, rgba(15, 48, 35, 0.98) 100%)';
            break;
        case 3:
            backgroundGradient = 'linear-gradient(180deg, rgba(210, 180, 140, 0.95) 0%, rgba(180, 150, 110, 0.98) 100%)';
            break;
        case 4:
            backgroundGradient = 'linear-gradient(180deg, rgba(65, 105, 145, 0.95) 0%, rgba(45, 73, 101, 0.98) 100%)';
            break;
        case 5:
            backgroundGradient = 'linear-gradient(180deg, rgba(255, 198, 88, 0.95) 0%, rgba(222, 172, 77, 0.98) 100%)';
            break;
        case 6:
            backgroundGradient = 'linear-gradient(180deg, rgba(139, 69, 19, 0.95) 0%, rgba(101, 50, 14, 0.98) 100%)';
            break;
        case 7:
            backgroundGradient = 'linear-gradient(180deg, rgba(70, 130, 180, 0.95) 0%, rgba(49, 91, 126, 0.98) 100%)';
            break;
        case 8:
            backgroundGradient = 'linear-gradient(180deg, rgba(34, 139, 34, 0.95) 0%, rgba(24, 97, 24, 0.98) 100%)';
            break;
        default:
            backgroundGradient = 'linear-gradient(180deg, rgba(35, 35, 35, 0.95) 0%, rgba(25, 25, 25, 0.98) 100%)';
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="background: ${backgroundGradient}">
            <div class="modal-header">
                <h2>${cardData.title}</h2>
                <button class="close-button">×</button>
            </div>
            <img src="${cardData.image}" alt="${cardData.title}" class="card-image">
            <div class="description-box">
                ${cardData.description}
            </div>
            <div class="stats-bar">
                <span class="stats-label">Уровень:</span>
                <span class="stats-value">${cardData.level}</span>
            </div>
            <div class="stats-bar">
                <span class="stats-label">Цена:</span>
                <span class="stats-value">${cardData.price.toLocaleString()} <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Currency"></span>
            </div>
            <div class="stats-bar">
                <span class="stats-label">Прибыль:</span>
                <span class="stats-value">+${cardData.income.toLocaleString()}/час</span>
            </div>
            <button class="buy-button">Купить</button>
        </div>
    `;

    // Скрываем сетку карточек
    const cardsGrid = document.querySelector('.cards-grid');
    if (cardsGrid) {
        cardsGrid.style.display = 'none';
    }

    // Скрываем заголовок секции
    const cardsHeader = document.querySelector('.cards-header');
    if (cardsHeader) {
        cardsHeader.style.display = 'none';
    }

    cardsContainer.appendChild(modal);
    
    // Показываем модальное окно с анимацией
    requestAnimationFrame(() => {
        modal.style.display = 'block';
        modal.style.opacity = '1';
        setTimeout(() => modal.classList.add('active'), 50);
    });

    // Обработчик закрытия
    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.classList.remove('active');
        modal.style.opacity = '0';
        
        // Показываем обратно сетку карточек и заголовок
        if (cardsGrid) {
            cardsGrid.style.display = 'grid';
        }
        if (cardsHeader) {
            cardsHeader.style.display = 'block';
        }
        
        setTimeout(() => modal.remove(), 300);
    });

    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            modal.style.opacity = '0';
            
            // Показываем обратно сетку карточек и заголовок
            if (cardsGrid) {
                cardsGrid.style.display = 'grid';
            }
            if (cardsHeader) {
                cardsHeader.style.display = 'block';
            }
            
            setTimeout(() => modal.remove(), 300);
        }
    });

    // Обработчик кнопки покупки
    const buyButton = modal.querySelector('.buy-button');
    buyButton.addEventListener('click', () => {
        if (window.balance >= cardData.price) {
            // Реализация покупки
            console.log('Покупка карточки:', cardData.title);
            window.showNotification(`Вы успешно приобрели "${cardData.title}"!`, 'success');
        } else {
            window.showNotification('Недостаточно средств для покупки', 'error');
        }
    });
}

// Функция покупки карточки
function buyCard(cardId) {
    const card = cardsData.find(c => c.id === cardId);
    if (!card) return;

    // Здесь будет логика покупки
    if (window.balance >= card.price) {
        // Реализация покупки
        console.log('Покупка карточки:', card.title);
        window.showNotification(`Вы успешно приобрели "${card.title}"!`, 'success');
    } else {
        window.showNotification('Недостаточно средств для покупки', 'error');
    }
}

// Делаем функцию buyCard доступной глобально
window.buyCard = buyCard;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', createCards); 