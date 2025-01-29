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