const enemyTypes = [
    { color: 'red', speed: 1, health: 100 },
    { color: 'green', speed: 2, health: 50 },
    { color: 'blue', speed: 0.5, health: 200 }
];

function spawnWave() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            const enemy = {
                x: path[0].x * blockSize + blockSize / 2 - window.enemySize / 2,
                y: path[0].y * blockSize + blockSize / 2 - window.enemySize / 2,
                pathIndex: 0,
                dx: 0,
                dy: 0,
                color: type.color,
                speed: type.speed,
                health: type.health,
                maxHealth: type.health
            };
            window.enemies.push(enemy);
        }, i * 1000); // Spawn enemies at intervals
    }
    requestAnimationFrame(update);
}

function updateEnemies() {
    window.enemies.forEach(enemy => {
        const target = path[enemy.pathIndex];
        const targetX = target.x * blockSize + blockSize / 2 - window.enemySize / 2;
        const targetY = target.y * blockSize + blockSize / 2 - window.enemySize / 2;
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 1) {
            enemy.pathIndex++;
            if (enemy.pathIndex >= path.length) {
                enemy.reachedEnd = true;
                window.health -= 20; // Decrease health by 20
                updateHealthDisplay();
            }
        } else {
            const angle = Math.atan2(dy, dx);
            enemy.dx = Math.cos(angle) * enemy.speed;
            enemy.dy = Math.sin(angle) * enemy.speed;
            enemy.x += enemy.dx;
            enemy.y += enemy.dy;
        }
    });

    // Remove enemies that reached the end
    for (let i = window.enemies.length - 1; i >= 0; i--) {
        if (window.enemies[i].reachedEnd) {
            window.enemies.splice(i, 1);
        }
    }
}

function drawEnemies() {
    window.enemies.forEach(enemy => {
        window.ctx.fillStyle = enemy.color;
        window.ctx.fillRect(enemy.x, enemy.y, window.enemySize, window.enemySize);

        // Draw health bar
        const healthBarWidth = window.enemySize;
        const healthBarHeight = 5;
        const healthBarX = enemy.x;
        const healthBarY = enemy.y - 10;
        const healthPercentage = enemy.health / enemy.maxHealth;
        const healthBarFillWidth = healthBarWidth * healthPercentage;

        window.ctx.fillStyle = 'black';
        window.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        window.ctx.fillStyle = 'green';
        window.ctx.fillRect(healthBarX, healthBarY, healthBarFillWidth, healthBarHeight);
    });
}
