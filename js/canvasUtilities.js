function clearCanvas() {
    window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
}

function drawTowers() {
    window.towers.forEach(tower => {
        window.ctx.fillStyle = 'blue';
        window.ctx.beginPath();
        window.ctx.arc(tower.x, tower.y, window.towerSize / 2, 0, Math.PI * 2);
        window.ctx.fill();
    });
}

function updateHealthDisplay() {
    window.healthInfo.textContent = `Health: ${window.health}`;
    if (window.health <= 0) {
        alert('Game Over');
        location.reload(); // Reload the page to restart the game
    }
}

function updateMoney(amount) {
    window.money += amount;
    window.moneyInfo.textContent = `Money: ${window.money}`;
    console.log(`Money updated by ${amount}. Total money: ${window.money}`);
}

function updateTowers() {
    window.towers.forEach(tower => {
        if (tower.cooldown > 0) {
            tower.cooldown--;
            return;
        }

        const target = findFurthestEnemyInRange(tower);
        if (target) {
            shootBullet(tower, target);
            tower.cooldown = 30; // Cooldown period between shots
        }
    });
}

function findFurthestEnemyInRange(tower) {
    let furthestEnemy = null;
    let maxDistance = -1;

    window.enemies.forEach(enemy => {
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= tower.range && enemy.pathIndex > maxDistance) {
            furthestEnemy = enemy;
            maxDistance = enemy.pathIndex;
        }
    });

    return furthestEnemy;
}

function shootBullet(tower, target) {
    const targetPrediction = predictTargetPosition(tower, target);
    const angle = Math.atan2(targetPrediction.y - tower.y, targetPrediction.x - tower.x);
    const bullet = {
        x: tower.x,
        y: tower.y,
        dx: Math.cos(angle) * 5,
        dy: Math.sin(angle) * 5,
        target,
        damage: tower.damage
    };
    window.bullets.push(bullet);
}

function predictTargetPosition(tower, target) {
    const bulletSpeed = 5;
    const distanceToTarget = Math.sqrt(Math.pow(target.x - tower.x, 2) + Math.pow(target.y - tower.y, 2));
    const timeToReachTarget = distanceToTarget / bulletSpeed;

    const targetX = target.x + target.dx * timeToReachTarget;
    const targetY = target.y + target.dy * timeToReachTarget;

    return { x: targetX, y: targetY };
}

function updateBullets() {
    window.bullets.forEach((bullet, index) => {
        const dx = bullet.target.x - bullet.x;
        const dy = bullet.target.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Adjust trajectory if close to the target
        if (distance < 50) {
            const angle = Math.atan2(dy, dx);
            bullet.dx = Math.cos(angle) * 5;
            bullet.dy = Math.sin(angle) * 5;
        }

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        if (distance < 5) {
            // Hit the target
            if (!bullet.target.dead) {
                bullet.target.health -= bullet.damage; // Deal damage according to the tower's damage
                if (bullet.target.health <= 0) {
                    const reward = bullet.target.reward;
                    bullet.target.dead = true; // Mark enemy as dead
                    updateMoney(reward);
                    console.log(`Enemy killed by bullet! Money increased by ${reward}. Total money: ${window.money}`);
                    window.enemies.splice(window.enemies.indexOf(bullet.target), 1);
                    checkWaveEnd();
                }
            }
            window.bullets.splice(index, 1);
        }
    });
}

function drawBullets() {
    window.bullets.forEach(bullet => {
        window.ctx.fillStyle = 'black';
        window.ctx.beginPath();
        window.ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
        window.ctx.fill();
    });
}
