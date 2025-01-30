// Базовые функции для работы с балансом
function getBalance() {
    return parseInt(localStorage.getItem('balance') || '0');
}

function setBalance(amount) {
    localStorage.setItem('balance', amount.toString());
    updateBalanceDisplay();
}

function updateBalanceDisplay() {
    const balanceElement = document.querySelector('.balance-value');
    if (balanceElement) {
        balanceElement.textContent = getBalance();
    }
}

// Функция добавления денег к балансу
function addMoney(amount) {
    const currentBalance = getBalance();
    const newBalance = currentBalance + parseInt(amount);
    setBalance(newBalance);
    console.log('Added money:', { amount, currentBalance, newBalance });
}

// Функция вычитания денег из баланса
function removeMoney(amount) {
    const currentBalance = getBalance();
    const newBalance = currentBalance - parseInt(amount);
    setBalance(newBalance);
    console.log('Removed money:', { amount, currentBalance, newBalance });
}

// Проверка возможности покупки
function canAfford(price) {
    const balance = getBalance();
    const cost = parseInt(price);
    const canBuy = balance >= cost;
    console.log('Check afford:', { balance, cost, canBuy });
    return canBuy;
}

// Покупка улучшения
function buyUpgrade(price) {
    const cost = parseInt(price);
    const balance = getBalance();
    
    console.log('Try buy:', { balance, cost });
    
    if (balance >= cost) {
        removeMoney(cost);
        console.log('Purchase success');
        return true;
    }
    
    console.log('Purchase failed');
    showNotification('Недостаточно монет', 'error');
    return false;
}

// Функция для отображения цены в карточках
function displayCardPrice(price) {
    return parseInt(price);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    updateBalanceDisplay();
    
    // Обновляем отображение цен в карточках
    const priceElements = document.querySelectorAll('.card-price');
    priceElements.forEach(element => {
        const price = element.textContent;
        element.textContent = displayCardPrice(price);
    });
});

