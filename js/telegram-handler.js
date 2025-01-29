// Подавляем логи Telegram WebApp
const originalConsoleLog = console.log;
console.log = function() {
    const args = Array.from(arguments);
    if (!args[0]?.includes?.('[Telegram.WebView]')) {
        originalConsoleLog.apply(console, args);
    }
};

// Инициализация Telegram WebApp
class TelegramHandler {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.initTelegram();
    }

    initTelegram() {
        if (!this.tg) return;

        // Устанавливаем цвета и тему без логирования
        this.tg.setHeaderColor('bg_color');
        this.tg.setBackgroundColor('#ffffff');
        this.tg.ready();

        // Получаем ID пользователя
        const userId = this.tg?.initDataUnsafe?.user?.id;
        if (userId) {
            window.currentTelegramId = userId.toString();
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new TelegramHandler();
        }
        return this.instance;
    }
}

// Экспортируем инстанс
window.telegramHandler = TelegramHandler.getInstance(); 