// Инициализация Supabase
const SUPABASE_URL = 'https://xvmjotofqhnkxatfmqxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bWpvdG9mcWhua3hhdGZtcXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxODQwNDUsImV4cCI6MjA1Mzc2MDA0NX0.9Ql8P7P8WpHqbfuTT_fpLAFv4r1Sbn9ChR3F6_bYHbU';

// Создаем клиент Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Получаем данные из Telegram WebApp если они еще не получены
if (!window.tg) {
    window.tg = window.Telegram?.WebApp;
}
const currentUser = window.tg?.initDataUnsafe?.user || {};

class Database {
    constructor() {
        this.isLocalMode = true; // Флаг локального режима
    }

    async getUserData(telegramId) {
        if (this.isLocalMode) {
            return {
                energy: parseInt(localStorage.getItem('energy')) || 100,
                max_energy: parseInt(localStorage.getItem('maxEnergy')) || 100,
                balance: parseInt(localStorage.getItem('balance')) || 0
            };
        }

        try {
            // Код для работы с Supabase
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            // В локальном режиме не логируем ошибки
            if (!this.isLocalMode) {
                console.error('Ошибка при получении данных пользователя:', error);
            }
            return null;
        }
    }

    async updateUserEnergy(telegramId, energy) {
        if (this.isLocalMode) {
            localStorage.setItem('energy', energy);
            return true;
        }

        try {
            const { error } = await supabaseClient
                .from('users')
                .update({ energy })
                .eq('telegram_id', telegramId);

            if (error) throw error;
            return true;
        } catch (error) {
            if (!this.isLocalMode) {
                console.error('Ошибка при обновлении энергии:', error);
            }
            return false;
        }
    }

    async updateUserBalance(telegramId, balance) {
        if (this.isLocalMode) {
            localStorage.setItem('balance', balance);
            return true;
        }

        try {
            const { error } = await supabaseClient
                .from('users')
                .update({ balance })
                .eq('telegram_id', telegramId);

            if (error) throw error;
            return true;
        } catch (error) {
            if (!this.isLocalMode) {
                console.error('Ошибка при обновлении баланса:', error);
            }
            return false;
        }
    }

    async regenerateEnergy(telegramId) {
        if (this.isLocalMode) {
            const currentEnergy = parseInt(localStorage.getItem('energy')) || 100;
            const maxEnergy = parseInt(localStorage.getItem('maxEnergy')) || 100;
            if (currentEnergy < maxEnergy) {
                const newEnergy = Math.min(maxEnergy, currentEnergy + 1);
                localStorage.setItem('energy', newEnergy);
            }
            return true;
        }

        try {
            const userData = await this.getUserData(telegramId);
            if (!userData) return false;

            if (userData.energy < userData.max_energy) {
                const newEnergy = Math.min(userData.max_energy, userData.energy + 1);
                await this.updateUserEnergy(telegramId, newEnergy);
            }
            return true;
        } catch (error) {
            if (!this.isLocalMode) {
                console.error('Ошибка при регенерации энергии:', error);
            }
            return false;
        }
    }

    // Синхронизация локального баланса
    async syncLocalBalance(userId) {
        try {
            const localBalance = parseInt(localStorage.getItem('balance')) || 0;
            const userData = await this.getUserData(userId);
            
            if (userData && userData.balance !== undefined) {
                // Если баланс в базе данных отличается от локального,
                // обновляем локальный баланс
                if (userData.balance !== localBalance) {
                    localStorage.setItem('balance', userData.balance);
                    // Обновляем отображение баланса
                    const balanceElement = document.querySelector('.balance-value');
                    if (balanceElement) {
                        balanceElement.textContent = userData.balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                    }
                }
                return userData.balance;
            }
            return localBalance;
        } catch (error) {
            console.error('Ошибка при синхронизации баланса:', error);
            return parseInt(localStorage.getItem('balance')) || 0;
        }
    }
}

// Экспортируем инстанс базы данных
window.db = new Database();

// Функция для обновления баланса
async function updateUserBalance(telegramId, newBalance) {
    try {
        console.log('Обновляем баланс пользователя:', telegramId, 'Новый баланс:', newBalance);
        const { error } = await supabaseClient
            .from('users')
            .update({ balance: newBalance })
            .eq('telegram_id', telegramId);
        
        if (error) {
            console.error('Ошибка при обновлении баланса:', error);
            return false;
        }
        
        console.log('Баланс успешно обновлен');
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении баланса:', error);
        return false;
    }
}

