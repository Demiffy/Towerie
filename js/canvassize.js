function adjustLayout() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const topBarHeight = document.getElementById('top-bar').offsetHeight;
    const totalHeight = window.innerHeight;
    const remainingHeight = totalHeight - topBarHeight;

    canvas.style.width = '100%';
    canvas.style.height = `${remainingHeight - 100}px`;

    const bottomBarHeight = totalHeight - (topBarHeight + canvas.offsetHeight);
    document.getElementById('bottom-bar').style.height = `${bottomBarHeight}px`;

    // Set the canvas actual size to match the pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);

    console.log('Canvas layout adjusted.');
}

window.addEventListener('resize', () => {
    adjustLayout();
    if (typeof generatePath === 'function' && typeof drawPath === 'function') {
        drawPath(generatePath());
    }
});

window.addEventListener('load', () => {
    adjustLayout();
    if (typeof generatePath === 'function' && typeof drawPath === 'function') {
        drawPath(generatePath());
    }
});