class Game2048 {
    constructor() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.displayScore = 0;
        this.gameActive = false;
        this.comboCount = 0;
        this.lastMergeTime = Date.now();
        this.missions = [
            { score: 500, completed: false, reward: 100 },
            { score: 1000, completed: false, reward: 200 },
            { score: 1500, completed: false, reward: 300 }
        ];
        this.hasInteracted = false;
        this.attempts = parseInt(localStorage.getItem('game2048_attempts')) || 5;
        this.init();
        this.initModals();
    }

    init() {
        this.loadGame();
        this.setupEventListeners();
        this.updateMissions();
        this.renderMissions();
        this.updateAttemptsDisplay();
    }

    initModals() {
        // Создаем модальное окно для проигрыша
        const gameOverModal = document.createElement('div');
        gameOverModal.className = 'game-over-modal';
        gameOverModal.innerHTML = `
            <div class="game-over-title">Игра окончена!</div>
            <div class="game-over-score">Счёт: <span class="final-score">0</span></div>
            <div class="attempts-left">Осталось попыток: <span class="attempts-count">5</span></div>
            <div class="game-over-buttons">
                <button class="retry-button">Начать заново</button>
                <button class="exit-button">Выйти</button>
            </div>
        `;
        document.body.appendChild(gameOverModal);

        // Создаем модальное окно подтверждения
        const confirmRetryModal = document.createElement('div');
        confirmRetryModal.className = 'confirm-retry-modal';
        confirmRetryModal.innerHTML = `
            <div class="confirm-retry-text">
                Начать игру заново? <br>
                Будет потрачена 1 попытка
            </div>
            <div class="confirm-retry-buttons">
                <button class="confirm-button">Подтвердить</button>
                <button class="cancel-button">Отмена</button>
            </div>
        `;
        document.body.appendChild(confirmRetryModal);

        // Добавляем обработчики для кнопок
        const retryButton = gameOverModal.querySelector('.retry-button');
        const confirmButton = confirmRetryModal.querySelector('.confirm-button');
        const cancelButton = confirmRetryModal.querySelector('.cancel-button');

        retryButton.addEventListener('click', () => {
            if (this.attempts > 0) {
                confirmRetryModal.classList.add('active');
            }
        });

        confirmButton.addEventListener('click', () => {
            this.attempts--;
            localStorage.setItem('game2048_attempts', this.attempts);
            this.resetGame();
            confirmRetryModal.classList.remove('active');
            gameOverModal.classList.remove('active');
        });

        cancelButton.addEventListener('click', () => {
            confirmRetryModal.classList.remove('active');
        });

        gameOverModal.querySelector('.exit-button').addEventListener('click', () => {
            this.exitGame();
            gameOverModal.classList.remove('active');
        });
    }

    loadGame() {
        const savedState = localStorage.getItem('game2048State');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.grid && state.score !== undefined) {
                    this.grid = state.grid;
                    this.score = state.score;
                    this.displayScore = state.score;
                    this.missions = state.missions || this.missions;
                } else {
                    this.resetGame();
                }
            } catch (e) {
                console.error('Error loading game state:', e);
                this.resetGame();
            }
        }
    }

    saveGame() {
        const state = {
            grid: this.grid,
            score: this.score,
            missions: this.missions,
            attempts: this.attempts
        };
        localStorage.setItem('game2048State', JSON.stringify(state));
        localStorage.setItem('game2048_attempts', this.attempts);
    }

    setupEventListeners() {
        // Добавляем обработчик для активации вибрации при любом взаимодействии
        const activateInteraction = () => {
            if (!this.hasInteracted) {
                this.hasInteracted = true;
                document.body.classList.add('user-interacted');
            }
        };

        document.addEventListener('click', activateInteraction, { once: true });
        document.addEventListener('touchstart', activateInteraction, { once: true });
        document.addEventListener('keydown', activateInteraction, { once: true });

        // Кнопка старта игры
        const startButton = document.querySelector('.game-start');
        if (startButton) {
            startButton.addEventListener('click', () => {
                document.querySelector('.rules-modal').classList.add('active');
                activateInteraction();
            });
        }

        // Кнопка в правилах для начала игры
        const startGameButton = document.querySelector('.start-game-button');
        if (startGameButton) {
            startGameButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Кнопка выхода
        const exitButtons = document.querySelectorAll('.exit-button');
        exitButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.exitGame();
                document.querySelector('.game-over-modal')?.classList.remove('active');
                document.querySelector('.confirm-retry-modal')?.classList.remove('active');
            });
        });

        // Блокировка навигации во время игры
        const navItems = document.querySelectorAll('.nav-item');
        const bottomNav = document.querySelector('.bottom-nav');
        
        const blockNavigation = (e) => {
            if (this.gameActive) {
                e.preventDefault();
                e.stopPropagation();
                showNotification('Сначала завершите текущую игру', 'warning');
                return false;
            }
        };

        // Блокируем клики по навигации
        navItems.forEach(item => {
            item.addEventListener('click', blockNavigation, true);
        });

        // Блокируем свайпы для навигации
        if (bottomNav) {
            bottomNav.addEventListener('touchstart', blockNavigation, true);
            bottomNav.addEventListener('touchmove', blockNavigation, true);
            bottomNav.addEventListener('touchend', blockNavigation, true);
        }

        // Кнопка перезапуска
        const restartButton = document.querySelector('.restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                if (this.attempts > 0) {
                    const confirmModal = document.querySelector('.confirm-retry-modal');
                    if (confirmModal) confirmModal.classList.add('active');
                } else {
                    showNotification('У вас закончились попытки', 'error');
                }
            });
        }

        // Кнопки в модальном окне подтверждения
        const confirmButton = document.querySelector('.confirm-button');
        const cancelButton = document.querySelector('.cancel-button');
        const confirmModal = document.querySelector('.confirm-retry-modal');

        if (confirmButton && cancelButton && confirmModal) {
            confirmButton.addEventListener('click', () => {
                this.attempts--;
                localStorage.setItem('game2048_attempts', this.attempts);
                this.resetGame();
                confirmModal.classList.remove('active');
                document.querySelector('.game-over-modal')?.classList.remove('active');
                this.updateAttemptsDisplay();
            });

            cancelButton.addEventListener('click', () => {
                confirmModal.classList.remove('active');
            });
        }

        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => {
            if (!this.gameActive) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });

        // Обработка свайпов
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            if (!this.gameActive) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!this.gameActive) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 30; // Минимальное расстояние для свайпа
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                return; // Игнорируем короткие свайпы
            }
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) this.move('right');
                else this.move('left');
            } else {
                if (deltaY > 0) this.move('down');
                else this.move('up');
            }
        }, { passive: true });
    }

    tryVibrate() {
        if (this.hasInteracted && 'vibrate' in navigator) {
            try {
                navigator.vibrate(50);
            } catch (e) {
                console.log('Vibration failed:', e);
            }
        }
    }

    startGame() {
        this.showCountdown().then(() => {
            this.gameActive = true;
            document.querySelector('.rules-modal').classList.remove('active');
            document.querySelector('.game-board').classList.add('active');
            document.querySelector('.game-section').classList.add('game-active');
            if (this.grid.every(row => row.every(cell => cell === 0))) {
                this.addNewTile();
                this.addNewTile();
            }
            this.updateBoard();
            this.updateAttemptsDisplay();
        });
    }

    showCountdown() {
        return new Promise((resolve) => {
            const numbers = [3, 2, 1];
            let index = 0;

            const countdownElement = document.createElement('div');
            countdownElement.className = 'countdown';
            document.body.appendChild(countdownElement);

            const showNumber = () => {
                if (index < numbers.length) {
                    countdownElement.textContent = numbers[index];
                    index++;
                    setTimeout(showNumber, 1000);
                } else {
                    countdownElement.remove();
                    resolve();
                }
            };

            showNumber();
        });
    }

    exitGame() {
        this.gameActive = false;
        this.saveGame();
        
        // Удаляем классы активности
        const gameBoard = document.querySelector('.game-board');
        const gameSection = document.querySelector('.game-section');
        if (gameBoard) gameBoard.classList.remove('active');
        if (gameSection) gameSection.classList.remove('game-active');
        
        // Показываем нижнюю навигацию
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) bottomNav.style.display = '';
        
        // Переключаемся на домашнюю секцию
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.style.display = 'none');
        document.querySelector('#homeSection').style.display = 'block';
        
        // Обновляем активный элемент навигации
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        document.querySelector('.nav-item[data-section="home"]').classList.add('active');
        
        this.renderMissions();
        this.updateBoard();
    }

    addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        if (!this.gameActive) return;

        const oldGrid = JSON.stringify(this.grid);
        const oldScore = this.score;
        const mergedCells = new Set();
        
        switch(direction) {
            case 'up':
                this.moveUp(mergedCells);
                break;
            case 'down':
                this.moveDown(mergedCells);
                break;
            case 'left':
                this.moveLeft(mergedCells);
                break;
            case 'right':
                this.moveRight(mergedCells);
                break;
        }

        if (oldGrid !== JSON.stringify(this.grid)) {
            this.addNewTile();
            
            if (oldScore !== this.score) {
                this.tryVibrate();

                const cells = document.querySelectorAll('.grid-cell[data-value]');
                cells.forEach((cell, index) => {
                    if (mergedCells.has(index)) {
                        cell.classList.add('merging');
                        cell.addEventListener('animationend', () => {
                            cell.classList.remove('merging');
                        }, { once: true });
                    }
                });

                const currentTime = Date.now();
                if (currentTime - this.lastMergeTime < 1000) {
                    this.comboCount++;
                    if (this.comboCount > 1) {
                        this.showCombo(Math.floor((this.score - oldScore) / 2.5));
                    }
                } else {
                    this.comboCount = 1;
                }
                this.lastMergeTime = currentTime;
            }
            
            this.updateScore(Math.floor(this.score / 2.5));
            this.updateMissions();
            this.saveGame();
            this.updateBoard();

            if (this.checkGameOver()) {
                this.gameActive = false;
                this.showGameOver();
            }
        }
    }

    moveLeft(mergedCells) {
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(x => x !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += Math.floor(row[j] / 2.5);
                    row.splice(j + 1, 1);
                    mergedCells.add(i * 4 + j);
                    mergedCells.add(i * 4 + j + 1);
                }
            }
            while (row.length < 4) row.push(0);
            this.grid[i] = row;
        }
    }

    moveRight(mergedCells) {
        for (let i = 0; i < 4; i++) {
            let row = this.grid[i].filter(x => x !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += Math.floor(row[j] / 2.5);
                    row.splice(j - 1, 1);
                    j--;
                    mergedCells.add(i * 4 + j);
                    mergedCells.add(i * 4 + j - 1);
                }
            }
            while (row.length < 4) row.unshift(0);
            this.grid[i] = row;
        }
    }

    moveUp(mergedCells) {
        for (let j = 0; j < 4; j++) {
            let column = this.grid.map(row => row[j]).filter(x => x !== 0);
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += Math.floor(column[i] / 2.5);
                    column.splice(i + 1, 1);
                    mergedCells.add(i * 4 + j);
                    mergedCells.add((i + 1) * 4 + j);
                }
            }
            while (column.length < 4) column.push(0);
            for (let i = 0; i < 4; i++) {
                this.grid[i][j] = column[i];
            }
        }
    }

    moveDown(mergedCells) {
        for (let j = 0; j < 4; j++) {
            let column = this.grid.map(row => row[j]).filter(x => x !== 0);
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += Math.floor(column[i] / 2.5);
                    column.splice(i - 1, 1);
                    i--;
                    mergedCells.add(i * 4 + j);
                    mergedCells.add((i - 1) * 4 + j);
                }
            }
            while (column.length < 4) column.unshift(0);
            for (let i = 0; i < 4; i++) {
                this.grid[i][j] = column[i];
            }
        }
    }

    updateBoard() {
        const boardGrid = document.querySelector('.board-grid');
        if (!boardGrid) return;

        boardGrid.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                const value = this.grid[i][j];
                if (value !== 0) {
                    cell.textContent = value;
                    cell.setAttribute('data-value', value);
                }
                boardGrid.appendChild(cell);
            }
        }

        // Обновляем все элементы со счетом
        const scoreElements = document.querySelectorAll('.game-score');
        scoreElements.forEach(element => {
            element.textContent = `Счёт: ${this.displayScore}`;
        });
    }

    updateMissions() {
        let rewardAdded = false;
        this.missions.forEach(mission => {
            if (!mission.completed && this.score >= mission.score) {
                mission.completed = true;
                const currentBalance = parseInt(localStorage.getItem('balance')) || 0;
                const newBalance = currentBalance + mission.reward;
                localStorage.setItem('balance', newBalance.toString());
                rewardAdded = true;
                
                // Обновляем отображение баланса, если есть функция
                if (typeof updateBalanceDisplay === 'function') {
                    updateBalanceDisplay();
                }
                
                showNotification(`Миссия выполнена! +${mission.reward} монет`, 'success');
            }
        });
        if (rewardAdded) {
            // Дополнительно вызываем обновление баланса
            document.dispatchEvent(new CustomEvent('balanceUpdated'));
        }
        this.renderMissions();
    }

    renderMissions() {
        const missionsContainer = document.querySelector('.game-missions');
        missionsContainer.innerHTML = '';

        this.missions.forEach(mission => {
            const missionCard = document.createElement('div');
            missionCard.className = `mission-card ${mission.completed ? 'completed' : ''}`;
            
            missionCard.innerHTML = `
                <div class="mission-info">
                    <div class="mission-title">Набрать ${mission.score} очков</div>
                    <div class="mission-progress">${Math.min(this.score, mission.score)}/${mission.score}</div>
                </div>
                <div class="mission-reward">
                    <img src="https://i.postimg.cc/FFx7T4Bh/image.png" alt="Reward" style="width: 20px; height: 20px;">
                    ${mission.reward}
                </div>
            `;
            
            missionsContainer.appendChild(missionCard);
        });
    }

    showCombo(value) {
        const comboElement = document.createElement('div');
        comboElement.className = 'combo-notification';
        comboElement.textContent = `КОМБО x${this.comboCount}! +${value}`;
        document.body.appendChild(comboElement);
        
        setTimeout(() => {
            comboElement.remove();
        }, 800);
    }

    updateScore(newScore) {
        const diff = newScore - this.displayScore;
        if (diff <= 0) {
            this.displayScore = newScore;
            this.updateScoreDisplay();
            return;
        }

        const step = Math.max(1, Math.floor(diff / 10));
        const animate = () => {
            if (this.displayScore < newScore) {
                this.displayScore = Math.min(newScore, this.displayScore + step);
                this.updateScoreDisplay();
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    updateScoreDisplay() {
        const scoreElements = document.querySelectorAll('.game-score');
        scoreElements.forEach(element => {
            element.textContent = `Счёт: ${this.displayScore}`;
            element.classList.remove('score-change');
            void element.offsetWidth; // Форсируем перерисовку
            element.classList.add('score-change');
        });
    }

    updateAttemptsDisplay() {
        const attemptsCounter = document.querySelector('.attempts-counter');
        if (attemptsCounter) {
            attemptsCounter.textContent = `Попыток: ${this.attempts}`;
        }
    }

    resetGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.displayScore = 0;
        this.gameActive = true;
        this.comboCount = 0;
        this.addNewTile();
        this.addNewTile();
        this.updateBoard();
        this.updateAttemptsDisplay();
    }

    checkGameOver() {
        // Проверяем наличие пустых ячеек
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // Проверяем возможность объединения по горизонтали
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[i][j] === this.grid[i][j + 1]) return false;
            }
        }

        // Проверяем возможность объединения по вертикали
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === this.grid[i + 1][j]) return false;
            }
        }

        return true;
    }

    showGameOver() {
        const gameOverModal = document.querySelector('.game-over-modal');
        const finalScoreElement = gameOverModal.querySelector('.final-score');
        const attemptsElement = gameOverModal.querySelector('.attempts-count');
        const retryButton = gameOverModal.querySelector('.retry-button');

        finalScoreElement.textContent = this.score;
        attemptsElement.textContent = this.attempts;

        if (this.attempts <= 0) {
            retryButton.disabled = true;
            retryButton.textContent = 'Попытки закончились';
        } else {
            retryButton.disabled = false;
            retryButton.textContent = 'Начать заново';
        }

        gameOverModal.classList.add('active');
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game2048();
}); 