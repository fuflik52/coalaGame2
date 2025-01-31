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
        this.tg = window.Telegram.WebApp;
        this.initApp();
    }

    initApp() {
        try {
            // Инициализируем Telegram WebApp
            this.tg.ready();
            
            // Получаем данные пользователя
            const user = this.tg.initDataUnsafe?.user;
            if (user) {
                this.userId = user.id;
                this.username = user.username;
                this.firstName = user.first_name;
                this.lastName = user.last_name;
                this.photoUrl = user.photo_url;

                // Проверяем параметр startapp для рефералов
                const startParam = new URLSearchParams(window.location.search).get('startapp');
                if (startParam && startParam.startsWith('ref_')) {
                    this.handleReferral(startParam.substring(4));
                }

                // Инициализируем пользователя в базе данных
                this.initUser();
            }
        } catch (error) {
            console.error('Ошибка при инициализации Telegram WebApp:', error);
        }
    }

    async initUser() {
        try {
            const telegramIdStr = String(this.userId);
            const { data, error } = await window.db.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramIdStr)
                .single();

            if (error && error.code === 'PGRST116') {
                // Пользователь не найден, создаем нового
                const { error: insertError } = await window.db.supabase
                    .from('users')
                    .insert([{
                        telegram_id: telegramIdStr,
                        username: this.username,
                        avatar_url: this.photoUrl,
                        energy: 100,
                        balance: 0,
                        max_energy: 100,
                        last_energy_update: new Date().toISOString(),
                        last_seen: new Date().toISOString()
                    }]);

                if (insertError) throw insertError;
            } else if (!error) {
                // Пользователь найден, обновляем last_seen
                const { error: updateError } = await window.db.supabase
                    .from('users')
                    .update({
                        last_seen: new Date().toISOString(),
                        username: this.username,
                        avatar_url: this.photoUrl
                    })
                    .eq('telegram_id', telegramIdStr);

                if (updateError) throw updateError;
            }
        } catch (error) {
            console.error('Ошибка при инициализации пользователя:', error);
        }
    }

    async handleReferral(encodedData) {
        try {
            // Декодируем данные реферала
            const referralData = JSON.parse(atob(encodedData));
            
            // Проверяем валидность данных
            if (referralData.ref && referralData.timestamp) {
                // Проверяем, не истекла ли ссылка (например, 24 часа)
                const linkAge = Date.now() - referralData.timestamp;
                if (linkAge > 24 * 60 * 60 * 1000) {
                    console.log('Реферальная ссылка истекла');
                    return;
                }

                // Добавляем реферала
                await window.db.addReferral(referralData.ref, this.userId);
            }
        } catch (error) {
            console.error('Ошибка при обработке реферальной ссылки:', error);
        }
    }
}

// Создаем экземпляр обработчика Telegram
window.telegramHandler = new TelegramHandler(); 