// Wheel Configuration
const wheelOptions = [
    { text: 'PUCHITO', color: '#D32F2F', icon: '🚬' },
    { text: 'BAILE', color: '#FFB300', icon: '💃' },
    { text: 'VERDAD', color: '#1976D2', icon: '🗣️' },
    { text: 'RETO', color: '#388E3C', icon: '⚡' },
    { text: 'BESO', color: '#E91E63', icon: '💋' },
    { text: 'SHOT', color: '#F57C00', icon: '🥃' },
    { text: 'PUCHITO', color: '#7B1FA2', icon: '🚬' },
    { text: 'BAILE', color: '#00BCD4', icon: '💃' },
    { text: 'RETO', color: '#FFC107', icon: '⚡' },
    { text: 'VERDAD', color: '#4CAF50', icon: '🗣️' },
    { text: 'SHOT', color: '#FF5722', icon: '🥃' },
    { text: 'BESO', color: '#9C27B0', icon: '💋' }
];

// Challenge descriptions
const challengeDescriptions = {
    'PUCHITO': '¡Comparte un puchito conmigo! Vamos a relajarnos juntos.',
    'BAILE': '¡Bailemos juntos! Muéstrame tus mejores pasos.',
    'VERDAD': '¡Hazme una pregunta! Te responderé con total honestidad.',
    'RETO': '¡Tienes un reto para mí! Dime qué debo hacer.',
    'BESO': '¡Te ganaste un beso! ¿En la mejilla o en la mano?',
    'SHOT': '¡Brindemos juntos! Vamos por un shot.'
};

// State
let isSpinning = false;
let currentRotation = 0;
let soundEnabled = true;

// DOM Elements
const wheelCanvas = document.getElementById('wheelCanvas');
const ctx = wheelCanvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultContainer = document.getElementById('resultContainer');
const resultCard = document.getElementById('resultCard');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultDescription = document.getElementById('resultDescription');
const soundToggle = document.getElementById('soundToggle');
const confettiContainer = document.getElementById('confettiContainer');

// Set canvas size
function setCanvasSize() {
    const container = document.getElementById('wheelContainer');
    const size = container.offsetWidth;
    wheelCanvas.width = size;
    wheelCanvas.height = size;
    drawWheel();
}

// Draw the wheel
function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = wheelCanvas.width / 2 - 10;
    const sliceAngle = (Math.PI * 2) / wheelOptions.length;
    
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    wheelOptions.forEach((option, index) => {
        const startAngle = index * sliceAngle - Math.PI / 2;
        const endAngle = (index + 1) * sliceAngle - Math.PI / 2;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        // Fill with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, option.color);
        gradient.addColorStop(1, shadeColor(option.color, -20));
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw icon
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(option.icon, radius * 0.65, -10);
        
        // Draw text
        ctx.font = 'bold 18px Poppins, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(option.text, radius * 0.65, 15);
        
        ctx.restore();
    });
}

// Utility function to shade colors
function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

// Spin the wheel
function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    
    // Generate random spins and final angle
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const randomDegrees = Math.random() * 360; // Random stop position
    const totalRotation = (spins * 360) + randomDegrees;
    const finalRotation = currentRotation + totalRotation;
    
    // Play spin sound
    playSound('spin');
    
    // Animate wheel
    const duration = 4000;
    const startTime = Date.now();
    const startRotation = currentRotation;
    
    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const rotation = startRotation + (totalRotation * easeProgress);
        
        // Only rotate the canvas, not the container
        wheelCanvas.style.transform = `rotate(${rotation}deg)`;
        wheelCanvas.style.transition = 'none';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentRotation = finalRotation % 360;
            wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;
            
            // Calculate which segment is at the top (north/up position)
            // When wheel rotates clockwise, we need to find which segment moved to the top
            const sliceAngle = 360 / wheelOptions.length;
            
            // Direct calculation: which segment is now at the top after rotation
            // Invert the rotation to find original position
            const segmentIndex = Math.floor((360 - currentRotation) / sliceAngle) % wheelOptions.length;
            const result = wheelOptions[segmentIndex];
            
            // Show result after spin completes
            setTimeout(() => {
                showResult(result);
                playSound('win');
                createConfetti();
            }, 500);
        }
    }
    
    animate();
}

// Show result
function showResult(result) {
    resultIcon.textContent = result.icon;
    resultTitle.textContent = `¡${result.text}!`;
    resultDescription.textContent = challengeDescriptions[result.text];
    
    // Apply result color theme
    resultCard.style.background = `linear-gradient(135deg, ${result.color}, ${shadeColor(result.color, -30)})`;
    
    resultContainer.classList.add('show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        hideResult();
    }, 4000);
}

// Hide result
function hideResult() {
    resultContainer.classList.remove('show');
    setTimeout(() => {
        isSpinning = false;
        spinButton.disabled = false;
    }, 300);
}

// Create confetti animation
function createConfetti() {
    const colors = ['#FFB300', '#D32F2F', '#1976D2', '#388E3C', '#E91E63', '#F57C00'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        confettiContainer.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Sound effects (simple beep sounds using Web Audio API)
function playSound(type) {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'spin') {
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'win') {
        // Happy sound
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G
        frequencies.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
            gain.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.3);
            osc.start(audioContext.currentTime + index * 0.1);
            osc.stop(audioContext.currentTime + index * 0.1 + 0.3);
        });
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggle.classList.toggle('muted', !soundEnabled);
}

// Event Listeners
spinButton.addEventListener('click', spinWheel);
soundToggle.addEventListener('click', toggleSound);
resultContainer.addEventListener('click', hideResult);

// Prevent scroll on mobile when touching the wheel
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.wheel-container')) {
        e.preventDefault();
    }
}, { passive: false });

// Initialize
window.addEventListener('load', () => {
    setCanvasSize();
    drawWheel();
});

window.addEventListener('resize', () => {
    setCanvasSize();
});

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSpinning) {
        e.preventDefault();
        spinWheel();
    } else if (e.code === 'Escape' && resultContainer.classList.contains('show')) {
        hideResult();
    }
});
