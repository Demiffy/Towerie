document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start-game-button');
    const phaseButton = document.getElementById('phase-button');
    const towerButtons = document.querySelectorAll('.tower-option');
    const bottomBar = document.getElementById('bottom-bar');

    initializeGame(ctx, canvas, startButton, phaseButton, bottomBar, towerButtons);

    startButton.addEventListener('click', startGame);
    phaseButton.addEventListener('click', startRound);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    towerButtons.forEach(button => button.addEventListener('click', handleTowerSelection));
});
