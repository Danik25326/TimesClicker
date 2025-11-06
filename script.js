### script.js

```javascript
const clickBtn = document.getElementById('clickBtn');
const scoreDisplay = document.getElementById('score');
const upgradesContainer = document.getElementById('upgrades');
const clock = document.getElementById('clickableClock');
const musicBtn = document.getElementById('musicBtn');
const phonk = document.getElementById('phonk');
const musicPrev = document.getElementById('musicPrev');
const musicNext = document.getElementById('musicNext');

let score = 0;
let perClick = 1;
let autoGain = 0;
let autoGainInterval;
let musicIndex = 0;

// ======== MUSIC CONTROL ========
function loadMusic(index) {
  if (!musicList[index]) return;
  phonk.src = musicList[index].url;
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
});

musicNext.addEventListener('click', () => {
  musicIndex = (musicIndex + 1) % musicList.length;
  loadMusic(musicIndex);
  phonk.play();
});

loadMusic(musicIndex);

// ======== GAME CORE ========
clickBtn.addEventListener('click', () => {
  score += perClick;
  updateScore();
  animateClock();
});

function updateScore() {
  scoreDisplay.textContent = `Часу зібрано: ${score} сек`;
  checkUpgrades();
}

function animateClock() {
  clock.style.transform = 'scale(1.1)';
  setTimeout(() => (clock.style.transform = 'scale(1)'), 100);
}

// ======== AUTO GAIN ========
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

function glowPulse() {
  clock.classList.add('glow');
  setTimeout(() => clock.classList.remove('glow'), 300);
}

// ======== UPGRADES ========
const upgrades = [
  { name: '⏰ +1 за клік', cost: 10, bonus: 1, type: 'click' },
  { name: '⚙️ +5 автогенерації', cost: 100, bonus: 5, type: 'auto' },
  { name: '💎 +10 за клік', cost: 500, bonus: 10, type: 'click' },
  { name: '🪐 +20 автогенерації', cost: 2000, bonus: 20, type: 'auto' },
  { name: '💥 +100 за клік', cost: 10000, bonus: 100, type: 'click' }
];

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

function checkUpgrades() {
  upgrades.forEach((upg) => {
    if (score >= upg.cost && upg.button.disabled) {
      upg.button.disabled = false;
      upg.button.classList.remove('locked');
    }
  });
}

function buyUpgrade(index, button) {
  const upg = upgrades[index];
  if (score >= upg.cost) {
    score -= upg.cost;
    if (upg.type === 'click') perClick += upg.bonus;
    else if (upg.type === 'auto') {
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

renderUpgrades();
updateScore();
startAutoGain();
```

### musicList.js

```javascript
const musicList = [
  { title: 'Phonk 1', url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_3bfcdb8a69.mp3' },
  { title: 'Phonk 2', url: 'https://cdn.pixabay.com/download/audio/2023/02/20/audio_2b84e7f5a3.mp3' },
  { title: 'Phonk 3', url: 'https:
```
