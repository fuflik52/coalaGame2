// Инициализация Supabase
const SUPABASE_URL = 'https://xvmjotofqhnkxatfmqxc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bWpvdG9mcWhua3hhdGZtcXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxODQwNDUsImV4cCI6MjA1Mzc2MDA0NX0.9Ql8P7P8WpHqbfuTT_fpLAFv4r1Sbn9ChR3F6_bYHbU';

// Создаем клиент Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Получаем данные из Telegram WebApp
const tg = window.Telegram.WebApp;
const initData = tg.initData || '';
const initDataUnsafe = tg.initDataUnsafe || {};
const currentUser = initDataUnsafe.user || {};

// Функция для получения данных пользователя
async function getUserData(userId) {
    const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Ошибка при получении данных:', error);
        return null;
    }
    
    return data;
}

// Функция для обновления баланса
async function updateUserBalance(userId, newBalance) {
    const { data, error } = await supabaseClient
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);
    
    if (error) {
        console.error('Ошибка при обновлении баланса:', error);
        return false;
    }
    
    return true;
}

// Функция для сохранения прогресса наград
async function updateUserRewards(userId, currentDay, lastClaimTime) {
    const { data, error } = await supabaseClient
        .from('users')
        .update({
            current_day: currentDay,
            last_claim_time: lastClaimTime
        })
        .eq('id', userId);
    
    if (error) {
        console.error('Ошибка при обновлении наград:', error);
        return false;
    }
    
    return true;
}

// Функция для создания нового пользователя
async function createNewUser(userData) {
    // Добавляем данные из Telegram
    const telegramData = {
        telegram_id: currentUser.id?.toString(),
        username: currentUser.username || 'Пользователь',
        first_name: currentUser.first_name,
        last_name: currentUser.last_name,
        ...userData
    };

    const { data, error } = await supabaseClient
        .from('users')
        .insert([
            {
                balance: 0,
                current_day: 1,
                last_claim_time: Date.now(),
                ...telegramData
            }
        ])
        .select();
    
    if (error) {
        console.error('Ошибка при создании пользователя:', error);
        return null;
    }
    
    return data[0];
}

// Функция для обновления имени пользователя в интерфейсе
function updateUsername() {
    const usernameElement = document.querySelector('.username');
    if (usernameElement) {
        usernameElement.textContent = currentUser.username || 'Пользователь';
    }
}

// Экспортируем функции
window.db = {
    getUserData,
    updateUserBalance,
    updateUserRewards,
    createNewUser,
    updateUsername,
    currentUser
}; 