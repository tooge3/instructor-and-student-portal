const snakeGame = (() => {
  const canvas = document.getElementById("snake-board");

  if (!canvas) {
    return null;
  }

  const ctx = canvas.getContext("2d");
  const scoreElement = document.getElementById("snake-score");
  const bestScoreElement = document.getElementById("snake-best-score");
  const messageElement = document.getElementById("snake-message");
  const startButton = document.getElementById("snake-start");
  const restartButton = document.getElementById("snake-restart");
  const costumeButtons = Array.from(document.querySelectorAll("[data-snake-costume]"));
  const directionButtons = Array.from(document.querySelectorAll("[data-snake-direction]"));

  const tileCount = 21;
  const tileSize = canvas.width / tileCount;
  const tickMs = 115;
  const storageKey = "northHallSnakeBestScore";
  const costumes = {
    classic: { head: "#123d2b", body: "#2f7a52", belly: "#9ee8b8", scale: "#1f5f40" },
    sunset: { head: "#8d2f20", body: "#f26a3d", belly: "#ffd166", scale: "#bd3e2a" },
    mint: { head: "#0c5f68", body: "#33c7a7", belly: "#dcfff5", scale: "#15917f" },
    royal: { head: "#26235e", body: "#6d63ff", belly: "#c9c4ff", scale: "#463de0" },
  };

  let snake;
  let food;
  let direction;
  let pendingDirection;
  let score;
  let bestScore = Number(localStorage.getItem(storageKey)) || 0;
  let timerId = null;
  let activeCostume = "classic";
  let gameOver = false;

  function setMessage(text) {
    messageElement.textContent = text;
  }

  function updateScores() {
    scoreElement.textContent = score;
    bestScoreElement.textContent = bestScore;
  }

  function sameCell(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function randomFood() {
    let nextFood;

    do {
      nextFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
      };
    } while (snake.some((part) => sameCell(part, nextFood)));

    return nextFood;
  }

  function resetGame() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    direction = { x: 1, y: 0 };
    pendingDirection = direction;
    score = 0;
    food = randomFood();
    gameOver = false;
    updateScores();
    draw();
  }

  function stopLoop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startLoop() {
    if (gameOver) {
      resetGame();
    }

    stopLoop();
    setMessage("Use arrow keys or the pad");
    timerId = setInterval(step, tickMs);
  }

  function restartLoop() {
    stopLoop();
    resetGame();
    startLoop();
  }

  function canTurn(nextDirection) {
    return direction.x + nextDirection.x !== 0 || direction.y + nextDirection.y !== 0;
  }

  function setDirection(nextDirection) {
    if (canTurn(nextDirection)) {
      pendingDirection = nextDirection;
    }
  }

  function isSnakeViewActive() {
    return document.querySelector("[data-view-panel='snake']")?.classList.contains("active");
  }

  function endGame() {
    gameOver = true;
    stopLoop();
    setMessage("Game over - press Restart");
  }

  function step() {
    direction = pendingDirection;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
    const hitSelf = snake.slice(0, -1).some((part) => sameCell(part, head));

    if (hitWall || hitSelf) {
      endGame();
      draw();
      return;
    }

    snake.unshift(head);

    if (sameCell(head, food)) {
      score += 1;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(storageKey, bestScore);
      }
      food = randomFood();
      updateScores();
    } else {
      snake.pop();
    }

    draw();
  }

  function cellCenter(cell) {
    return {
      x: cell.x * tileSize + tileSize / 2,
      y: cell.y * tileSize + tileSize / 2,
    };
  }

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawBodyPart(part, index, costume) {
    const center = cellCenter(part);
    const isTail = index === snake.length - 1;
    const radius = Math.max(tileSize * (isTail ? 0.28 : 0.38), 5);

    const gradient = ctx.createRadialGradient(
      center.x - radius * 0.35,
      center.y - radius * 0.45,
      radius * 0.1,
      center.x,
      center.y,
      radius,
    );
    gradient.addColorStop(0, costume.belly);
    gradient.addColorStop(0.42, costume.body);
    gradient.addColorStop(1, costume.scale);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radius, radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!isTail && index % 2 === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
      ctx.beginPath();
      ctx.ellipse(center.x - radius * 0.18, center.y - radius * 0.2, radius * 0.2, radius * 0.12, -0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHead(costume) {
    const head = snake[0];
    const center = cellCenter(head);
    const angle = Math.atan2(direction.y, direction.x);
    const headRadius = tileSize * 0.48;

    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(angle);

    const gradient = ctx.createRadialGradient(
      -headRadius * 0.2,
      -headRadius * 0.35,
      headRadius * 0.1,
      0,
      0,
      headRadius * 1.2,
    );
    gradient.addColorStop(0, costume.belly);
    gradient.addColorStop(0.48, costume.head);
    gradient.addColorStop(1, costume.scale);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, headRadius * 1.15, headRadius * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    roundedRect(-headRadius * 0.45, -headRadius * 0.25, headRadius * 0.72, headRadius * 0.24, headRadius * 0.12);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(headRadius * 0.28, -headRadius * 0.38, headRadius * 0.15, 0, Math.PI * 2);
    ctx.arc(headRadius * 0.28, headRadius * 0.38, headRadius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(headRadius * 0.32, -headRadius * 0.38, headRadius * 0.07, 0, Math.PI * 2);
    ctx.arc(headRadius * 0.32, headRadius * 0.38, headRadius * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(headRadius * 0.95, 0);
    ctx.lineTo(headRadius * 1.34, 0);
    ctx.moveTo(headRadius * 1.34, 0);
    ctx.lineTo(headRadius * 1.55, -headRadius * 0.16);
    ctx.moveTo(headRadius * 1.34, 0);
    ctx.lineTo(headRadius * 1.55, headRadius * 0.16);
    ctx.stroke();

    ctx.restore();
  }

  function drawFood() {
    const center = cellCenter(food);

    ctx.fillStyle = "#fffbeb";
    ctx.beginPath();
    ctx.arc(center.x, center.y, tileSize * 0.38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(center.x, center.y, tileSize * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.58)";
    ctx.beginPath();
    ctx.arc(center.x - tileSize * 0.09, center.y - tileSize * 0.1, tileSize * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    const costume = costumes[activeCostume];

    ctx.fillStyle = "#78bdf2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1;
    for (let index = 0; index <= tileCount; index += 1) {
      const position = Math.round(index * tileSize);
      ctx.beginPath();
      ctx.moveTo(position, 0);
      ctx.lineTo(position, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, position);
      ctx.lineTo(canvas.width, position);
      ctx.stroke();
    }

    drawFood();

    for (let index = snake.length - 1; index > 0; index -= 1) {
      drawBodyPart(snake[index], index, costume);
    }

    ctx.strokeStyle = costume.scale;
    ctx.lineWidth = tileSize * 0.7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    snake.forEach((part, index) => {
      const center = cellCenter(part);
      if (index === 0) {
        ctx.moveTo(center.x, center.y);
      } else {
        ctx.lineTo(center.x, center.y);
      }
    });
    ctx.stroke();

    for (let index = snake.length - 1; index > 0; index -= 1) {
      drawBodyPart(snake[index], index, costume);
    }

    drawHead(costume);
  }

  function setCostume(costumeName) {
    activeCostume = costumeName;
    costumeButtons.forEach((button) => {
      const active = button.dataset.snakeCostume === costumeName;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    draw();
  }

  const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  window.addEventListener("keydown", (event) => {
    if (!directions[event.key] || !isSnakeViewActive()) {
      return;
    }

    event.preventDefault();
    setDirection(directions[event.key]);
    if (!timerId && !gameOver) {
      startLoop();
    }
  });

  directionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDirection(directions[button.dataset.snakeDirection]);
      if (!timerId && !gameOver) {
        startLoop();
      }
    });
  });

  costumeButtons.forEach((button) => {
    button.addEventListener("click", () => setCostume(button.dataset.snakeCostume));
  });

  document.querySelectorAll(".nav-link[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.view !== "snake") {
        stopLoop();
      }
    });
  });

  startButton.addEventListener("click", startLoop);
  restartButton.addEventListener("click", restartLoop);

  resetGame();
  setMessage("Press Start to play");

  return {
    restart: restartLoop,
  };
})();
