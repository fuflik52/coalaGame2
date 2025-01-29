const cardsData = [
    {
        id: 1,
        image: "https://res.cloudinary.com/dib4woqge/image/upload/v1735300135/1000000472_wu48p4.png",
        title: "Начало пути",
        description: "Коала только начинает своё путешествие. Даёт 120 эвкалипта в час",
        price: 10000,
        perHour: 120,
        isNew: true
    },
    {
        id: 2,
        image: "https://i.postimg.cc/sxpJmh0S/image.png",
        title: "Первые деньги",
        description: "Коала заработала свои первые деньги. Продолжаем в том же духе. Добавляет 350 эвкалипта в час",
        price: 25000,
        perHour: 350,
        isNew: false
    },
    {
        id: 3,
        image: "https://i.postimg.cc/pVwWnFHC/image.png",
        title: "Коала на отдыхе",
        description: "После первых заработанных денег можно хорошенько отдохнуть. Добавляет 800 эвкалипта в час",
        price: 50000,
        perHour: 800,
        isNew: false
    },
    {
        id: 4,
        image: "https://i.postimg.cc/nLCgk3KD/image.png",
        title: "Снежные забавы",
        description: "Наступила зима, а значит можно хорошо порезвиться в снежки. Но не забываем про прибыль в 1800 эвкалипта в час",
        price: 100000,
        perHour: 1800,
        isNew: false
    },
    {
        id: 5,
        image: "https://i.postimg.cc/wTxjfh3V/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Koala-2.jpg",
        title: "Коала-путешественник",
        description: "Наша коала отправляется в кругосветное путешествие, собирая эвкалипт по всему миру. Приносит 3500 эвкалипта в час",
        price: 200000,
        perHour: 3500,
        isNew: true
    },
    {
        id: 6,
        image: "https://i.postimg.cc/3JnrGd8c/Leonardo-Phoenix-10-A-whimsical-digital-illustration-of-a-koal-0.jpg",
        title: "Бизнес-коала",
        description: "Пора открывать свой бизнес! Коала в деловом костюме управляет сетью эвкалиптовых плантаций. Добавляет 7000 эвкалипта в час",
        price: 500000,
        perHour: 7000,
        isNew: true
    },
    {
        id: 7,
        image: "https://i.postimg.cc/zvqbJ67b/Leonardo-Phoenix-10-A-vibrant-whimsical-illustration-of-Space-0.jpg",
        title: "Космический исследователь",
        description: "Коала покоряет космос в поисках редких видов эвкалипта на других планетах. Приносит 12000 эвкалипта в час",
        price: 1000000,
        perHour: 12000,
        isNew: true
    },
    {
        id: 8,
        image: "https://i.postimg.cc/bv23bSh0/Leonardo-Phoenix-10-In-a-whimsical-vibrant-illustration-depict-0.jpg",
        title: "Коала-волшебник",
        description: "Магия и эвкалипт - отличное сочетание! Коала освоила древние заклинания приумножения эвкалипта. Добавляет 20000 эвкалипта в час",
        price: 5000000,
        perHour: 20000,
        isNew: true
    }
];

function renderCards() {
    const cardsGrid = document.querySelector('.cards-grid');
    if (!cardsGrid) return;

    cardsGrid.innerHTML = cardsData.map(card => `
        <div class="card-item">
            <img src="${card.image}" alt="${card.title}" class="card-image">
            <div class="card-content">
                <div class="card-title">
                    ${card.title}
                    ${card.isNew ? '<span class="new-badge">NEW</span>' : ''}
                </div>
                <div class="card-description">${card.description}</div>
                <div class="card-stats">
                    <div class="card-price" onclick="buyCard(${card.id})">
                        <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Currency">
                        ${card.price}
                    </div>
                    <div class="card-income">
                        +<span>${card.perHour}</span>/час
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function buyCard(cardId) {
    try {
        const card = cardsData.find(c => c.id === cardId);
        if (!card) {
            console.error('Карта не найдена:', cardId);
            return;
        }

        // Получаем ID пользователя
        const currentTelegramId = window.tg?.initDataUnsafe?.user?.id?.toString();
        if (!currentTelegramId) {
            console.error('ID пользователя не найден');
            showNotification('Ошибка: не удалось определить пользователя', 'error');
            return;
        }

        // Получаем актуальные данные пользователя из базы
        const userData = await window.db.getUserData(currentTelegramId);
        if (!userData) {
            console.error('Не удалось получить данные пользователя');
            showNotification('Ошибка: не удалось получить данные пользователя', 'error');
            return;
        }

        // Проверяем достаточно ли средств
        if (userData.balance < card.price) {
            showNotification('Недостаточно средств для покупки!', 'error');
            return;
        }

        // Вычитаем стоимость карты из баланса
        const newBalance = userData.balance - card.price;
        
        // Обновляем баланс в базе данных
        const success = await window.db.updateUserBalance(currentTelegramId, newBalance);
        if (!success) {
            console.error('Ошибка при обновлении баланса');
            showNotification('Ошибка при покупке карты', 'error');
            return;
        }

        // Обновляем отображение баланса в интерфейсе
        if (typeof updateBalanceDisplay === 'function') {
            updateBalanceDisplay(newBalance);
        }

        // Показываем уведомление об успешной покупке
        showNotification(`Вы приобрели "${card.title}"!`, 'success');

        // TODO: Добавить логику сохранения купленной карты в базе данных
        // и обновления пассивного дохода пользователя

    } catch (error) {
        console.error('Ошибка при покупке карты:', error);
        showNotification('Произошла ошибка при покупке карты', 'error');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderCards();
}); 