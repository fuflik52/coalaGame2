class SnowAnimation {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.snowflakes = [];
        this.isActive = false;
        this.setupCanvas();
        this.createSnowflakes();
    }

    setupCanvas() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createSnowflakes() {
        const numberOfSnowflakes = Math.floor(window.innerWidth * window.innerHeight / 10000);
        for (let i = 0; i < numberOfSnowflakes; i++) {
            this.snowflakes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                speed: Math.random() * 1 + 0.5,
                wind: Math.random() * 0.5 - 0.25
            });
        }
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        this.snowflakes.forEach(snowflake => {
            this.ctx.beginPath();
            this.ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
            this.ctx.fill();

            snowflake.y += snowflake.speed;
            snowflake.x += snowflake.wind;

            if (snowflake.y > this.canvas.height) {
                snowflake.y = -5;
                snowflake.x = Math.random() * this.canvas.width;
            }
            if (snowflake.x > this.canvas.width) {
                snowflake.x = 0;
            } else if (snowflake.x < 0) {
                snowflake.x = this.canvas.width;
            }
        });

        requestAnimationFrame(() => this.animate());
    }

    start() {
        if (!this.isActive) {
            this.isActive = true;
            document.body.appendChild(this.canvas);
            this.animate();
            localStorage.setItem('snowEnabled', 'true');
        }
    }

    stop() {
        if (this.isActive) {
            this.isActive = false;
            document.body.removeChild(this.canvas);
            localStorage.setItem('snowEnabled', 'false');
        }
    }

    toggle() {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
        return this.isActive;
    }
}

// Создаем глобальный экземпляр
window.snowAnimation = new SnowAnimation();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const snowEnabled = localStorage.getItem('snowEnabled') === 'true';
    if (snowEnabled) {
        window.snowAnimation.start();
    }
}); 