window.onload = function () {
  // Елементи інтерфейсу
  const clock = document.getElementById("clickableClock");
  const hourHand = document.querySelector(".hour");
  const minuteHand = document.querySelector(".minute");
  const secondHand = document.querySelector(".second");
  const musicBtn = document.getElementById("musicBtn");
  const phonk = document.getElementById("phonk");
  const scoreText = document.getElementById("score");
  const upgradesContainer = document.getElementById("upgrades");
  const worldTitle = document.getElementById("worldTitle");

  // Ігрові змінні
  let score = 0;
  let clickPower = 1;

  // Форматування часу
  function formatTime(seconds) {
    const units = [
      { name: "год", value: 3600 },
      { name: "хв", value: 60 },
      { name: "сек", value: 1 },
    ];
    let remaining = Math.floor(seconds);
    const parts = [];
    for (const u of units) {
      const amount = Math.floor(remaining / u.value);
      if (amount > 0 || parts.length > 0) {
        if (amount > 0) parts.push(`${amount} ${u.name}`);
        remaining %= u.value;
      }
    }
    if (parts.length === 0) return `${Math.floor(seconds)} сек`;
    return parts.join(" ");
  }

  // Апгрейди
  const upgrades = [
    { name: "📱 Включити телефон", baseCost: 12, bonus: 1, level: 0 },
    { name: "☕ Зробити каву", baseCost: 25, bonus: 2, level: 0 },
    { name: "💻 Увімкнути ноут", baseCost: 700, bonus: 3, level: 0 },
    { name: "🎧 Надіти навушники", baseCost: 2000, bonus: 4, level: 0 },
  ];

  const buttons = [];
  upgrades.forEach((upgrade, index) => {
    const btn = document.createElement("button");
    btn.className = "upgrade-btn hidden";
    upgradesContainer.appendChild(btn);
    buttons.push(btn);

    function updateText() {
      const cost = upgrade.baseCost * (upgrade.level + 1);
      btn.textContent = `${upgrade.name} (Lv.${upgrade.level}) — ${formatTime(cost)}`;
      btn.disabled = score < cost;
    }
    updateText();

    btn.addEventListener("click", () => {
      const cost = upgrade.baseCost * (upgrade.level + 1);
      if (score >= cost) {
        score -= cost;
        upgrade.level++;
        clickPower += upgrade.bonus;
        updateText();
        updateScore();
        revealNext(index);
      }
    });

    upgrade.update = updateText;
  });

  if (buttons[0]) buttons[0].classList.remove("hidden");

  function revealNext(i) {
    if (buttons[i + 1]) {
      buttons[i + 1].classList.remove("hidden");
      upgrades[i + 1].update?.();
    }
  }

  function updateScore() {
    scoreText.textContent = `Часу зібрано: ${formatTime(score)}`;
    buttons.forEach((b, idx) => {
      if (!b.classList.contains("hidden")) {
        const cost = upgrades[idx].baseCost * (upgrades[idx].level + 1);
        b.disabled = score < cost;
      }
    });
  }

  // Анімація кліку
  function triggerClockAnimation() {
    clock.classList.remove("click-anim");
    void clock.offsetWidth;
    clock.classList.add("click-anim");
  }

  function addTime() {
    score += clickPower;
    updateScore();
    triggerClockAnimation();
  }

  if (clock) clock.addEventListener("click", addTime);

  // Музика
  if (musicBtn && phonk) {
    musicBtn.addEventListener("click", () => {
      if (phonk.paused) {
        phonk.volume = 0.4;
        phonk.play();
        musicBtn.textContent = "⏸ Зупинити фонк";
      } else {
        phonk.pause();
        musicBtn.textContent = "▶️ Включити фонк";
      }
    });
  }

  // Оновлення годинника
  function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    if (secondHand) secondHand.style.transform = `translateX(-50%) rotate(${seconds * 6}deg)`;
    if (minuteHand) minuteHand.style.transform = `translateX(-50%) rotate(${minutes * 6 + seconds * 0.1}deg)`;
    if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${hours * 30 + minutes * 0.5}deg)`;
  }

  setInterval(updateClock, 1000);
  updateClock();
  updateScore();

  // Додавання "Time" у заголовок
  if (worldTitle) {
    worldTitle.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });
    worldTitle.addEventListener("blur", () => {
      let text = worldTitle.textContent.trim();
      if (!/(\bTime)$/i.test(text)) text += " Time";
      worldTitle.textContent = text;
    });
  }
};
