// ===============================
// 🎮 Основні елементи
// ===============================
const clickBtn = document.getElementById('clickBtn');
const scoreDisplay = document.getElementById('score');
const upgradesContainer = document.getElementById('upgrades');
const clock = document.getElementById('clickableClock');

const musicBtn = document.getElementById('musicBtn');
const musicPrev = document.getElementById('musicPrev');
const musicNext = document.getElementById('musicNext');
const trackTitle = document.getElementById('trackTitle');
const phonk = document.getElementById('phonk');

// ===============================
// ⚙️ Змінні гри
// ===============================
let score = 0;
let perClick = 1;
let autoGain = 0;
let autoGainInterval = null;

let musicIndex = 0;

// ===============================
// 🎵 Музика
// ===============================
function loadMusic(index) {
  const track = musicList[index];
  if (!track) return;

  phonk.src = track.url;
  trackTitle.textContent = `Phonk: ${track.title}`;
  phonk.load();
}

musicBtn.addEventListener('click', () => {
  if (phonk.paused) {
    phonk.play();
    musicBtn.textContent = '⏸️ Зупинити фонк';
  } else {
    phonk.pause();
    musicBtn.textContent = '▶️ Включити фонк';
  }
});

musicPrev.addEventListener('click', () => {
  musicIndex = (musicIndex - 1 + musicList.length) % musicList.length;
  loadMusic(musicIndex);
  phonk.play();
  musicBtn.textContent = '⏸️ Зупинити фонк';
});

musicNext.addEventListener('click', () => {
  musicIndex = (musicIndex + 1) % musicList.length;
  loadMusic(musicIndex);
  phonk.play();
  musicBtn.textContent = '⏸️ Зупинити фонк';
});

// Завантажуємо перший трек
loadMusic(musicIndex);

// ===============================
// 🕹️ Основна механіка кліку
// ===============================
clickBtn.addEventListener('click', () => {
  score += perClick;
  updateScore();
  animateClock();
});

// Оновлення тексту очок
function updateScore() {
  scoreDisplay.textContent = `Часу зібрано: ${score} сек`;
  checkUpgrades();
}

// Анімація годинника при кліку
function animateClock() {
  clock.style.transform = 'scale(1.1)';
  setTimeout(() => {
    clock.style.transform = 'scale(1)';
  }, 120);
}

// ===============================
// ⏳ Автоматична генерація
// ===============================
function startAutoGain() {
  clearInterval(autoGainInterval);

  if (autoGain > 0) {
    autoGainInterval = setInterval(() => {
      score += autoGain;
      updateScore();
      glowPulse();
    }, 1000);
  }
}

// Візуальний ефект для автогенерації
function glowPulse() {
  clock.classList.add('glow');
  setTimeout(() => clock.classList.remove('glow'), 300);
}

// ===============================
// 💎 Система апгрейдів
// ===============================
const upgrades = [
  { name: '⏰ +1 за клік', cost: 10, bonus: 1, type: 'click' },
  { name: '⚙️ +5 автогенерації', cost: 100, bonus: 5, type: 'auto' },
  { name: '💎 +10 за клік', cost: 500, bonus: 10, type: 'click' },
  { name: '🪐 +20 автогенерації', cost: 2000, bonus: 20, type: 'auto' },
  { name: '💥 +100 за клік', cost: 10000, bonus: 100, type: 'click' }
];

// Створення кнопок апгрейдів
function renderUpgrades() {
  upgradesContainer.innerHTML = '';

  upgrades.forEach((upg, i) => {
    const btn = document.createElement('button');
    btn.textContent = `${upg.name} — ${upg.cost} сек`;
    btn.className = 'upgrade-btn locked';
    btn.disabled = true;

    btn.addEventListener('click', () => buyUpgrade(i, btn));

    upgradesContainer.appendChild(btn);
    upg.button = btn;
  });
}

// Перевірка, які апгрейди можна купити
function checkUpgrades() {
  upgrades.forEach(upg => {
    if (score >= upg.cost && upg.button.disabled) {
      upg.button.disabled = false;
      upg.button.classList.remove('locked');
    }
  });
}

// Покупка апгрейду
function buyUpgrade(index, button) {
  const upg = upgrades[index];

  if (score >= upg.cost) {
    score -= upg.cost;

    if (upg.type === 'click') {
      perClick += upg.bonus;
    } else if (upg.type === 'auto') {
      autoGain += upg.bonus;
      startAutoGain();
    }

    upg.cost = Math.floor(upg.cost * 2.5);
    button.textContent = `${upg.name} — ${upg.cost} сек`;
    button.disabled = true;
    button.classList.add('locked');

    updateScore();
  }
}

// ===============================
// 🚀 Старт гри
// ===============================
renderUpgrades();
updateScore();
startAutoGain();
