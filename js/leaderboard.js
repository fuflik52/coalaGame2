class Leaderboard {
    constructor() {
        this.container = document.querySelector('.leaderboard-container');
        this.updateInterval = null;
        this.init();
    }

    async init() {
        if (!this.container) return;
        
        // Создаем структуру таблицы лидеров
        this.container.innerHTML = `
            <h2>Лучшие игроки недели</h2>
            <div class="leaderboard-list"></div>
        `;

        // Запускаем обновление каждые 5 минут
        await this.updateLeaderboard();
        this.updateInterval = setInterval(() => this.updateLeaderboard(), 5 * 60 * 1000);
    }

    async updateLeaderboard() {
        if (!this.container) return;

        const leaderboardList = this.container.querySelector('.leaderboard-list');
        const topPlayers = await window.db.getTopPlayers(10);

        if (!topPlayers.length) {
            leaderboardList.innerHTML = '<div class="no-players">Пока нет игроков</div>';
            return;
        }

        leaderboardList.innerHTML = topPlayers.map((player, index) => `
            <div class="leaderboard-item">
                <div class="player-rank">${index + 1}</div>
                <div class="player-avatar">
                    <img src="${player.avatar_url || 'https://i.postimg.cc/vBBWGZjL/image.png'}" alt="${player.username}">
                </div>
                <div class="player-info">
                    <div class="player-name">${player.username}</div>
                    <div class="player-score">${player.weekly_score} очков</div>
                </div>
            </div>
        `).join('');
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.leaderboard = new Leaderboard();
}); 