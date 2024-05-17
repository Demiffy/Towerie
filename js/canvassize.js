let initialLoadDone = false;

function adjustLayout() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const topBarHeight = document.getElementById('top-bar').offsetHeight;
    const bottomBarHeight = document.getElementById('bottom-bar').offsetHeight;

    canvas.style.width = '100%';
    canvas.style.height = '720px'; // Set a fixed height for the canvas

    // Set the canvas actual size to match the pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = 720 * dpr; // Match the fixed height for the canvas
    ctx.scale(dpr, dpr);

    console.log('Canvas layout adjusted.');
}

function handleResize() {
    adjustLayout();
    if (typeof generatePath === 'function' && typeof drawPath === 'function') {
        drawPath(generatePath());
    }
}

window.addEventListener('resize', handleResize);

window.addEventListener('load', () => {
    if (!initialLoadDone) {
        adjustLayout();
        if (typeof generatePath === 'function' && typeof drawPath === 'function') {
            drawPath(generatePath());
        }
        initialLoadDone = true;
    }
});
