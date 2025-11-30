// ============================================
// FLAPPY ARJU - Complete Game in Single File
// ============================================

// Firebase Analytics Integration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCRlXuM5UOrAQjKINaXAmnbN9ikLr-lnIM",
    authDomain: "flappybird-d4de7.firebaseapp.com",
    projectId: "flappybird-d4de7",
    storageBucket: "flappybird-d4de7.firebasestorage.app",
    messagingSenderId: "605501626836",
    appId: "1:605501626836:web:62fcfdf85970807fd3de41",
    measurementId: "G-CDJ361JKZV"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

// Analytics helper function
function trackEvent(eventName, params = {}) {
    try {
        logEvent(analytics, eventName, params);
        console.log(`Analytics: ${eventName}`, params);
    } catch (e) {
        console.warn('Analytics error:', e);
    }
}

// Track page view on load
trackEvent('page_view', {
    page_title: 'Flappy Arju Game',
    page_location: window.location.href
});

(function() {
    'use strict';

    // Game Configuration
    const CONFIG = {
        gravity: 0.48,
        jumpForce: -8,
        pipeSpeed: 2.9,
        pipeGap: 190,
        pipeWidth: 80,
        pipeSpawnIntervalStart: 1900,
        pipeSpawnIntervalEnd: 1800,
        maxScoreForDifficulty: 20,
        arjuWidth: 50,
        arjuHeight: 50,
        animationSpeed: 100,
        gameHeight: 700,
        groundHeight: 100
    };

    // Game State
    let gameState = {
        isPlaying: false,
        isGameOver: false,
        score: 0,
        highScore: localStorage.getItem('flappyArjuHighScore') || 0,
        arjuY: 300,
        arjuVelocity: 0,
        pipes: [],
        animationFrame: 0,
        lastAnimationTime: 0,
        lastFrameTime: 0
    };

    // Sprite Images
    const SPRITES = [
        './assets/arju/Arju_1.PNG',
        './assets/arju/Arju_2.png',
        './assets/arju/Arju_3.png'
    ];

    // Create and inject styles
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                min-height: -webkit-fill-available;
                background:
                    radial-gradient(circle at 10% 20%, rgba(255, 182, 193, 0.15) 0%, transparent 20%),
                    radial-gradient(circle at 90% 80%, rgba(255, 105, 180, 0.12) 0%, transparent 25%),
                    radial-gradient(circle at 50% 50%, rgba(218, 112, 214, 0.1) 0%, transparent 30%),
                    radial-gradient(circle at 20% 70%, rgba(255, 192, 203, 0.15) 0%, transparent 20%),
                    radial-gradient(circle at 80% 30%, rgba(199, 21, 133, 0.1) 0%, transparent 25%),
                    radial-gradient(circle at 30% 90%, rgba(255, 20, 147, 0.08) 0%, transparent 15%),
                    radial-gradient(circle at 70% 10%, rgba(255, 182, 193, 0.12) 0%, transparent 20%),
                    linear-gradient(135deg, #0d0d1a 0%, #1a0a1a 25%, #0f0f23 50%, #1a0d1a 75%, #0a0a15 100%);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                overflow: hidden;
                padding: 10px;
            }

            /* Flower decorations */
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image:
                    radial-gradient(ellipse 8px 12px at 5% 15%, rgba(255, 182, 193, 0.4) 0%, transparent 70%),
                    radial-gradient(ellipse 6px 10px at 7% 14%, rgba(255, 105, 180, 0.3) 0%, transparent 70%),
                    radial-gradient(ellipse 10px 14px at 95% 85%, rgba(218, 112, 214, 0.4) 0%, transparent 70%),
                    radial-gradient(ellipse 8px 12px at 93% 83%, rgba(255, 20, 147, 0.3) 0%, transparent 70%),
                    radial-gradient(ellipse 12px 16px at 15% 75%, rgba(255, 192, 203, 0.35) 0%, transparent 70%),
                    radial-gradient(ellipse 6px 10px at 85% 25%, rgba(199, 21, 133, 0.35) 0%, transparent 70%),
                    radial-gradient(ellipse 10px 14px at 25% 45%, rgba(255, 182, 193, 0.25) 0%, transparent 70%),
                    radial-gradient(ellipse 8px 12px at 75% 55%, rgba(255, 105, 180, 0.25) 0%, transparent 70%),
                    radial-gradient(ellipse 6px 8px at 45% 10%, rgba(255, 192, 203, 0.3) 0%, transparent 70%),
                    radial-gradient(ellipse 8px 10px at 55% 92%, rgba(218, 112, 214, 0.3) 0%, transparent 70%);
                pointer-events: none;
                z-index: 0;
            }

            #game-container {
                position: relative;
                width: 400px;
                height: ${CONFIG.gameHeight}px;
                max-height: 90vh;
                background: linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%);
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 105, 180, 0.2);
                border: 4px solid #2d3436;
                z-index: 1;
            }

            #ground {
                position: absolute;
                bottom: 0;
                width: 100%;
                height: 100px;
                background: linear-gradient(180deg, #8B4513 0%, #654321 50%, #3d2914 100%);
                border-top: 8px solid #228B22;
            }

            #ground::before {
                content: '';
                position: absolute;
                top: -8px;
                width: 100%;
                height: 15px;
                background: repeating-linear-gradient(
                    90deg,
                    #32CD32 0px,
                    #228B22 20px,
                    #32CD32 40px
                );
            }

            #arju {
                position: absolute;
                width: ${CONFIG.arjuWidth}px;
                height: ${CONFIG.arjuHeight}px;
                left: 80px;
                z-index: 10;
                border-radius: 50%;
                image-rendering: crisp-edges;
                will-change: transform, top;
            }

            #arju img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                border-radius: 50%;
            }

            .pipe {
                position: absolute;
                width: ${CONFIG.pipeWidth}px;
                background: linear-gradient(90deg, #2ECC71 0%, #27AE60 50%, #1E8449 100%);
                border: 4px solid #1a5f32;
                border-radius: 8px;
                will-change: left;
                transform: translateZ(0);
            }

            .pipe::before {
                content: '';
                position: absolute;
                left: -8px;
                width: ${CONFIG.pipeWidth + 16}px;
                height: 30px;
                background: linear-gradient(90deg, #2ECC71 0%, #27AE60 50%, #1E8449 100%);
                border: 4px solid #1a5f32;
                border-radius: 6px;
            }

            .pipe-top::before {
                bottom: -4px;
            }

            .pipe-bottom::before {
                top: -4px;
            }

            #score-display {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 48px;
                font-weight: bold;
                color: white;
                text-shadow: 3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
                z-index: 100;
            }

            #start-screen, #game-over-screen {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: rgba(0, 0, 0, 0.7);
                z-index: 200;
                backdrop-filter: blur(5px);
            }

            #start-screen h1, #game-over-screen h1 {
                font-size: 36px;
                color: #FFD700;
                text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
                margin-bottom: 20px;
            }

            #start-screen p, #game-over-screen p {
                font-size: 18px;
                color: white;
                margin-bottom: 10px;
            }

            .game-btn {
                padding: 15px 40px;
                font-size: 20px;
                font-weight: bold;
                color: white;
                background: linear-gradient(180deg, #E74C3C 0%, #C0392B 100%);
                border: none;
                border-radius: 30px;
                cursor: pointer;
                margin-top: 20px;
                box-shadow: 0 6px 0 #922B21, 0 10px 20px rgba(0, 0, 0, 0.3);
                transition: all 0.1s ease;
            }

            .game-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 0 #922B21, 0 12px 25px rgba(0, 0, 0, 0.3);
            }

            .game-btn:active {
                transform: translateY(4px);
                box-shadow: 0 2px 0 #922B21, 0 4px 10px rgba(0, 0, 0, 0.3);
            }

            #final-score {
                font-size: 64px;
                color: #FFD700;
                font-weight: bold;
                text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
            }

            #high-score {
                font-size: 20px;
                color: #FFA500;
                margin-top: 10px;
            }

            .cloud {
                position: absolute;
                background: white;
                border-radius: 50px;
                opacity: 0.8;
            }

            .cloud::before, .cloud::after {
                content: '';
                position: absolute;
                background: white;
                border-radius: 50%;
            }

            #instructions {
                font-size: 14px;
                color: #ccc;
                margin-top: 15px;
            }

            .arju-preview {
                width: 150px;
                height: 150px;
                margin: 25px;
                border-radius: 50%;
                border: 5px solid #FFD700;
                box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3);
                object-fit: contain;
                background: rgba(255, 255, 255, 0.1);
                padding: 10px;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            .floating {
                animation: float 1s ease-in-out infinite;
            }

            /* Responsive - All Mobile devices (phones & tablets) */
            @media screen and (max-width: 1024px),
                   screen and (hover: none) and (pointer: coarse),
                   screen and (max-device-width: 1024px) {
                html, body {
                    height: 100%;
                    height: 100dvh;
                    width: 100%;
                    width: 100dvw;
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                    background: none !important;
                    background-color: #87CEEB !important;
                }

                body::before {
                    display: none !important;
                }

                #game-container {
                    width: 100vw !important;
                    width: 100dvw !important;
                    height: 100vh !important;
                    height: 100dvh !important;
                    max-width: none !important;
                    max-height: none !important;
                    border-radius: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    margin: 0 !important;
                }

                #ground {
                    height: 12%;
                    min-height: 60px;
                    max-height: 100px;
                }

                #score-display {
                    font-size: 36px;
                    top: 15px;
                }

                #start-screen h1, #game-over-screen h1 {
                    font-size: 28px;
                }

                .arju-preview {
                    width: 120px;
                    height: 120px;
                    margin: 15px;
                }

                .game-btn {
                    padding: 12px 30px;
                    font-size: 18px;
                }

                #final-score {
                    font-size: 48px;
                }

                #instructions {
                    font-size: 12px;
                }

                .cloud {
                    display: none;
                }
            }

            /* Extra small phones */
            @media screen and (max-width: 380px) {
                #start-screen h1, #game-over-screen h1 {
                    font-size: 24px;
                }

                .arju-preview {
                    width: 100px;
                    height: 100px;
                    margin: 10px;
                }

                .game-btn {
                    padding: 10px 25px;
                    font-size: 16px;
                }

                #final-score {
                    font-size: 40px;
                }
            }

            /* Desktop only - shows background */
            @media screen and (min-width: 1025px) and (hover: hover) and (pointer: fine) {
                #game-container {
                    width: 420px;
                    max-height: 750px;
                }

                .arju-preview {
                    width: 160px;
                    height: 160px;
                }
            }

            /* Landscape orientation - full screen */
            @media screen and (orientation: landscape) and (max-height: 600px) {
                html, body {
                    background: none !important;
                    background-color: #87CEEB !important;
                }

                body::before {
                    display: none !important;
                }

                #game-container {
                    width: 100vw !important;
                    width: 100dvw !important;
                    height: 100vh !important;
                    height: 100dvh !important;
                    max-width: none !important;
                    max-height: none !important;
                    border-radius: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                }

                #score-display {
                    font-size: 28px;
                    top: 10px;
                }

                #start-screen h1, #game-over-screen h1 {
                    font-size: 22px;
                    margin-bottom: 10px;
                }

                .arju-preview {
                    width: 70px;
                    height: 70px;
                    margin: 10px;
                }

                .game-btn {
                    padding: 10px 25px;
                    font-size: 16px;
                    margin-top: 10px;
                }

                #final-score {
                    font-size: 36px;
                }

                #instructions {
                    font-size: 11px;
                    margin-top: 8px;
                }

                #start-screen p, #game-over-screen p {
                    font-size: 14px;
                    margin-bottom: 5px;
                }

                .cloud {
                    display: none;
                }
            }

            /* Touch device optimizations */
            @media (hover: none) and (pointer: coarse) {
                .game-btn {
                    min-height: 48px;
                    min-width: 120px;
                }

                .game-btn:hover {
                    transform: none;
                }

                .game-btn:active {
                    transform: scale(0.95);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Create game HTML structure
    function createGameHTML() {
        const container = document.createElement('div');
        container.id = 'game-container';
        container.innerHTML = `
            <!-- Clouds -->
            <div class="cloud" style="width: 60px; height: 30px; top: 50px; left: 30px;"></div>
            <div class="cloud" style="width: 80px; height: 35px; top: 150px; left: 280px;"></div>
            <div class="cloud" style="width: 50px; height: 25px; top: 100px; left: 180px;"></div>
            <div class="cloud" style="width: 70px; height: 30px; top: 220px; left: 100px;"></div>

            <!-- Score Display -->
            <div id="score-display">0</div>

            <!-- Arju Character -->
            <div id="arju">
                <img src="${SPRITES[0]}" alt="Arju" id="arju-sprite">
            </div>

            <!-- Ground -->
            <div id="ground"></div>

            <!-- Start Screen -->
            <div id="start-screen">
                <h1>🎮 FLAPPY ARJU 🎮</h1>
                <img src="${SPRITES[0]}" alt="Arju" class="arju-preview floating">
                <p>Help Arju fly through the pipes!</p>
                <button class="game-btn" id="start-btn">START GAME</button>
                <p id="instructions">Press SPACE or CLICK to flap</p>
            </div>

            <!-- Game Over Screen -->
            <div id="game-over-screen" style="display: none;">
                <h1>💥 GAME OVER 💥</h1>
                <p>Your Score</p>
                <div id="final-score">0</div>
                <div id="high-score">High Score: 0</div>
                <button class="game-btn" id="restart-btn">PLAY AGAIN</button>
            </div>
        `;
        document.body.appendChild(container);
    }

    // DOM Elements
    let elements = {};

    function cacheElements() {
        elements = {
            container: document.getElementById('game-container'),
            arju: document.getElementById('arju'),
            arjuSprite: document.getElementById('arju-sprite'),
            scoreDisplay: document.getElementById('score-display'),
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            startBtn: document.getElementById('start-btn'),
            restartBtn: document.getElementById('restart-btn'),
            finalScore: document.getElementById('final-score'),
            highScore: document.getElementById('high-score'),
            ground: document.getElementById('ground')
        };
    }

    // Preload images
    function preloadImages() {
        SPRITES.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Update Arju animation
    function updateArjuAnimation(timestamp) {
        if (timestamp - gameState.lastAnimationTime > CONFIG.animationSpeed) {
            gameState.animationFrame = (gameState.animationFrame + 1) % SPRITES.length;
            elements.arjuSprite.src = SPRITES[gameState.animationFrame];
            gameState.lastAnimationTime = timestamp;
        }
    }

    // Update Arju rotation based on velocity
    function updateArjuRotation() {
        const rotation = Math.min(Math.max(gameState.arjuVelocity * 3, -30), 90);
        elements.arju.style.transform = `rotate(${rotation}deg)`;
    }

    // Get actual game dimensions (for responsive support)
    function getGameDimensions() {
        const containerHeight = elements.container.offsetHeight;
        const containerWidth = elements.container.offsetWidth;
        const groundEl = elements.ground;
        const groundHeight = groundEl ? groundEl.offsetHeight : CONFIG.groundHeight;
        const playableHeight = containerHeight - groundHeight;

        // Scale pipe gap based on screen height (smaller screens = smaller gap)
        const baseHeight = 700; // Reference height
        const scaleFactor = Math.max(0.7, Math.min(1.2, playableHeight / (baseHeight - CONFIG.groundHeight)));
        const pipeGap = Math.round(CONFIG.pipeGap * scaleFactor);

        // Scale arju size based on screen
        const arjuSize = Math.round(CONFIG.arjuWidth * Math.max(0.8, Math.min(1.2, scaleFactor)));

        return { containerHeight, containerWidth, groundHeight, playableHeight, pipeGap, arjuSize, scaleFactor };
    }

    // Update Arju size based on screen
    function updateArjuSize() {
        const { arjuSize } = getGameDimensions();
        elements.arju.style.width = arjuSize + 'px';
        elements.arju.style.height = arjuSize + 'px';
    }

    // Create a pipe pair
    function createPipe() {
        const { playableHeight, containerWidth, pipeGap, groundHeight, containerHeight } = getGameDimensions();

        // Calculate pipe heights with proper positioning
        const minTopHeight = 50;
        const maxTopHeight = Math.max(playableHeight - pipeGap - 50, minTopHeight + 50);
        const topPipeHeight = Math.floor(Math.random() * (maxTopHeight - minTopHeight)) + minTopHeight;

        // Gap starts right after top pipe
        const gapTop = topPipeHeight;
        const gapBottom = gapTop + pipeGap;

        // Bottom pipe goes from gap bottom to ground level
        const bottomPipeHeight = playableHeight - gapBottom;

        // Top pipe - starts from top (0) with calculated height
        const topPipe = document.createElement('div');
        topPipe.className = 'pipe pipe-top';
        topPipe.style.height = topPipeHeight + 'px';
        topPipe.style.top = '0';
        topPipe.style.left = containerWidth + 'px';
        elements.container.appendChild(topPipe);

        // Bottom pipe - starts at gapBottom and extends to ground
        const bottomPipe = document.createElement('div');
        bottomPipe.className = 'pipe pipe-bottom';
        bottomPipe.style.height = bottomPipeHeight + 'px';
        bottomPipe.style.top = gapBottom + 'px'; // Position from top
        bottomPipe.style.left = containerWidth + 'px';
        elements.container.appendChild(bottomPipe);

        const pipeData = {
            x: containerWidth,
            topPipe,
            bottomPipe,
            topHeight: topPipeHeight,
            bottomTop: gapBottom,
            passed: false
        };

        gameState.pipes.push(pipeData);
    }

    // Update pipes
    function updatePipes(deltaTime = 1) {
        gameState.pipes.forEach((pipe, index) => {
            pipe.x -= CONFIG.pipeSpeed * deltaTime;
            pipe.topPipe.style.left = pipe.x + 'px';
            pipe.bottomPipe.style.left = pipe.x + 'px';

            // Check if arju passed the pipe
            if (!pipe.passed && pipe.x + CONFIG.pipeWidth < 80) {
                pipe.passed = true;
                gameState.score++;
                elements.scoreDisplay.textContent = gameState.score;
                playSound('score');

                // Track score milestones (every 5 points)
                if (gameState.score % 5 === 0) {
                    trackEvent('level_up', {
                        score: gameState.score,
                        level: Math.floor(gameState.score / 5)
                    });
                }
            }

            // Remove pipes that are off screen
            if (pipe.x < -CONFIG.pipeWidth) {
                pipe.topPipe.remove();
                pipe.bottomPipe.remove();
                gameState.pipes.splice(index, 1);
            }
        });
    }

    // Check collision
    function checkCollision() {
        const { playableHeight, arjuSize } = getGameDimensions();
        const arjuRect = {
            left: 80,
            right: 80 + arjuSize - 10,
            top: gameState.arjuY + 5,
            bottom: gameState.arjuY + arjuSize - 5
        };

        // Ground collision
        if (arjuRect.bottom >= playableHeight) {
            return true;
        }

        // Ceiling collision
        if (arjuRect.top <= 0) {
            return true;
        }

        // Pipe collision
        for (const pipe of gameState.pipes) {
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + CONFIG.pipeWidth;

            if (arjuRect.right > pipeLeft && arjuRect.left < pipeRight) {
                // Check top pipe
                if (arjuRect.top < pipe.topHeight) {
                    return true;
                }
                // Check bottom pipe
                if (arjuRect.bottom > pipe.bottomTop) {
                    return true;
                }
            }
        }

        return false;
    }

    // Simple sound effects using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch(type) {
            case 'jump':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
            case 'score':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
                break;
            case 'hit':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
        }
    }

    // Jump action
    function jump() {
        if (!gameState.isPlaying || gameState.isGameOver) return;
        gameState.arjuVelocity = CONFIG.jumpForce;
        playSound('jump');
    }

    // Start game
    function startGame() {
        // Get dynamic initial position based on screen size
        const { playableHeight } = getGameDimensions();
        const initialY = playableHeight * 0.4; // Start at 40% from top

        gameState = {
            isPlaying: true,
            isGameOver: false,
            score: 0,
            highScore: gameState.highScore,
            arjuY: initialY,
            arjuVelocity: 0,
            pipes: [],
            animationFrame: 0,
            lastAnimationTime: 0,
            lastFrameTime: 0
        };

        // Update Arju size for current screen
        updateArjuSize();

        elements.scoreDisplay.textContent = '0';
        elements.startScreen.style.display = 'none';
        elements.gameOverScreen.style.display = 'none';

        // Clear existing pipes
        document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());

        // Track game start
        trackEvent('game_start', {
            high_score: gameState.highScore
        });

        // Start game loop
        requestAnimationFrame(gameLoop);

        // Start spawning pipes
        spawnPipes();
    }

    // Calculate spawn interval based on score
    function getSpawnInterval() {
        const progress = Math.min(gameState.score / CONFIG.maxScoreForDifficulty, 1);
        const interval = CONFIG.pipeSpawnIntervalStart -
            (CONFIG.pipeSpawnIntervalStart - CONFIG.pipeSpawnIntervalEnd) * progress;
        return Math.round(interval);
    }

    // Pipe spawner with dynamic difficulty
    let pipeSpawnTimeout;
    function spawnPipes() {
        createPipe();
        schedulePipeSpawn();
    }

    function schedulePipeSpawn() {
        if (!gameState.isPlaying || gameState.isGameOver) return;

        const interval = getSpawnInterval();
        pipeSpawnTimeout = setTimeout(() => {
            if (gameState.isPlaying && !gameState.isGameOver) {
                createPipe();
                schedulePipeSpawn();
            }
        }, interval);
    }

    // Game over
    function gameOver() {
        gameState.isGameOver = true;
        gameState.isPlaying = false;
        clearTimeout(pipeSpawnTimeout);

        playSound('hit');

        // Check if new high score
        const isNewHighScore = gameState.score > gameState.highScore;

        // Update high score
        if (isNewHighScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('flappyArjuHighScore', gameState.highScore);
        }

        // Track game over event
        trackEvent('game_over', {
            score: gameState.score,
            high_score: gameState.highScore,
            new_high_score: isNewHighScore
        });

        // Track score as a separate event for leaderboard
        trackEvent('post_score', {
            score: gameState.score,
            level: Math.floor(gameState.score / 10) + 1
        });

        elements.finalScore.textContent = gameState.score;
        elements.highScore.textContent = `High Score: ${gameState.highScore}`;

        setTimeout(() => {
            elements.gameOverScreen.style.display = 'flex';
        }, 500);
    }

    // Main game loop with delta time for smooth performance
    function gameLoop(timestamp) {
        if (!gameState.isPlaying) return;

        // Calculate delta time for consistent speed
        if (!gameState.lastFrameTime) gameState.lastFrameTime = timestamp;
        const deltaTime = Math.min((timestamp - gameState.lastFrameTime) / 16.67, 2); // Cap at 2x speed
        gameState.lastFrameTime = timestamp;

        // Apply gravity with delta time
        gameState.arjuVelocity += CONFIG.gravity * deltaTime;
        gameState.arjuY += gameState.arjuVelocity * deltaTime;

        // Update arju position
        elements.arju.style.top = gameState.arjuY + 'px';

        // Update animation
        updateArjuAnimation(timestamp);
        updateArjuRotation();

        // Update pipes with delta time
        updatePipes(deltaTime);

        // Check collision
        if (checkCollision()) {
            gameOver();
            return;
        }

        requestAnimationFrame(gameLoop);
    }

    // Event listeners
    function setupEventListeners() {
        // Start button
        elements.startBtn.addEventListener('click', startGame);

        // Restart button
        elements.restartBtn.addEventListener('click', startGame);

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                if (!gameState.isPlaying && !gameState.isGameOver) {
                    startGame();
                } else {
                    jump();
                }
            }
        });

        // Mouse/Touch controls
        elements.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('game-btn')) return;
            if (gameState.isPlaying && !gameState.isGameOver) {
                jump();
            }
        });

        // Touch support
        elements.container.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('game-btn')) return;
            e.preventDefault();
            if (gameState.isPlaying && !gameState.isGameOver) {
                jump();
            }
        });
    }

    // Initialize game
    function init() {
        injectStyles();
        createGameHTML();
        cacheElements();
        preloadImages();
        setupEventListeners();

        // Set initial position and size dynamically based on screen size
        const { playableHeight } = getGameDimensions();
        gameState.arjuY = playableHeight * 0.4;
        elements.arju.style.top = gameState.arjuY + 'px';
        updateArjuSize();
        elements.highScore.textContent = `High Score: ${gameState.highScore}`;

        // Handle window resize
        window.addEventListener('resize', () => {
            updateArjuSize();
            if (!gameState.isPlaying) {
                const { playableHeight } = getGameDimensions();
                gameState.arjuY = playableHeight * 0.4;
                elements.arju.style.top = gameState.arjuY + 'px';
            }
        });

        console.log('🎮 Flappy Arju loaded! Press START or SPACE to play.');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
