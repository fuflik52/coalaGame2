// Данные карточек
const cardsData = [
    {
        id: 1,
        title: "Начало пути",
        description: "Коала только начинает своё путешествие. Даёт 120 эвкалипта в час",
        image: "https://res.cloudinary.com/dib4woqge/image/upload/v1735300135/1000000472_wu48p4.png",
        price: 10000,
        income: 120,
        isNew: false
    },
    {
        id: 2,
        title: "Первые деньги",
        description: "Коала заработала свои первые деньги. Продолжаем в том же духе. Добавляет 350 эвкалипта в час",
        image: "https://i.postimg.cc/sxpJmh0S/image.png",
        price: 25000,
        income: 350,
        isNew: false
    },
    {
        id: 3,
        title: "Коала на отдыхе",
        description: "После первых заработанных денег можно хорошенько отдохнуть. Добавляет 800 эвкалипта в час",
        image: "https://i.postimg.cc/pVwWnFHC/image.png",
        price: 50000,
        income: 800,
        isNew: false
    },
    {
        id: 4,
        title: "Снежные забавы",
        description: "Наступила зима, а значит можно хорошо порезвиться в снежки. Но не забываем про прибыль в 1800 эвкалипта в час",
        image: "https://i.postimg.cc/nLCgk3KD/image.png",
        price: 100000,
        income: 1800,
        isNew: false
    },
    {
        id: 5,
        image: "https://i.postimg.cc/wTxjfh3V/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Koala-2.jpg",
        title: "Коала-путешественник",
        description: "Наша коала отправляется в кругосветное путешествие, собирая эвкалипт по всему миру. Приносит 3500 эвкалипта в час",
        price: 200000,
        income: 3500,
        isNew: false
    },
    {
        id: 6,
        image: "https://i.postimg.cc/3JnrGd8c/Leonardo-Phoenix-10-A-whimsical-digital-illustration-of-a-koal-0.jpg",
        title: "Бизнес-коала",
        description: "Пора открывать свой бизнес! Коала в деловом костюме управляет сетью эвкалиптовых плантаций. Добавляет 7000 эвкалипта в час",
        price: 500000,
        income: 7000,
        isNew: false
    },
    {
        id: 7,
        image: "https://i.postimg.cc/zvqbJ67b/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Space-0.jpg",
        title: "Космический исследователь",
        description: "Коала покоряет космос в поисках редких видов эвкалипта на других планетах. Приносит 12000 эвкалипта в час",
        price: 1000000,
        income: 12000,
        isNew: false
    },
    {
        id: 8,
        image: "https://i.postimg.cc/bv23bSh0/Leonardo-Phoenix-10-In-a-whimsical-vibrant-illustration-depict-0.jpg",
        title: "Коала-волшебник",
        description: "Магия и эвкалипт - отличное сочетание! Коала освоила древние заклинания приумножения эвкалипта. Добавляет 20000 эвкалипта в час",
        price: 5000000,
        income: 20000,
        isNew: false
    }
];

// Функция для инициализации секции карточек
function initializeCardsSection() {
    const cardsGrid = document.getElementById('cardsGrid');
    if (!cardsGrid) return;

    // Очищаем текущее содержимое
    cardsGrid.innerHTML = '';

    // Добавляем карточки
    cardsData.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        cardElement.innerHTML = `
            <img src="${card.image}" alt="${card.title}" class="card-image">
            <div class="card-content">
                <div class="card-title">
                    ${card.title}
                    ${card.isNew ? '<span class="new-badge">New</span>' : ''}
                </div>
                <p class="card-description">${card.description}</p>
                <div class="card-stats">
                    <div class="card-price">
                        <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Coins">
                        ${card.price.toLocaleString()}
                    </div>
                    <div class="card-income">
                        +<span>${card.income.toLocaleString()}</span>/час
                    </div>
                </div>
            </div>
        `;

        // Добавляем обработчик клика для покупки
        cardElement.addEventListener('click', () => tryBuyCard(card));

        cardsGrid.appendChild(cardElement);
    });
}

// Функция для попытки купить карточку
async function tryBuyCard(card) {
    try {
        const userId = window.tg?.initDataUnsafe?.user?.id?.toString();
        if (!userId) {
            showNotification('Ошибка: не удалось определить пользователя', 'error');
            return;
        }

        const userData = await window.db.getUserData(userId);
        if (!userData) {
            showNotification('Ошибка: не удалось получить данные пользователя', 'error');
            return;
        }

        if (userData.balance < card.price) {
            showNotification('Недостаточно монет для покупки', 'error');
            return;
        }

        // Обновляем баланс пользователя
        const newBalance = userData.balance - card.price;
        await window.db.updateUserBalance(userId, newBalance);

        // Обновляем отображение баланса
        updateBalanceDisplay(newBalance);

        // Показываем уведомление об успешной покупке
        showNotification(`Вы успешно приобрели "${card.title}"!`, 'success');

    } catch (error) {
        console.error('Ошибка при покупке карточки:', error);
        showNotification('Произошла ошибка при покупке', 'error');
    }
}

// Добавляем инициализацию карточек при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчик для переключения на секцию карточек
    const cardsNavItem = document.querySelector('.nav-item[data-section="cards"]');
    if (cardsNavItem) {
        cardsNavItem.addEventListener('click', () => {
            initializeCardsSection();
        });
    }
}); 