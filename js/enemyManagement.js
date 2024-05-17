function spawnWave() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const enemy = {
                x: path[0].x * blockSize + blockSize / 2 - window.enemySize / 2,
                y: path[0].y * blockSize + blockSize / 2 - window.enemySize / 2,
                pathIndex: 0
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
            enemy.x += Math.cos(angle);
            enemy.y += Math.sin(angle);
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
        window.ctx.fillStyle = 'red';
        window.ctx.fillRect(enemy.x, enemy.y, window.enemySize, window.enemySize);
    });
}
