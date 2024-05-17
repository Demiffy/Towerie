const towerRanges = {
    'Tower 1': 100,
    'Tower 2': 150,
    'Tower 3': 200,
    'Tower 4': 120,
    'Tower 5': 180,
    'Tower 6': 160,
    'Tower 7': 140,
    'Tower 8': 170,
    'Tower 9': 130,
    'Tower 10': 50,
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
            window.towers.push({ x, y, range: towerRanges[window.selectedTower] });
            console.log(`Tower placed at (${x}, ${y}) with range ${towerRanges[window.selectedTower]}`);
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
        const range = towerRanges[window.selectedTower];
        
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
