window.onload = function() {
  const clock = document.getElementById('clickableClock');
  const hourHand = document.querySelector('.hour');
  const minuteHand = document.querySelector('.minute');
  const secondHand = document.querySelector('.second');
  const clickBtn = document.getElementById('clickBtn');
  const musicBtn = document.getElementById('musicBtn');
  const phonk = document.getElementById('phonk');
  const scoreText = document.getElementById('score');
  const upgradesContainer = document.getElementById('upgrades');

  let score = 0;
  let clickPower = 1;

  // === ФОРМАТУВАННЯ ЧАСУ ===
  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    let parts = [];
    if (h > 0) parts.push(`${h} год`);
    if (m > 0) parts.push(`${m} хв`);
    if (s > 0 || parts.length === 0) parts.push(`${s} сек`);
    return parts.join(' ');
  }

  // === АПГРЕЙДИ ===
  const upgrades = [
    { name: "📱 Включити телефон", baseCost: 10, bonus: 1, level: 0 },
    { name: "☕ Зробити каву", baseCost: 100, bonus: 2, level: 0 },
    { name: "💻 Увімкнути ноут", baseCost: 1000, bonus: 3, level: 0 },
    { name: "🎧 Надіти навушники", baseCost: 10000, bonus: 4, level: 0 },
    { name: "💪 Почати тренування", baseCost: 100000, bonus: 5, level: 0 },
    { name: "📚 Відкрити книгу", baseCost: 1000000, bonus: 6, level: 0 },
    { name: "🌇 Вийти на прогулянку", baseCost: 10000000, bonus: 7, level: 0 },
    { name: "🚀 Почати проєкт", baseCost: 100000000, bonus: 8, level: 0 },
    { name: "🧠 Медитувати над сенсом часу", baseCost: 1000000000, bonus: 9, level: 0 },
  ];

  // === СТВОРЕННЯ КНОПОК АПГРЕЙДІВ ===
  upgrades.forEach(upgrade => {
    const btn = document.createElement('button');
    btn.className = 'upgrade-btn';
    updateUpgradeText();

    btn.addEventListener('click', () => {
      const cost = upgrade.baseCost + upgrade.level;
      if (score >= cost) {
        score -= cost;
        upgrade.level++;
        clickPower += upgrade.bonus;
        updateUpgradeText();
        updateScore();
      }
    });

    function updateUpgradeText() {
      const cost = upgrade.baseCost + upgrade.level;
      btn.textContent = `${upgrade.name} (Lv.${upgrade.level}) — ${formatTime(cost)}`;
    }

    upgradesContainer.appendChild(btn);
  });

  // === ОНОВЛЕННЯ РАХУНКУ ===
  function updateScore() {
    scoreText.textContent = `Часу зібрано: ${formatTime(score)}`;
  }

  // === ЕФЕКТ КЛІКУ ===
  function boomEffect() {
    clock.style.scale = "1.05";
    setTimeout(() => (clock.style.scale = "1"), 100);
  }

  // === ДОДАВАННЯ ЧАСУ ===
  function addTime() {
    score += clickPower;
    updateScore();

    clock.style.borderColor = "#ec4899";
    clock.style.boxShadow = "0 0 50px #ec4899, 0 0 100px #ec4899";
    boomEffect();

    setTimeout(() => {
      clock.style.borderColor = "#0ea5e9";
      clock.style.boxShadow =
        "0 0 30px #0ea5e9, 0 0 60px #0ea5e9, inset 0 0 30px rgba(14, 165, 233, 0.3)";
    }, 300);
  }

  clickBtn.addEventListener('click', addTime);
  clock.addEventListener('click', addTime);

  // === МУЗИКА ===
  musicBtn.addEventListener('click', () => {
    if (phonk.paused) {
      phonk.volume = 0.4;
      phonk.play();
      musicBtn.textContent = "⏸ Зупинити фонк";
      musicBtn.classList.add("active");
    } else {
      phonk.pause();
      musicBtn.textContent = "▶️ Включити фонк";
      musicBtn.classList.remove("active");
    }
  });

  // === АНІМАЦІЯ ГОДИННИКА ===
  function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    secondHand.style.transform = `translateX(-50%) rotate(${seconds * 6}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minutes * 6 + seconds * 0.1}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hours * 30 + minutes * 0.5}deg)`;
  }

  setInterval(updateClock, 1000);
  updateClock();
  updateScore();
};


