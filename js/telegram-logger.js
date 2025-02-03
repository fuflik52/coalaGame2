// Подавление логов Telegram WebApp
(function suppressTelegramLogs() {
    // Сохраняем оригинальный console.log
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    // Функция для проверки нужно ли подавить сообщение
    function shouldSuppressMessage(args) {
        // Если аргументов нет или первый аргумент не строка
        if (!args.length || typeof args[0] !== 'string') return false;

        // Паттерны для подавления
        const patterns = [
            /\[Telegram\.WebView\] > postEvent/,
            /\[Telegram\.WebApp\].*(not supported|version)/,
            /Switching to section/,
            /Нет данных пользователя Telegram/,
            /color_key/,
            /color:/,
            /#ffffff/,
            /Не удалось получить данные пользователя Telegram/,
            /Telegram ID не определен/,
            /bg_color/,
            /Navigation item clicked:/,
            /Обновление данных пользователя:/,
            /Не удалось получить ID пользователя Telegram/,
            /ID пользователя не определен/,
            /Не удалось получить Telegram ID/
        ];

        // Преобразуем все аргументы в строку для полной проверки
        const fullMessage = JSON.stringify(args);
        
        return patterns.some(pattern => pattern.test(fullMessage));
    }

    // Переопределяем console.log
    console.log = function(...args) {
        if (!shouldSuppressMessage(args)) {
            originalConsoleLog.apply(console, args);
        }
    };

    // Переопределяем console.warn
    console.warn = function(...args) {
        if (!shouldSuppressMessage(args)) {
            originalConsoleWarn.apply(console, args);
        }
    };

    // Переопределяем console.error
    console.error = function(...args) {
        if (!shouldSuppressMessage(args)) {
            originalConsoleError.apply(console, args);
        }
    };
})(); 