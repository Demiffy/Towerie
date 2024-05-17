let path = [];
let gamePhase = 'preparation';
let pathRandomizerInterval;

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
    window.topBar = document.getElementById('top-bar');

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
    gamePhase = 'round';
    window.phaseInfo.textContent = 'Round Phase';
    phaseButton.style.display = 'none';
    spawnWave();
}

function update() {
    clearCanvas();
    window.drawPath(path);
    window.updateTowers();
    updateEnemies();
    drawTowers();
    drawEnemies();
    drawPlacementIndicator();
    if (gamePhase === 'round') {
        requestAnimationFrame(update);
    }
}
