const towerStats = {
    'Brawler': { range: 75, damage: 10, price: 500, fireRate: 8, bulletSpeed: 10, splashDamage: 5, fireDamage: 0, slow: 1, canSeeCamouflaged: false },
    'Soldier': { range: 150, damage: 25, price: 750, fireRate: 2, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0, canSeeCamouflaged: false },
    'Mortar': { range: 800, damage: 100, price: 1000, fireRate: 0.1, bulletSpeed: 3, splashDamage: 40, fireDamage: 2, slow: 2, canSeeCamouflaged: false },
    'Flamethrower': { range: 100, damage: 2, price: 1500, fireRate: 80, bulletSpeed: 5, splashDamage: 0, fireDamage: 50, slow: 0, canSeeCamouflaged: false },
    'Tower 5': { range: 180, damage: 28, price: 850, fireRate: 5, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0, canSeeCamouflaged: false },
    'Tower 6': { range: 160, damage: 26, price: 700, fireRate: 6, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0, canSeeCamouflaged: false },
    'Tower 7': { range: 140, damage: 24, price: 550, fireRate: 7, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0, canSeeCamouflaged: false },
    'Tower 8': { range: 170, damage: 27, price: 800, fireRate: 8, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0, canSeeCamouflaged: false },
    'Tower 9': { range: 130, damage: 23, price: 650, fireRate: 9, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0, canSeeCamouflaged: true },
    'Sniper': { range: 500, damage: 60, price: 5000, fireRate: 0.2, bulletSpeed: 15, splashDamage: 0, fireDamage: 0, slow: 10, canSeeCamouflaged: true }
};

let insufficientFundsTimeout;
let moneyTextTimeout;
let insufficientFundsActive = false;
let moneyTextActive = false;
let selectedTowerIndex = null;

function handleTowerSelection(event) {
    if (gamePhase === 'preparation') {
        window.selectedTower = event.target.textContent;
        const stats = towerStats[window.selectedTower];
        const canAfford = window.money >= stats.price;
        const priceColor = canAfford ? 'green' : 'red';

        window.towerStatsTitle.textContent = `${window.selectedTower} Stats`;
        window.towerStatsText.innerHTML = `
            Range: ${stats.range} <br>
            Damage: ${stats.damage} <br>
            Fire Rate: ${stats.fireRate} <br>
            Bullet Speed: ${stats.bulletSpeed} <br>
            Splash Damage: ${stats.splashDamage} <br>
            Fire Damage: ${stats.fireDamage} <br>
            Slow: ${stats.slow} <br>
            Can See Camouflaged: ${stats.canSeeCamouflaged} <br>
            <span style="color: ${priceColor}; font-weight: bold;">Price: ${stats.price}</span>
        `;
        window.towerStatsPanel.style.display = 'block';
        console.log(`Selected tower: ${window.selectedTower}`);
    }
}

function handleCanvasClick(event) {
    if (gamePhase === 'preparation') {
        const rect = window.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (window.selectedTower) {
            if (!isPointInPath(x, y) && !isPointNearTower(x, y) && !isPointInObstacle(x, y)) {
                const stats = towerStats[window.selectedTower];
                if (window.money >= stats.price) {
                    window.towers.push({
                        x, y,
                        range: stats.range,
                        damage: stats.damage,
                        cooldown: 0,
                        fireRate: stats.fireRate,
                        bulletSpeed: stats.bulletSpeed,
                        splashDamage: stats.splashDamage,
                        fireDamage: stats.fireDamage,
                        slow: stats.slow,
                        canSeeCamouflaged: stats.canSeeCamouflaged,
                        type: window.selectedTower
                    });
                    updateMoney(-stats.price);
                    console.log(`Tower placed at (${x}, ${y}) with range ${stats.range} and damage ${stats.damage}`);
                    drawTowers();
                } else {
                    showInsufficientFunds();
                    console.log('Not enough money to place this tower');
                }
            } else {
                console.log('Cannot place tower here');
            }
        } else {
            const towerIndex = findTowerAt(x, y);
            if (towerIndex !== -1) {
                selectedTowerIndex = towerIndex;
                showTowerInfo(window.towers[towerIndex], x, y);
            } else {
                hideTowerInfo();
            }
        }
    }
}

function handleMouseMove(event) {
    const rect = window.canvas.getBoundingClientRect();
    window.mouseX = event.clientX - rect.left;
    window.mouseY = event.clientY - rect.top;
    if (gamePhase === 'preparation') {
        update();
    }
}

function findTowerAt(x, y) {
    for (let i = 0; i < window.towers.length; i++) {
        const tower = window.towers[i];
        const dx = tower.x - x;
        const dy = tower.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < window.towerSize / 2) {
            return i;
        }
    }
    return -1;
}

