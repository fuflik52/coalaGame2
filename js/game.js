// Этот файл оставлен для будущей реализации игрового функционала
console.log('Game section is under development');

class Game {
    constructor() {
        this.cardsOpened = 0;
        this.adShown = false;
        this.initializeGame();
    }

    initializeGame() {
        // Инициализация кнопки покупки карточки
        const spinButton = document.querySelector('.spin-button');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.startGame());
        }

        // Проверяем поддержку рекламы в Telegram WebApp
        if (window.Telegram?.WebApp?.isSupported) {
            this.initializeAds();
        }
    }

    async startGame() {
        const starBalance = parseInt(localStorage.getItem('starBalance') || '0');
        const cost = 1; // Стоимость одной игры

        if (starBalance < cost) {
            // Если недостаточно звезд, предлагаем посмотреть рекламу
            this.showAdPrompt();
            return;
        }

        // Списываем звезды
        localStorage.setItem('starBalance', (starBalance - cost).toString());
        this.updateStarBalance();

        // Показываем карточки
        this.showCards();
    }

    showAdPrompt() {
        const gameSection = document.querySelector('.game-section');
        if (!gameSection) return;

        const prompt = document.createElement('div');
        prompt.className = 'ad-prompt';
        prompt.innerHTML = `
            <div class="ad-prompt-content">
                <h3>Недостаточно звезд</h3>
                <p>Посмотрите рекламу, чтобы получить бесплатную игру!</p>
                <button class="watch-ad-button">
                    <i class="fas fa-play"></i>
                    Смотреть рекламу
                </button>
            </div>
        `;

        const watchButton = prompt.querySelector('.watch-ad-button');
        watchButton.addEventListener('click', () => this.showAd());

        gameSection.appendChild(prompt);
    }

    async showAd() {
        try {
            if (!this.adShown && window.Telegram?.WebApp?.showAd) {
                await window.Telegram.WebApp.showAd();
                this.adShown = true;
                this.onAdComplete();
            }
        } catch (error) {
            console.error('Ошибка при показе рекламы:', error);
        }
    }

    onAdComplete() {
        // Удаляем промпт рекламы
        const prompt = document.querySelector('.ad-prompt');
        if (prompt) {
            prompt.remove();
        }

        // Даем бесплатную игру
        this.showCards();
    }

    showCards() {
        const cardsContainer = document.querySelector('.cards-container');
        if (!cardsContainer) return;

        cardsContainer.innerHTML = '';

        // Создаем 3 карточки
        for (let i = 0; i < 3; i++) {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <div class="card-question">?</div>
                    </div>
                    <div class="card-back">
                        <div class="card-content">
                            <!-- Содержимое карточки будет добавлено при открытии -->
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => this.openCard(card));
            cardsContainer.appendChild(card);
        }
    }

    openCard(card) {
        if (card.classList.contains('opened')) return;

        card.classList.add('opened');
        this.cardsOpened++;

        // Генерируем случайную награду
        const reward = this.generateReward();
        const cardContent = card.querySelector('.card-content');
        if (cardContent) {
            cardContent.innerHTML = `
                <div class="reward-content">
                    <div class="reward-icon">${reward.icon}</div>
                    <div class="reward-value">+${reward.value}</div>
                    <div class="reward-type">${reward.type}</div>
                </div>
            `;
        }

        // Если открыты все карточки, показываем кнопку "Играть снова"
        if (this.cardsOpened === 3) {
            setTimeout(() => this.showPlayAgainButton(), 1500);
        }
    }

    generateReward() {
        const rewards = [
            { icon: '💰', type: 'монет', minValue: 100, maxValue: 1000 },
            { icon: '⭐', type: 'звезд', minValue: 1, maxValue: 5 },
            { icon: '💎', type: 'кристаллов', minValue: 1, maxValue: 3 }
        ];

        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        const value = Math.floor(Math.random() * (reward.maxValue - reward.minValue + 1)) + reward.minValue;

        return {
            icon: reward.icon,
            type: reward.type,
            value: value
        };
    }

    showPlayAgainButton() {
        const gameSection = document.querySelector('.game-section');
        if (!gameSection) return;

        const button = document.createElement('button');
        button.className = 'play-again-button';
        button.innerHTML = `
            <span>Играть снова</span>
            <div class="price-container">
                <span class="price-value">1</span>
                <img src="https://tapkoala.com/_next/image?url=%2Fimages%2Fstar.png&w=32&q=75" alt="star" class="star-icon">
            </div>
        `;

        button.addEventListener('click', () => {
            button.remove();
            this.cardsOpened = 0;
            this.startGame();
        });

        gameSection.appendChild(button);
    }

    updateStarBalance() {
        const starBalance = parseInt(localStorage.getItem('starBalance') || '0');
        const balanceElement = document.querySelector('.star-balance');
        if (balanceElement) {
            balanceElement.textContent = starBalance;
        }
    }
}

// Инициализация при загрузке страницы
let game = null;
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
}); 