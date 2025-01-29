// Инициализация Supabase
const SUPABASE_URL = 'https://xvmjotofqhnkxatfmqxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bWpvdG9mcWhua3hhdGZtcXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxODQwNDUsImV4cCI6MjA1Mzc2MDA0NX0.9Ql8P7P8WpHqbfuTT_fpLAFv4r1Sbn9ChR3F6_bYHbU';

// Создаем клиент Supabase и экспортируем его в глобальный объект
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Экспортируем клиент в глобальный объект
window.db = {
    supabaseClient: supabaseClient
};

// Получаем данные из Telegram WebApp если они еще не получены
if (!window.tg) {
    window.tg = window.Telegram?.WebApp;
}
const currentUser = window.tg?.initDataUnsafe?.user || {};

// Функция для получения данных пользователя по Telegram ID
async function getUserData(telegramId) {
    try {
        console.log('Получаем данные пользователя:', telegramId);
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('Пользователь не найден:', telegramId);
                return null;
            }
            console.error('Ошибка при получении данных:', error);
            return null;
        }
        
        console.log('Получены данные пользователя:', data);
        return data;
    } catch (error) {
        console.error('Ошибка при получении данных:', error);
        return null;
    }
}

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
        const userData = await getUserData(telegramId);
        if (!userData) {
            return { success: false, message: 'Ошибка получения данных пользователя' };
        }

        let success = true;
        let newBalance = userData.balance;
        let newEnergy = userData.energy;

        // Применяем награду
        if (promoData.reward_type === 'coins') {
            newBalance += promoData.reward_amount;
            success = await updateUserBalance(telegramId, newBalance);
        } else if (promoData.reward_type === 'energy') {
            newEnergy = Math.min(userData.max_energy, userData.energy + promoData.reward_amount);
            success = await updateUserEnergy(telegramId, newEnergy);
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

// Функция для восстановления энергии
async function regenerateEnergy(telegramId) {
    try {
        const userData = await getUserData(telegramId);
        if (!userData) return false;

        const now = Date.now();
        const timePassed = now - userData.last_energy_update;
        const energyToAdd = Math.floor(timePassed / (5 * 60 * 1000)); // 1 энергия каждые 5 минут

        if (energyToAdd > 0 && userData.energy < userData.max_energy) {
            const newEnergy = Math.min(userData.max_energy, userData.energy + energyToAdd);
            return await updateUserEnergy(telegramId, newEnergy);
        }

        return true;
    } catch (error) {
        console.error('Ошибка при восстановлении энергии:', error);
        return false;
    }
}

// Функция для синхронизации локального баланса с базой данных
async function syncLocalBalance(telegramId) {
    try {
        // Получаем локальный баланс из localStorage, если он есть
        const localBalance = parseInt(localStorage.getItem('balance') || '0');
        
        if (localBalance > 0) {
            console.log('Найден локальный баланс:', localBalance);
            
            // Обновляем баланс в базе данных
            const { error } = await supabaseClient
                .from('users')
                .update({ balance: localBalance })
                .eq('telegram_id', telegramId);
            
            if (error) {
                console.error('Ошибка при синхронизации баланса:', error);
                return false;
            }
            
            // Очищаем локальное хранилище
            localStorage.removeItem('balance');
            console.log('Локальный баланс успешно синхронизирован с базой данных');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Ошибка при синхронизации баланса:', error);
        return false;
    }
}

// Экспортируем функции и данные
window.db = {
    getUserData,
    updateUserBalance,
    updateUserRewards,
    createNewUser,
    updateUsername,
    currentUser,
    updateUserEnergy,
    usePromoCode,
    regenerateEnergy,
    syncLocalBalance
}; 