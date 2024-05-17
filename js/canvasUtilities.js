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

function updateTowers() {
    // Placeholder for future tower functionality
}
