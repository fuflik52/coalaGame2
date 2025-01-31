class NumberGame {
    constructor() {
        this.grid = Array(5).fill().map(() => Array(5).fill(0));
        this.size = 5;
        this.score = 0;
        this.moves = 0;
        this.attempts = 5;
        this.isPlaying = false;
        
        // Получаем элементы DOM
        this.gameBoard = document.querySelector('.game-board');
        this.gridContainer = document.querySelector('.grid-container');
        this.scoreDisplay = document.querySelector('.score-value');
        this.movesDisplay = document.querySelector('.moves-value');
        this.attemptsDisplay = document.querySelector('.attempts-counter');
        
        if (!this.gameBoard || !this.gridContainer) {
            console.error('Не найдены необходимые элементы игры');
            return;
        }
        
        this.initializeGame();
        
        // Добавляем в window для доступа из консоли
        window.showLoseModal = () => {
            this.showLoseModal();
        };
    }

    showLoseModal() {
        // Создаем модальное окно
        const modalHTML = `
            <div class="lose-modal">
                <div class="modal-content">
                    <div class="modal-title">Игра окончена!</div>
                    <div class="modal-text">
                        К сожалению, не удалось набрать нужное количество очков.
                        <br>
                        Ваш счёт: ${this.score}
                    </div>
                    <div class="modal-buttons">
                        <button class="modal-button retry">Попробовать снова</button>
                        <button class="modal-button exit">Выйти</button>
                    </div>
                </div>
            </div>
        `;

        // Удаляем старое модальное окно, если оно есть
        const oldModal = this.gameBoard.querySelector('.lose-modal');
        if (oldModal) {
            oldModal.remove();
        }

        // Добавляем новое модальное окно
        this.gameBoard.insertAdjacentHTML('beforeend', modalHTML);
        
        // Показываем модальное окно
        const modal = this.gameBoard.querySelector('.lose-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Добавляем обработчики для кнопок
            const retryButton = modal.querySelector('.retry');
            const exitButton = modal.querySelector('.exit');
            
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    modal.remove();
                    this.startGame();
                });
            }
            
            if (exitButton) {
                exitButton.addEventListener('click', () => {
                    modal.remove();
                    this.exitGame();
                    this.gameBoard.classList.remove('active');
                });
            }
        }
    }

    initializeGame() {
        // Создаем сетку и добавляем обработчики событий
        this.createGrid();
        this.addEventListeners();
    }

    createGrid() {
        this.gridContainer.innerHTML = '';
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                this.gridContainer.appendChild(cell);
            }
        }
    }

    addEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.initializeTouchEvents();
    }
}

// Инициализация игры
let gameInstance;
document.addEventListener('DOMContentLoaded', () => {
    gameInstance = new NumberGame();
});

// Обработчик для кнопок получения награды
const claimButtons = document.querySelectorAll('.claim-reward');
claimButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (window.addBalance) {
            window.addBalance(1000);
        }
        button.disabled = true;
        button.textContent = 'Награда получена';
        
        // Обновляем статистику
        const completedElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
        if (completedElement) {
            const completed = parseInt(completedElement.textContent) || 0;
            completedElement.textContent = completed + 1;
        }
        
        const earnedElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
        if (earnedElement) {
            const earned = parseInt(earnedElement.textContent) || 0;
            earnedElement.textContent = earned + 1000;
        }

        // Скрываем игровое поле и удаляем класс active
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.classList.remove('active');
            gameBoard.style.display = 'none';
        }

        // Закрываем модальное окно
        const modal = button.closest('.game-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        }

        // Создаем серпантин
        createConfetti();
    });
}); 