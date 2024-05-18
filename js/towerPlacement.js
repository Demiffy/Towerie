const towerStats = {
    'Tower 1': { range: 100, damage: 20, price: 50, fireRate: 30, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 2': { range: 150, damage: 25, price: 75, fireRate: 25, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 3': { range: 200, damage: 30, price: 100, fireRate: 20, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 4': { range: 120, damage: 22, price: 60, fireRate: 28, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 5': { range: 180, damage: 28, price: 85, fireRate: 22, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 6': { range: 160, damage: 26, price: 70, fireRate: 24, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 7': { range: 140, damage: 24, price: 55, fireRate: 26, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 8': { range: 170, damage: 27, price: 80, fireRate: 23, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 9': { range: 130, damage: 23, price: 65, fireRate: 27, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 },
    'Tower 10': { range: 50, damage: 15, price: 40, fireRate: 30, bulletSpeed: 5, splashDamage: 0, fireDamage: 0, slow: 0 }
};

let insufficientFundsTimeout;
let moneyTextTimeout;
let insufficientFundsActive = false;
let moneyTextActive = false;

function handleTowerSelection(event) {
    if (gamePhase === 'preparation') {
        window.selectedTower = event.target.textContent;
        const stats = towerStats[window.selectedTower];
        window.towerStatsTitle.textContent = `${window.selectedTower} Stats`;
        window.towerStatsText.textContent = `Range: ${stats.range}, Damage: ${stats.damage}, Fire Rate: ${stats.fireRate}, Bullet Speed: ${stats.bulletSpeed}, Splash Damage: ${stats.splashDamage}, Fire Damage: ${stats.fireDamage}, Slow: ${stats.slow}, Price: ${stats.price}`;
        window.towerStatsPanel.style.display = 'block';
        console.log(`Selected tower: ${window.selectedTower}`);
    }
}

function handleCanvasClick(event) {
    if (gamePhase === 'preparation' && window.selectedTower) {
        const rect = window.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (!isPointInPath(x, y) && !isPointNearTower(x, y)) {
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
                    slow: stats.slow
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

function isPointInPath(x, y) {
    return path.some(block => {
        const blockX = block.x * blockSize;
        const blockY = block.y * blockSize;
        return x > blockX - minDistanceFromPath / 2 && x < blockX + blockSize + minDistanceFromPath / 2 && y > blockY - minDistanceFromPath / 2 && y < blockY + blockSize + minDistanceFromPath / 2;
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
        const validPlacement = !isPointInPath(window.mouseX, window.mouseY) && !isPointNearTower(window.mouseX, window.mouseY);
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
