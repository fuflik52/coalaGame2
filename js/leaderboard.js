class Leaderboard {
    constructor() {
        this.container = document.querySelector('.leaderboard-container');
    }

    async init() {
        await this.updateLeaderboard();
    }

    async updateLeaderboard() {
        try {
            const players = await this.fetchLeaderboardData();
            if (!players || !Array.isArray(players)) {
                console.error('Ошибка: данные таблицы лидеров отсутствуют или имеют неверный формат');
                return;
            }
            this.renderLeaderboard(players);
        } catch (error) {
            console.error('Ошибка при обновлении таблицы лидеров:', error);
        }
    }

    async fetchLeaderboardData() {
        // Заглушка для тестирования
        return [
            { username: 'Игрок 1', score: 1000 },
            { username: 'Игрок 2', score: 800 },
            { username: 'Игрок 3', score: 600 }
        ];
    }

    renderLeaderboard(players) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <h2>Таблица лидеров</h2>
            <div class="leaderboard-list">
                ${players.map((player, index) => `
                    <div class="leaderboard-item">
                        <span class="position">${index + 1}</span>
                        <span class="username">${player.username}</span>
                        <span class="score">${player.score}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Инициализация таблицы лидеров
document.addEventListener('DOMContentLoaded', () => {
    const leaderboard = new Leaderboard();
    leaderboard.init();
}); 