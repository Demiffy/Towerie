document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const blockSize = 60;

    const pathImage = new Image();
    const startImage = new Image();
    const endImage = new Image();
    const backgroundImage = new Image();
    const obstacleImage = new Image();

    pathImage.src = 'images/path.png';
    startImage.src = 'images/start.png';
    endImage.src = 'images/end.png';
    backgroundImage.src = 'images/block.png';
    obstacleImage.src = 'images/obstacle.png';

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawBackground() {
        const pattern = ctx.createPattern(backgroundImage, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawBlock(x, y, image) {
        ctx.drawImage(image, x * blockSize, y * blockSize, blockSize, blockSize);
    }

    function drawBorders(elements) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        elements.forEach(element => {
            let neighbors = {
                top: elements.find(e => e.x === element.x && e.y === element.y - 1),
                right: elements.find(e => e.x === element.x + 1 && e.y === element.y),
                bottom: elements.find(e => e.x === element.x && e.y === element.y + 1),
                left: elements.find(e => e.x === element.x - 1 && e.y === element.y)
            };

            // Draw borders only where there are no neighbors
            if (!neighbors.top) {
                ctx.beginPath();
                ctx.moveTo(element.x * blockSize, element.y * blockSize);
                ctx.lineTo((element.x + 1) * blockSize, element.y * blockSize);
                ctx.stroke();
            }
            if (!neighbors.right) {
                ctx.beginPath();
                ctx.moveTo((element.x + 1) * blockSize, element.y * blockSize);
                ctx.lineTo((element.x + 1) * blockSize, (element.y + 1) * blockSize);
                ctx.stroke();
            }
            if (!neighbors.bottom) {
                ctx.beginPath();
                ctx.moveTo(element.x * blockSize, (element.y + 1) * blockSize);
                ctx.lineTo((element.x + 1) * blockSize, (element.y + 1) * blockSize);
                ctx.stroke();
            }
            if (!neighbors.left) {
                ctx.beginPath();
                ctx.moveTo(element.x * blockSize, element.y * blockSize);
                ctx.lineTo(element.x * blockSize, (element.y + 1) * blockSize);
                ctx.stroke();
            }
        });
    }

    function generatePath() {
        const rows = Math.floor(canvas.height / blockSize);
        const cols = Math.floor(canvas.width / blockSize);

        let path = [];
        let x = 0;
        let y = Math.floor(Math.random() * (rows - 2)) + 1;  // Ensure starting point is not at the top or bottom edge
        path.push({ x, y });

        let turns = 0;
        let direction = 'right';
        let moveLength;

        // Function to check if the next move would create a loop
        function isValidMove(nextX, nextY) {
            if (nextX < 0 || nextX >= cols || nextY <= 0 || nextY >= rows - 1) {  // Ensure next move is within bounds
                return false;
            }
            // Check if the next move creates a 2x2 loop
            for (let i = 1; i <= 2; i++) {
                if (path.length > i) {
                    let prev = path[path.length - i];
                    if (prev.x === nextX && prev.y === nextY) {
                        return false;
                    }
                }
            }
            return true;
        }

        while (x < cols - 1 && turns < 8) {
            moveLength = Math.floor(Math.random() * 3) + 2; // Move 2-4 blocks

            for (let i = 0; i < moveLength && x < cols - 1; i++) {
                let nextX = x;
                let nextY = y;

                if (direction === 'right') {
                    nextX++;
                } else if (direction === 'up') {
                    nextY--;
                } else if (direction === 'down') {
                    nextY++;
                }

                if (isValidMove(nextX, nextY)) {
                    x = nextX;
                    y = nextY;
                    path.push({ x, y });
                } else {
                    break;
                }
            }

            // Change direction
            if (direction === 'right') {
                direction = Math.random() > 0.5 ? 'up' : 'down';
            } else {
                direction = 'right';
            }

            turns++;
        }

        // Ensure path goes to the end with some turns
        while (x < cols - 1) {
            moveLength = Math.floor(Math.random() * 3) + 2; // Move 2-4 blocks
            for (let i = 0; i < moveLength && x < cols - 1; i++) {
                let nextX = x + 1;
                let nextY = y;

                if (isValidMove(nextX, nextY)) {
                    x = nextX;
                    path.push({ x, y });

                    // Introduce a chance to turn towards the end
                    if (Math.random() < 0.2 && x < cols - 2) { // 20% chance to turn
                        direction = Math.random() > 0.5 ? 'up' : 'down';
                        if (direction === 'up' && y > 1) {  // Ensure it doesn't go to the top edge
                            y--;
                        } else if (direction === 'down' && y < rows - 2) {  // Ensure it doesn't go to the bottom edge
                            y++;
                        }
                        if (isValidMove(x, y)) {
                            path.push({ x, y });
                        }
                    }
                }
            }
        }

        return path;
    }

    function generateObstacles(path) {
        const rows = Math.floor(canvas.height / blockSize);
        const cols = Math.floor(canvas.width / blockSize);
        const numObstacles = Math.floor(Math.random() * 5) + 3; // Random number of obstacles between 3 and 7
        const obstacles = [];

        for (let i = 0; i < numObstacles; i++) {
            let width = Math.floor(Math.random() * 2) + 1; // 1 or 2
            let height = Math.floor(Math.random() * 2) + 1; // 1 or 2
            let x, y;
            let isValid = false;

            while (!isValid) {
                x = Math.floor(Math.random() * (cols - width));
                y = Math.floor(Math.random() * (rows - height));

                // Check if the obstacle overlaps with the path
                isValid = !path.some(block => {
                    return (
                        block.x >= x && block.x < x + width &&
                        block.y >= y && block.y < y + height
                    );
                });
            }

            obstacles.push({ x, y, width, height });
        }

        return obstacles;
    }

    function drawPathAndObstacles(path, obstacles) {
        clearCanvas();
        drawBackground();
        path.forEach((block, index) => {
            let image = pathImage; // Default to path texture
            if (index === 0) image = startImage; // Start texture
            if (index === path.length - 1) image = endImage; // End texture
            drawBlock(block.x, block.y, image);
        });
        obstacles.forEach(obstacle => {
            for (let i = 0; i < obstacle.width; i++) {
                for (let j = 0; j < obstacle.height; j++) {
                    drawBlock(obstacle.x + i, obstacle.y + j, obstacleImage);
                }
            }
        });
        drawBorders(path.concat(obstacles.map(obs => {
            let blocks = [];
            for (let i = 0; i < obs.width; i++) {
                for (let j = 0; j < obs.height; j++) {
                    blocks.push({ x: obs.x + i, y: obs.y + j });
                }
            }
            return blocks;
        }).flat()));
    }

    function randomizePathAndObstacles() {
        const path = generatePath();
        const obstacles = generateObstacles(path);
        drawPathAndObstacles(path, obstacles);
        window.path = path;
        window.obstacles = obstacles;
    }

    // Make functions globally accessible
    window.generatePath = generatePath;
    window.generateObstacles = generateObstacles;
    window.drawPathAndObstacles = drawPathAndObstacles;

    window.addEventListener('resize', () => {
        adjustLayout();
        randomizePathAndObstacles();
    });

    window.addEventListener('load', () => {
        adjustLayout();
        randomizePathAndObstacles();
    });
});
