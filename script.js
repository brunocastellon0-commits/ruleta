// Wheel Configuration
const wheelOptions = [
    { text: 'BESO', color: '#E91E63', icon: '💋' },
    { text: 'SHOT', color: '#F57C00', icon: '🥃' },
    { text: 'RETO', color: '#7B1FA2', icon: '😈' },
    { text: 'SECO', color: '#1976D2', icon: '🍻' },
    { text: 'SECO MOJADO', color: '#D32F2F', icon: '🚬' },
    { text: 'BESO', color: '#C2185B', icon: '💋' },
    { text: 'SHOT', color: '#EF6C00', icon: '🥃' },
    { text: 'RETO', color: '#388E3C', icon: '😈' },
    { text: 'SECO', color: '#0288D1', icon: '🍻' },
    { text: 'SECO MOJADO', color: '#C62828', icon: '🚬' }
];

// Challenge descriptions
const challengeDescriptions = {
    'BESO': '¿Timidez? Cierra los ojos, yo hago el resto.',
    'SHOT': '¡Arriba, abajo, al centro y pa\' dentro!',
    'RETO': '¡Vamos a alocarnos! ¿Te atreves?',
    'SECO': '¡No me hagas quedar mal! ¡Gota doble!',
    'SECO MOJADO': '¡Para que pegue más rápido!'
};

// State
let isSpinning = false;
let currentRotation = 0;
let soundEnabled = true;
let audioContext = null;
let lastWinningIndex = -1;

// Initialize audio context on first interaction
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context initialized');
    }
    return audioContext;
}

// DOM Elements
const wheelCanvas = document.getElementById('wheelCanvas');
const ctx = wheelCanvas.getContext('2d');
const wheelContainer = document.getElementById('wheelContainer');
const resultContainer = document.getElementById('resultContainer');
const resultCard = document.getElementById('resultCard');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultDescription = document.getElementById('resultDescription');
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
        const words = option.text.split(' ');
        const isMultiLine = words.length > 1;
        
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#ffffff';
        // Move content closer to outer edge where segment is wider (radius * 0.76)
        // Previous was 0.65 which is closer to center (narrow part)
        ctx.fillText(option.icon, radius * 0.76, isMultiLine ? -22 : -10);
        
        // Draw text
        // Slightly smaller font for multiline to ensure fit
        ctx.font = isMultiLine ? 'bold 15px Poppins, sans-serif' : 'bold 18px Poppins, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        
        if (isMultiLine) {
            // Draw multiple lines
            words.forEach((word, i) => {
                ctx.fillText(word, radius * 0.76, 8 + (i * 18));
            });
        } else {
            // Draw single line
            ctx.fillText(option.text, radius * 0.76, 20);
        }
        
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
    
    // Initialize audio context on first click
    initAudioContext();
    
    isSpinning = true;
    
    // Force a DIFFERENT winner than the last one to improve "randomness" feel
    let winningIndex;
    do {
         winningIndex = Math.floor(Math.random() * wheelOptions.length);
    } while (winningIndex === lastWinningIndex && wheelOptions.length > 1);
    
    lastWinningIndex = winningIndex; // Save for next time
    
    // Calculate the angle to land on this specific segment
    // Logic: segmentIndex = Math.floor((360 - rotation) / sliceAngle)
    // So targetRotation must satisfy: winningIndex = (360 - targetRotation) / sliceAngle
    const sliceAngle = 360 / wheelOptions.length;
    
    // Add random offset within the segment (10% to 90%) to avoid lines
    const offsetInSegment = (Math.random() * 0.8 + 0.1) * sliceAngle; 
    
    // Calculate target position in the circle (0-360)
    // 360 - rotation = index * slice + offset
    // rotation = 360 - (index * slice + offset)
    const targetAngle = 360 - (winningIndex * sliceAngle + offsetInSegment);
    
    // Current position
    const currentMod = currentRotation % 360;
    
    // Calculate distance to go (must be positive)
    let distToGo = targetAngle - currentMod;
    if (distToGo < 0) distToGo += 360;
    
    // Add random full spins (5 to 8)
    const spins = 5 + Math.floor(Math.random() * 4);
    const totalRotation = (spins * 360) + distToGo;
    
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
        
        // Easing function (ease-out cubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const rotation = startRotation + (totalRotation * easeProgress);
        
        // Only rotate the canvas, not the container
        wheelCanvas.style.transform = `rotate(${rotation}deg)`;
        wheelCanvas.style.transition = 'none';
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentRotation = finalRotation; // Keep exact float to avoid drift
            wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;
            
            // Result is already known: winningIndex
            const result = wheelOptions[winningIndex];
            
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

function hideResult() {
    resultContainer.classList.remove('show');
    setTimeout(() => {
        isSpinning = false;
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
    if (!soundEnabled) {
        console.log('Sound disabled');
        return;
    }
    
    if (!audioContext) {
        console.log('Audio context not initialized yet');
        return;
    }
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'spin') {
            console.log('Playing spin sound');
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'win') {
            console.log('Playing win sound');
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
    } catch (error) {
        console.error('Error playing sound:', error);
    }
}



// Event Listeners
wheelContainer.addEventListener('click', spinWheel);
resultContainer.addEventListener('click', hideResult);

// Handle background video audio
const backgroundVideo = document.querySelector('.background-video');

function enableVideoAudio() {
    if (backgroundVideo && backgroundVideo.muted) {
        backgroundVideo.muted = false;
        backgroundVideo.volume = 1.0;
        backgroundVideo.play().catch(e => console.log("Audio play error:", e));
        console.log('Video audio enabled');
    }
}

// Enable audio on any interaction
document.addEventListener('click', () => {
    initAudioContext();
    enableVideoAudio();
}, { once: true });

// Also try to enable on specifically clicking the wheel (redundant but safe)
wheelContainer.addEventListener('click', enableVideoAudio);

// Make the center (devil) clickable too
const centerFixed = document.querySelector('.wheel-center-fixed');
if (centerFixed) {
    centerFixed.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent double firing if overlapping
        enableVideoAudio();
        spinWheel();
    });
}

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
