const express = require('express');
const path = require('path');
const app = express();

// Раздача статических файлов
app.use(express.static(path.join(__dirname)));

// Базовый маршрут
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Порт из переменной окружения или 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 