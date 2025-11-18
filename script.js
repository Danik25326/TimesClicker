// ===== ГЛОБАЛЬНІ ЗМІННІ =====
let score = 0;
let clickPower = 1;
let autoRate = 0;

// ===== КЛІК ПО КНОПЦІ =====
const clickButton = document.getElementById('clickButton');
const scoreDisplay = document.getElementById('score');
const clickPowerDisplay = document.getElementById('clickPower');
const autoRateDisplay = document.getElementById('autoRate');
const bubbleContainer = document.getElementById('bubbleContainer');
const toastArea = document.getElementById('toastArea');

clickButton.addEventListener('click', () => {
  score += clickPower;
  updateDisplay();
  spawnBubble();
});

// ===== ФУНКЦІЯ ОНОВЛЕННЯ ВІДОБРАЖЕННЯ =====
function updateDisplay() {
  scoreDisplay.textContent = score;
  clickPowerDisplay.textContent = clickPower;
  autoRateDisplay.textContent = autoRate;
}

// ===== СПАВН БАЛОНЧИКІВ =====
function spawnBubble() {
  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = `+${clickPower}`;
  
  const x = Math.random() * 100;
  bubble.style.left = x + '%';

  bubbleContainer.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 1000);
}

// ===== АВТО-КЛІКЕР =====
setInterval(() => {
  if (autoRate > 0) {
    score += autoRate;
    updateDisplay();
    spawnBubble();
  }
}, 1000);

// ===== АПГРЕЙДИ =====
const upgradeButtons = document.querySelectorAll('.upgrade-btn');
upgradeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const power = parseInt(btn.dataset.power);
    const cost = parseInt(btn.dataset.cost);
    if (score >= cost) {
      score -= cost;
      clickPower += power;
      showToast(`Куплено +${power} до кліку!`);
      updateDisplay();
    } else {
      showToast('Недостатньо очок!');
    }
  });
});

// ===== ТОСТИ =====
function showToast(text) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  toastArea.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// ===== ГОДИННИК =====
const digitalClock = document.getElementById('digitalClock');
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  digitalClock.textContent = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

// ===== ТАБИ =====
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const tab = btn.dataset.tab;
    tabContents.forEach(tc => {
      tc.style.display = (tc.id === tab) ? 'block' : 'none';
    });
  });
});
