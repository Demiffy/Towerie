document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-game-button');
    const phaseButton = document.getElementById('phase-button');
    const waveInfo = document.getElementById('wave-info');
    const phaseInfo = document.getElementById('phase-info');
    const healthInfo = document.getElementById('health-info');
    const bottomBar = document.getElementById('bottom-bar');
    const enemies = [];
    const enemySize = 20;
    let path = [];
    const blockSize = 60;
    let health = 100;
    let pathRandomizerInterval;
    let gamePhase = 'preparation';

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
        updateEnemies();
        drawEnemies();
        requestAnimationFrame(update);
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

    function updateHealthDisplay() {
        healthInfo.textContent = `Health: ${health}`;
        if (health <= 0) {
            alert('Game Over');
            location.reload(); // Reload the page to restart the game
        }
    }

    startButton.addEventListener('click', startGame);
    phaseButton.addEventListener('click', startRound);

    // Start randomizing the path every 2 seconds before the game starts
    pathRandomizerInterval = setInterval(randomizePath, 2000);
});
