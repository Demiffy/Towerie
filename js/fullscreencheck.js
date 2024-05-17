document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const warningMessage = document.getElementById('warning-message');
    
    const MIN_WIDTH = 1200;
    const MIN_HEIGHT = 800;

    function checkScreenSize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (windowWidth < MIN_WIDTH || windowHeight < MIN_HEIGHT) {
            warningMessage.style.display = 'block';
            gameContainer.style.display = 'none';
            console.warn('Screen size is too small.');
        } else {
            warningMessage.style.display = 'none';
            gameContainer.style.display = 'block';
            console.log('Screen size is adequate.');
            // Adjust canvas size and regenerate path
            adjustLayout();
            if (typeof window.generatePath === 'function' && typeof window.drawPath === 'function') {
                window.drawPath(window.generatePath());
            }
        }
    }

    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('load', checkScreenSize);
    checkScreenSize();
});
