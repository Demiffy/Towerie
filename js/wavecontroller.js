document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-game-button');
    const phaseButton = document.getElementById('phase-button');
    const waveInfo = document.getElementById('wave-info');
    const phaseInfo = document.getElementById('phase-info');
    const healthInfo = document.getElementById('health-info');
    const bottomBar = document.getElementById('bottom-bar');
    const towerButtons = document.querySelectorAll('.tower-option');
    const enemies = [];
    const towers = [];
    const enemySize = 20;
    const towerSize = 30;
    const minDistanceFromPath = 30; // Minimum distance from path
    const minDistanceBetweenTowers = 40; // Minimum distance between towers
    let path = [];
    const blockSize = 60; // Ensure blockSize is defined
    let health = 100; // Initial health
    let pathRandomizerInterval;
    let gamePhase = 'preparation'; // Initial game phase
    let selectedTower = null;
    let mouseX = 0;
    let mouseY = 0;

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function startGame() {
        clearInterval(pathRandomizerInterval); // Stop path randomization
        startButton.style.display = 'none';
        path = window.generatePath(); // Use global function
        window.drawPath(path); // Use global function
        phaseInfo.textContent = 'Preparation Phase';
        phaseButton.textContent = 'Start Round';
        phaseButton.style.display = 'inline-block';
        bottomBar.style.display = 'flex'; // Show bottom bar
        update(); // Start the update loop
    }

    function randomizePath() {
        path = window.generatePath(); // Use global function
        window.drawPath(path); // Use global function
    }

    function startRound() {
        gamePhase = 'round';
        phaseInfo.textContent = 'Round Phase';
        phaseButton.style.display = 'none';
        spawnWave();
    }

    function spawnWave() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const enemy = { 
                    x: path[0].x * blockSize + blockSize / 2 - enemySize / 2, 
                    y: path[0].y * blockSize + blockSize / 2 - enemySize / 2, 
                    pathIndex: 0 
                };
                enemies.push(enemy);
            }, i * 1000); // Spawn enemies at intervals
        }

        requestAnimationFrame(update);
    }

    function update() {
        clearCanvas();
        window.drawPath(path); // Use global function
        updateTowers();
        updateEnemies();
        drawTowers();
        drawEnemies();
        drawPlacementIndicator(); // Draw placement indicator
        if (gamePhase === 'round') {
            requestAnimationFrame(update);
        }
    }

    function updateEnemies() {
        enemies.forEach(enemy => {
            const target = path[enemy.pathIndex];
            const targetX = target.x * blockSize + blockSize / 2 - enemySize / 2;
            const targetY = target.y * blockSize + blockSize / 2 - enemySize / 2;
            const dx = targetX - enemy.x;
            const dy = targetY - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 1) {
                enemy.pathIndex++;
                if (enemy.pathIndex >= path.length) {
                    enemy.reachedEnd = true;
                    health -= 20; // Decrease health by 20
                    updateHealthDisplay();
                }
            } else {
                const angle = Math.atan2(dy, dx);
                enemy.x += Math.cos(angle);
                enemy.y += Math.sin(angle);
            }
        });

        // Remove enemies that reached the end
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].reachedEnd) {
                enemies.splice(i, 1);
            }
        }
    }

    function drawEnemies() {
        enemies.forEach(enemy => {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x, enemy.y, enemySize, enemySize);
        });
    }

    function updateTowers() {
        // Placeholder for future tower functionality
    }

    function drawTowers() {
        towers.forEach(tower => {
            ctx.fillStyle = 'blue';
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, towerSize / 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateHealthDisplay() {
        healthInfo.textContent = `Health: ${health}`;
        if (health <= 0) {
            alert('Game Over');
            location.reload(); // Reload the page to restart the game
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
        return towers.some(tower => {
            const dx = tower.x - x;
            const dy = tower.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < minDistanceBetweenTowers;
        });
    }

    function drawPlacementIndicator() {
        if (selectedTower && gamePhase === 'preparation') {
            const validPlacement = !isPointInPath(mouseX, mouseY) && !isPointNearTower(mouseX, mouseY);
            ctx.fillStyle = validPlacement ? 'green' : 'red';
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, towerSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function handleCanvasClick(event) {
        if (gamePhase === 'preparation' && selectedTower) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (!isPointInPath(x, y) && !isPointNearTower(x, y)) {
                towers.push({ x, y });
                console.log(`Tower placed at (${x}, ${y})`);
                drawTowers(); // Draw towers immediately
            } else {
                console.log('Cannot place tower here');
            }
        }
    }

    function handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
        if (gamePhase === 'preparation') {
            update(); // Update the canvas to show the placement indicator
        }
    }

    function handleTowerSelection(event) {
        selectedTower = event.target.textContent;
        console.log(`Selected tower: ${selectedTower}`);
    }

    startButton.addEventListener('click', startGame);
    phaseButton.addEventListener('click', startRound);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    towerButtons.forEach(button => button.addEventListener('click', handleTowerSelection));

    // Start randomizing the path every 2 seconds before the game starts
    pathRandomizerInterval = setInterval(randomizePath, 2000);
});
