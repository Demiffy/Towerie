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
        showGameOverScreen();
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
            tower.cooldown = Math.floor(60 / tower.fireRate); // Cooldown period adjusted for fire rate
        }
    });
}

function findFurthestEnemyInRange(tower) {
    let furthestEnemy = null;
    let maxDistance = -1;

    window.enemies.forEach(enemy => {
        if (enemy.camouflaged && !tower.canSeeCamouflaged) {
            return; // Skip camouflaged enemies if the tower cannot see them
        }

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
        dx: Math.cos(angle) * tower.bulletSpeed,
        dy: Math.sin(angle) * tower.bulletSpeed,
        target,
        damage: tower.damage,
        splashDamage: tower.splashDamage,
        fireDamage: tower.fireDamage,
        slow: tower.slow,
        speed: tower.bulletSpeed,
        type: tower.type,
        creationTime: Date.now() // Track bullet creation time
    };
    window.bullets.push(bullet);
}

function predictTargetPosition(tower, target) {
    const bulletSpeed = tower.bulletSpeed;
    const targetCenterX = target.x + window.enemySize / 2;
    const targetCenterY = target.y + window.enemySize / 2;

    let futureX = targetCenterX;
    let futureY = targetCenterY;
    let remainingDistance = bulletSpeed * 10; // Predict for 10 frames ahead

    for (let i = target.pathIndex; i < path.length - 1 && remainingDistance > 0; i++) {
        const nextBlock = path[i + 1];
        const nextCenterX = nextBlock.x * window.blockSize + window.blockSize / 2;
        const nextCenterY = nextBlock.y * window.blockSize / 2;

        const dx = nextCenterX - futureX;
        const dy = nextCenterY - futureY;
        const distanceToNextBlock = Math.sqrt(dx * dx + dy * dy);

        if (distanceToNextBlock > remainingDistance) {
            const ratio = remainingDistance / distanceToNextBlock;
            futureX += dx * ratio;
            futureY += dy * ratio;
            remainingDistance = 0;
        } else {
            futureX = nextCenterX;
            futureY = nextCenterY;
            remainingDistance -= distanceToNextBlock;
        }
    }

    if (remainingDistance > 0) {
        const lastBlock = path[path.length - 1];
        const lastCenterX = lastBlock.x * window.blockSize + window.blockSize / 2;
        const lastCenterY = lastBlock.y * window.blockSize + window.blockSize / 2;

        const dx = lastCenterX - futureX;
        const dy = lastCenterY - futureY;
        const distanceToLastBlock = Math.sqrt(dx * dx + dy * dy);

        if (distanceToLastBlock > 0) {
            const ratio = remainingDistance / distanceToLastBlock;
            futureX += dx * ratio;
            futureY += dy * ratio;
        }
    }

    return { x: futureX, y: futureY };
}

function updateBullets() {
    const now = Date.now();
    window.bullets.forEach((bullet, index) => {
        const targetCenterX = bullet.target.x + window.enemySize / 2;
        const targetCenterY = bullet.target.y + window.enemySize / 2;

        // Adjust bullet trajectory towards the target
        const dx = targetCenterX - bullet.x;
        const dy = targetCenterY - bullet.y;
        const angle = Math.atan2(dy, dx);

        bullet.dx = Math.cos(angle) * bullet.speed;
        bullet.dy = Math.sin(angle) * bullet.speed;

        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if the bullet has hit the target
        if (distance < 5 || now - bullet.creationTime > 7000) { // Bullet despawns after 7 seconds
            if (bullet.type === 'Mortar') {
                // Apply splash damage for Mortar
                applySplashDamage(bullet);
            } else if (distance < 5 && !bullet.target.dead) {
                const effectiveDamage = bullet.damage - bullet.target.armor; // Armor reduces damage
                bullet.target.health -= Math.max(effectiveDamage, 0); // Ensure damage is not negative
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

function applySplashDamage(bullet) {
    window.enemies.forEach(enemy => {
        const dx = enemy.x - bullet.x;
        const dy = enemy.y - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= bullet.splashDamage) {
            const effectiveDamage = bullet.damage - enemy.armor; // Armor reduces damage
            enemy.health -= Math.max(effectiveDamage, 0); // Ensure damage is not negative

            if (enemy.health <= 0 && !enemy.dead) {
                const reward = enemy.reward;
                enemy.dead = true; // Mark enemy as dead
                updateMoney(reward);
                console.log(`Enemy killed by splash damage! Money increased by ${reward}. Total money: ${window.money}`);
                window.enemies.splice(window.enemies.indexOf(enemy), 1);
                checkWaveEnd();
            }
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
