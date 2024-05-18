let path = [];
let gamePhase = 'preparation';
let pathRandomizerInterval;
window.bullets = [];
window.money = 100;
window.wave = 1;
let waveEndCheckTimeout = null;
let isGameOver = false;  // Flag to track if the game is over

function initializeGame(ctx, canvas, startButton, phaseButton, bottomBar, towerButtons) {
    window.ctx = ctx;
    window.canvas = canvas;
    window.startButton = startButton;
    window.phaseButton = phaseButton;
    window.bottomBar = bottomBar;
    window.towerButtons = towerButtons;
    window.enemies = [];
    window.towers = [];
    window.selectedTower = null;
    window.mouseX = 0;
    window.mouseY = 0;
    window.blockSize = 60;
    window.towerSize = 30;
    window.minDistanceFromPath = 30;
    window.minDistanceBetweenTowers = 40;
    window.health = 100;
    window.enemySize = 20;
    window.phaseInfo = document.getElementById('phase-info');
    window.healthInfo = document.getElementById('health-info');
    window.moneyInfo = document.getElementById('money-info');
    window.towerStatsPanel = document.getElementById('tower-stats-panel');
    window.towerStatsTitle = document.getElementById('tower-stats-title');
    window.towerStatsText = document.getElementById('tower-stats');
    window.waveInfo = document.getElementById('wave-info');
    window.topBar = document.getElementById('top-bar');
    window.waveClearedMessage = document.getElementById('wave-cleared-message');
    window.waveReward = document.getElementById('wave-reward');
    window.waveNumber = document.getElementById('wave-number');
    window.gameOverScreen = document.getElementById('game-over-screen');

    pathRandomizerInterval = setInterval(randomizePath, 2000);
}

function startGame() {
    clearInterval(pathRandomizerInterval);
    startButton.style.display = 'none';
    path = window.generatePath();
    window.drawPath(path);
    window.phaseInfo.textContent = 'Preparation Phase';
    phaseButton.textContent = 'Start Round';
    phaseButton.style.display = 'inline-block';
    bottomBar.style.display = 'flex';
    topBar.style.display = 'block'; // Show the top bar
    update(); // Start the update loop
}

function randomizePath() {
    path = window.generatePath();
    window.drawPath(path);
}

function startRound() {
    if (isGameOver) return;  // Prevent starting a new round if the game is over
    gamePhase = 'round';
    window.phaseInfo.textContent = 'Round Phase';
    phaseButton.style.display = 'none';
    window.towerStatsPanel.style.display = 'none'; // Hide tower stats panel
    window.selectedTower = null; // Deselect any selected tower
    spawnWave();
}

function endRound() {
    if (isGameOver) return;  // Prevent ending the round if the game is over
    gamePhase = 'preparation';
    const reward = window.wave * 10; // Example reward calculation
    updateMoney(reward);
    window.wave++;
    window.waveInfo.textContent = `Wave: ${window.wave}`;
    window.waveNumber.textContent = window.wave;
    window.phaseInfo.textContent = 'Preparation Phase';
    window.phaseButton.textContent = 'Start Round';
    window.phaseButton.style.display = 'inline-block';
    showWaveClearedMessage(window.wave - 1, reward); // Pass previous wave number
}

function checkWaveEnd() {
    if (waveEndCheckTimeout) {
        clearTimeout(waveEndCheckTimeout);
    }

    waveEndCheckTimeout = setTimeout(() => {
        if (window.enemies.length === 0) {
            endRound();
        }
    }, 3000);
}

function update() {
    clearCanvas();
    window.drawPath(path);
    window.updateTowers();
    updateEnemies();
    updateBullets();
    drawTowers();
    drawEnemies();
    drawBullets();
    drawPlacementIndicator();
    if (gamePhase === 'round') {
        requestAnimationFrame(update);
    } else if (gamePhase === 'preparation' && selectedTowerIndex !== null) {
        drawTowerRange(window.towers[selectedTowerIndex]);
    }
}


function handleMouseDown(event) {
    if (event.button === 1) { // Middle mouse button
        window.selectedTower = null;
        window.towerStatsPanel.style.display = 'none'; // Hide tower stats panel
        console.log('Tower placement deselected');
    }
}

function updateMoney(amount) {
    window.money += amount;
    window.moneyInfo.textContent = `Money: ${window.money}`;
}

function showWaveClearedMessage(waveNumber, reward) {
    window.waveReward.textContent = `Reward: ${reward}`;
    window.waveClearedMessage.innerHTML = `Wave ${waveNumber} cleared! <br> ${window.waveReward.textContent}`;
    window.waveClearedMessage.style.display = 'block';
    setTimeout(() => {
        window.waveClearedMessage.style.display = 'none';
    }, 2000);
}

function showGameOverScreen() {
    isGameOver = true;  // Set the game over flag
    window.phaseButton.style.display = 'none';  // Hide the phase button
    const gameOverScreen = document.getElementById('game-over-screen');
    gameOverScreen.style.display = 'block';
    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener('click', () => {
        window.location.reload(); // Reload the game
    });
}
