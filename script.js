window.onload = function () {
  // === ЕЛЕМЕНТИ ===
  const clock = document.getElementById("clickableClock");
  const hourHand = document.querySelector(".hour");
  const minuteHand = document.querySelector(".minute");
  const secondHand = document.querySelector(".second");
  const musicBtn = document.getElementById("musicBtn");
  const prevTrack = document.getElementById("prevTrack");
  const nextTrack = document.getElementById("nextTrack");
  const player = document.getElementById("player");
  const scoreText = document.getElementById("score");
  const upgradesContainer = document.getElementById("upgrades");

  // === ІГРОВІ ЗМІННІ ===
  let score = 0;
  let clickPower = 1;
  let isPlaying = false;
  let currentTrack = 0;

  // === СПИСОК ТРЕКІВ ===
  const trackNames = [
    "Фонк №1",
    "Фонк №2",
    "Фонк №3",
    "Фонк №4",
    "Фонк №5",
    "Фонк №6",
    "Фонк №7"
  ];

  const tracks = [
    "asphalt-menace.mp3",
    "digital-overdrive.mp3",
    "drift-phonk-phonk-music-2-434611.mp3",
    "drift-phonk-phonk-music-432222.mp3",
    "phonk-music-409064 (2).mp3",
    "phonk-music-phonk-2025-432208.mp3",
    "pixel-drift.mp3"
  ].map(x => `musicList/${x}`);

  // Додаємо назву треку
  const trackTitle = document.createElement("p");
  trackTitle.style.marginTop = "0";
  trackTitle.style.fontSize = "18px";
  trackTitle.style.textShadow = "0 0 12px #3b82f6";
  trackTitle.textContent = "Зараз грає: —";
  document.querySelector(".music-player").after(trackTitle);

  function updateTrackName() {
    trackTitle.textContent = "Зараз грає: " + trackNames[currentTrack];
  }

  function loadTrack(i) {
    player.src = tracks[i];
    updateTrackName();
    if (isPlaying) player.play();
  }

  loadTrack(0);

  // 🔁 Автоматичне перемикання після завершення
  player.addEventListener("ended", () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
  });

  // === МУЗИКА ===
  musicBtn.addEventListener("click", () => {
    if (!isPlaying) {
      isPlaying = true;
      player.volume = 0.45;
      player.play();
      musicBtn.textContent = "⏸ Зупинити музику";
    } else {
      isPlaying = false;
      player.pause();
      musicBtn.textContent = "▶️ Включити музику";
    }
  });

  prevTrack.addEventListener("click", () => {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
  });

  nextTrack.addEventListener("click", () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
  });

  // === ФОРМАТУВАННЯ ЧАСУ ===
  function formatTime(seconds) {
    const units = [
      { name: "століт", value: 60*60*24*365*100 },
      { name: "десятил", value: 60*60*24*365*10 },
      { name: "рік", value: 60*60*24*365 },
      { name: "міс", value: 60*60*24*30 },
      { name: "дн", value: 60*60*24 },
      { name: "год", value: 60*60 },
      { name: "хв", value: 60 },
      { name: "сек", value: 1 }
    ];

    let remaining = Math.floor(seconds);
    const parts = [];

    for (const u of units) {
      const amount = Math.floor(remaining / u.value);
      if (amount > 0) {
        parts.push(`${amount} ${u.name}`);
        remaining %= u.value;
      }
    }

    return parts.length ? parts.join(" ") : `${seconds} сек`;
  }

  // === СПИСОК АПГРЕЙДІВ ===
  const upgrades = [
    { name: "📱 Включити телефон", baseCost: 10, bonus: 1, level: 0 },
    { name: "☕ Зробити каву", baseCost: 25, bonus: 2, level: 0 },
    { name: "💻 Увімкнути ноут", baseCost: 150, bonus: 3, level: 0 },
    { name: "🎧 Надіти навушники", baseCost: 550, bonus: 4, level: 0 },
    { name: "💪 Почати тренування", baseCost: 15000, bonus: 6, level: 0 },
    { name: "📚 Відкрити книгу", baseCost: 120000, bonus: 9, level: 0 },
    { name: "🌇 Прогулянка", baseCost: 900000, bonus: 13, level: 0 },
    { name: "🚀 Проєкт", baseCost: 7000000, bonus: 18, level: 0 },
    { name: "🧠 Медитація", baseCost: 30000000, bonus: 30, level: 0 }
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
        clickPower += upgrade.bonus;
        upgrade.level++;
        updateText();
        updateScore();
        revealNext(index);
      }
    });

    upgrade.update = updateText;
  });

  buttons[0].classList.remove("hidden");

  function revealNext(i) {
    if (buttons[i + 1]) {
      buttons[i + 1].classList.remove("hidden");
      upgrades[i + 1].update();
    }
  }

  // === ОНОВЛЕННЯ РАХУНКУ ===
  function updateScore() {
    scoreText.textContent = `Часу зібрано: ${formatTime(score)}`;

    buttons.forEach((btn, i) => {
      if (!btn.classList.contains("hidden")) {
        const cost = upgrades[i].baseCost * (upgrades[i].level + 1);
        btn.disabled = score < cost;
      }
    });
  }

  // === АНІМАЦІЯ КЛІКУ ===
  function triggerClockAnimation() {
    clock.classList.remove("click-anim");
    void clock.offsetWidth;
    clock.classList.add("click-anim");
  }

  // === ДОДАВАННЯ ЧАСУ ===
  function addTime() {
    score += clickPower;
    updateScore();
    triggerClockAnimation();
  }

  clock.addEventListener("click", addTime);

  // === ОБНОВЛЕННЯ СТРІЛОК ГОДИННИКА ===
  function updateClock() {
    const now = new Date();
    const s = now.getSeconds();
    const m = now.getMinutes();
    const h = now.getHours() % 12;

    secondHand.style.transform = `translateX(-50%) rotate(${s * 6}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${m * 6 + s * 0.1}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${h * 30 + m * 0.5}deg)`;
  }

  setInterval(updateClock, 1000);
  updateClock();
  updateScore();
};
