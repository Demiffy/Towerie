const towerStats = {
    'Tower 1': { range: 100, damage: 20 },
    'Tower 2': { range: 150, damage: 25 },
    'Tower 3': { range: 200, damage: 30 },
    'Tower 4': { range: 120, damage: 22 },
    'Tower 5': { range: 180, damage: 28 },
    'Tower 6': { range: 160, damage: 26 },
    'Tower 7': { range: 140, damage: 24 },
    'Tower 8': { range: 170, damage: 27 },
    'Tower 9': { range: 130, damage: 23 },
    'Tower 10': { range: 50, damage: 15 }
};

function handleTowerSelection(event) {
    window.selectedTower = event.target.textContent;
    console.log(`Selected tower: ${window.selectedTower}`);
}

function handleCanvasClick(event) {
    if (gamePhase === 'preparation' && window.selectedTower) {
        const rect = window.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (!isPointInPath(x, y) && !isPointNearTower(x, y)) {
            const stats = towerStats[window.selectedTower];
            window.towers.push({ x, y, range: stats.range, damage: stats.damage, cooldown: 0 });
            console.log(`Tower placed at (${x}, ${y}) with range ${stats.range} and damage ${stats.damage}`);
            drawTowers();
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
        return x > blockX - minDistanceFromPath && x < blockX + blockSize + minDistanceFromPath && y > blockY - minDistanceFromPath && y < blockY + blockSize + minDistanceFromPath;
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
    }
}