function showTowerInfo(tower, x, y) {
    const panel = document.getElementById('tower-info-panel');
    const rect = window.canvas.getBoundingClientRect();
    const panelX = x + rect.left + 20;
    const panelY = y + rect.top - 20;

    document.getElementById('tower-info-title').textContent = `${tower.type} Info`;
    document.getElementById('tower-info').textContent = `Price: ${towerStats[tower.type].price}`;

    panel.style.left = `${panelX}px`;
    panel.style.top = `${panelY}px`;
    panel.style.display = 'block';

    // Draw the range circle around the selected tower
    drawTowers();
    drawTowerRange(tower);
}

function hideTowerInfo() {
    document.getElementById('tower-info-panel').style.display = 'none';
    selectedTowerIndex = null;
    drawTowers(); // Clear the range indicator
}

function destroyTower() {
    if (selectedTowerIndex !== null) {
        const tower = window.towers[selectedTowerIndex];
        const refund = towerStats[tower.type].price * 0.6;
        updateMoney(refund);
        window.towers.splice(selectedTowerIndex, 1);
        hideTowerInfo();
        drawTowers();
        console.log(`Tower at index ${selectedTowerIndex} destroyed. Refunded ${refund}`);
    }
}

function isPointInPath(x, y) {
    return path.some(block => {
        const blockX = block.x * blockSize;
        const blockY = block.y * blockSize;
        return x > blockX - minDistanceFromPath / 2 && x < blockX + blockSize + minDistanceFromPath / 2 && y > blockY - minDistanceFromPath / 2 && y < blockY + blockSize + minDistanceFromPath / 2;
    });
}

function isPointInObstacle(x, y) {
    return obstacles.some(obstacle => {
        const obstacleX = obstacle.x * blockSize;
        const obstacleY = obstacle.y * blockSize;
        return x > obstacleX && x < obstacleX + obstacle.width * blockSize && y > obstacleY && y < obstacleY + obstacle.height * blockSize;
    });
}

function isPointNearTower(x, y) {
    return window.towers.some(tower => {
        const dx = tower.x - x;
        const dy = tower.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minDistanceBetweenTowers;
    });
}

function drawPlacementIndicator() {
    if (window.selectedTower && gamePhase === 'preparation') {
        const validPlacement = !isPointInPath(window.mouseX, window.mouseY) && !isPointNearTower(window.mouseX, window.mouseY) && !isPointInObstacle(window.mouseX, window.mouseY);
        const range = towerStats[window.selectedTower].range;

        // Draw the range circle
        window.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        window.ctx.beginPath();
        window.ctx.arc(window.mouseX, window.mouseY, range, 0, Math.PI * 2);
        window.ctx.fill();

        // Draw the tower placement circle
        window.ctx.fillStyle = validPlacement ? 'green' : 'red';
        window.ctx.beginPath();
        window.ctx.arc(window.mouseX, window.mouseY, towerSize / 2, 0, Math.PI * 2);
        window.ctx.fill();

        // Draw red areas around other towers
        window.towers.forEach(tower => {
            window.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            window.ctx.beginPath();
            window.ctx.arc(tower.x, tower.y, minDistanceBetweenTowers, 0, Math.PI * 2);
            window.ctx.fill();
        });
    }
}

function drawTowerRange(tower) {
    window.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    window.ctx.beginPath();
    window.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    window.ctx.fill();
}

function showInsufficientFunds() {
    const insufficientFunds = document.getElementById('insufficient-funds');
    const moneyInfo = document.getElementById('money-info');

    // If there's an existing notification, increment the counter
    if (insufficientFundsActive) {
        let count = parseInt(insufficientFunds.getAttribute('data-count') || '0', 10) + 1;
        insufficientFunds.setAttribute('data-count', count);
        insufficientFunds.textContent = `Not enough money! (${count}x)`;
        return;
    }

    insufficientFundsActive = true;
    moneyTextActive = true;

    // Show notification and change money text color
    insufficientFunds.style.display = 'block';
    moneyInfo.classList.add('insufficient-funds');

    // Set timeout to hide notification and reset money text color
    insufficientFundsTimeout = setTimeout(() => {
        insufficientFunds.style.display = 'none';
        insufficientFundsActive = false;
        insufficientFunds.setAttribute('data-count', '0');
        insufficientFunds.textContent = 'Not enough money!';
    }, 2000);

    moneyTextTimeout = setTimeout(() => {
        moneyInfo.classList.remove('insufficient-funds');
        moneyTextActive = false;
    }, 2000);
}

document.getElementById('destroy-tower-button').addEventListener('click', destroyTower);