// Функция для сохранения прогресса наград
async function updateUserRewards(telegramId, currentDay, lastClaimTime) {
    try {
        const { error } = await supabaseClient
            .from('users')
            .update({
                current_day: currentDay,
                last_claim_time: lastClaimTime
            })
            .eq('telegram_id', telegramId);
        
        if (error) {
            console.error('Ошибка при обновлении наград:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении наград:', error);
        return false;
    }
}

// Функция для создания нового пользователя
async function createNewUser() {
    try {
        if (!currentUser.id) {
            console.error('Нет данных пользователя Telegram');
            return null;
        }

        const userData = {
            telegram_id: currentUser.id.toString(),
            username: currentUser.username || 'Пользователь',
            balance: 0,
            current_day: 1,
            last_claim_time: Date.now(),
            energy: 100,
            max_energy: 100,
            last_energy_update: Date.now()
        };

        const { data, error } = await supabaseClient
            .from('users')
            .upsert([userData])
            .select();
        
        if (error) {
            console.error('Ошибка при создании пользователя:', error);
            return null;
        }
        
        return data[0];
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error);
        return null;
    }
}

// Функция для обновления имени пользователя в интерфейсе
function updateUsername() {
    const usernameElement = document.querySelector('.username');
    if (usernameElement && currentUser.username) {
        usernameElement.textContent = currentUser.username;
    }
}

// Функция для обновления энергии
async function updateUserEnergy(telegramId, newEnergy, newMaxEnergy = null) {
    try {
        const updateData = {
            energy: newEnergy,
            last_energy_update: Date.now()
        };
        
        if (newMaxEnergy !== null) {
            updateData.max_energy = newMaxEnergy;
        }

        const { error } = await supabaseClient
            .from('users')
            .update(updateData)
            .eq('telegram_id', telegramId);
        
        if (error) {
            console.error('Ошибка при обновлении энергии:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка при обновлении энергии:', error);
        return false;
    }
}

// Функция для проверки и использования промокода
async function usePromoCode(telegramId, promoCode) {
    try {
        // Получаем информацию о промокоде
        const { data: promoData, error: promoError } = await supabaseClient
            .from('promo_codes')
            .select('*')
            .eq('code', promoCode)
            .single();

        if (promoError || !promoData) {
            return { success: false, message: 'Промокод не найден' };
        }

        // Проверяем срок действия
        if (promoData.expires_at && new Date(promoData.expires_at) < new Date()) {
            return { success: false, message: 'Промокод истек' };
        }

        // Проверяем количество использований
        if (promoData.uses_left <= 0) {
            return { success: false, message: 'Промокод больше не действителен' };
        }

        // Проверяем, использовал ли пользователь этот промокод
        const { data: usedPromo, error: usedError } = await supabaseClient
            .from('used_promo_codes')
            .select('*')
            .eq('user_telegram_id', telegramId)
            .eq('promo_code_id', promoData.id)
            .single();

        if (usedPromo) {
            return { success: false, message: 'Вы уже использовали этот промокод' };
        }

        // Начинаем транзакцию
        const userData = await this.getUserData(telegramId);
        if (!userData) {
            return { success: false, message: 'Ошибка получения данных пользователя' };
        }

        let success = true;
        let newBalance = userData.balance;
        let newEnergy = userData.energy;

        // Применяем награду
        if (promoData.reward_type === 'coins') {
            newBalance += promoData.reward_amount;
            success = await this.updateUserBalance(telegramId, newBalance);
        } else if (promoData.reward_type === 'energy') {
            newEnergy = Math.min(userData.max_energy, userData.energy + promoData.reward_amount);
            success = await this.updateUserEnergy(telegramId, newEnergy);
        }

        if (!success) {
            return { success: false, message: 'Ошибка при начислении награды' };
        }

        // Записываем использование промокода
        const { error: usageError } = await supabaseClient
            .from('used_promo_codes')
            .insert([{
                user_telegram_id: telegramId,
                promo_code_id: promoData.id
            }]);

        if (usageError) {
            console.error('Ошибка при записи использования промокода:', usageError);
            return { success: false, message: 'Ошибка при использовании промокода' };
        }

        // Уменьшаем количество доступных использований
        const { error: updateError } = await supabaseClient
            .from('promo_codes')
            .update({ uses_left: promoData.uses_left - 1 })
            .eq('id', promoData.id);

        if (updateError) {
            console.error('Ошибка при обновлении промокода:', updateError);
        }

        return {
            success: true,
            message: `Вы получили ${promoData.reward_amount} ${promoData.reward_type === 'coins' ? 'монет' : 'энергии'}!`,
            reward: {
                type: promoData.reward_type,
                amount: promoData.reward_amount
            }
        };
    } catch (error) {
        console.error('Ошибка при использовании промокода:', error);
        return { success: false, message: 'Произошла ошибка при использовании промокода' };
    }
} 