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
  const worldTitle = document.getElementById("worldTitle"); // contenteditable в index.html

  // Ігрові змінні
  let score = 0;
  let clickPower = 1;

  // --------------------------
  // Форматування часу для відображення
  // --------------------------
  function formatTime(seconds) {
    const units = [
      { name: "століття", value: 60 * 60 * 24 * 365 * 100 },
      { name: "десятиліття", value: 60 * 60 * 24 * 365 * 10 },
      { name: "рік", value: 60 * 60 * 24 * 365 },
      { name: "міс", value: 60 * 60 * 24 * 30 },
      { name: "дн", value: 60 * 60 * 24 },
      { name: "год", value: 60 * 60 },
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

  // --------------------------
  // Апгрейди (ціни зменшені)
  // --------------------------
  const upgrades = [
    { name: "📱 Включити телефон", baseCost: 12, bonus: 1, level: 0 },
    { name: "☕ Зробити каву", baseCost: 25, bonus: 2, level: 0 },
    { name: "💻 Увімкнути ноут", baseCost: 700, bonus: 3, level: 0 },
    { name: "🎧 Надіти навушники", baseCost: 2000, bonus: 4, level: 0 },
    { name: "💪 Почати тренування", baseCost: 20000, bonus: 5, level: 0 },
    { name: "📚 Відкрити книгу", baseCost: 200000, bonus: 6, level: 0 },
    { name: "🌇 Вийти на прогулянку", baseCost: 2000000, bonus: 7, level: 0 },
    { name: "🚀 Почати проєкт", baseCost: 20000000, bonus: 8, level: 0 },
    { name: "🧠 Медитувати над сенсом часу", baseCost: 200000000, bonus: 9, level: 0 },
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
      btn.disabled = score < cost; // візуально блокувати, якщо немає грошей
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

  // Показуємо тільки перший апгрейд спочатку
  if (buttons[0]) buttons[0].classList.remove("hidden");

  function revealNext(i) {
    if (buttons[i + 1]) {
      buttons[i + 1].classList.remove("hidden");
      // При відкритті оновлюємо текст/стан кнопки
      upgrades[i + 1].update?.();
    }
  }

  // --------------------------
  // Оновлення рахунку
  // --------------------------
  function updateScore() {
    scoreText.textContent = `Часу зібрано: ${formatTime(score)}`;
    // Оновимо стани кнопок апгрейдів (щоб вмикалися/вимикалися)
    buttons.forEach((b, idx) => {
      if (!b.classList.contains("hidden")) {
        const cost = upgrades[idx].baseCost * (upgrades[idx].level + 1);
        b.disabled = score < cost;
      }
    });
  }

  // --------------------------
  // Ефект кліку
  // --------------------------
function boomEffect() {
  // Анімація масштабу
  clock.classList.add("clicked");
  clock.style.scale = "1.05";

  setTimeout(() => {
    clock.style.scale = "1";
    clock.classList.remove("clicked");
  }, 150);
}


  function addTime() {
    score += clickPower;
    updateScore();
    boomEffect();
  }

  // Клік тільки по годиннику
  if (clock) clock.addEventListener("click", addTime);

  // --------------------------
  // Музика (фонк)
  // --------------------------
  if (musicBtn && phonk) {
    musicBtn.addEventListener("click", () => {
      if (phonk.paused) {
        // браузери дозволяють звук лише після дії користувача — клік по кнопці достатній
        try {
          phonk.volume = 0.4;
          phonk.play();
          musicBtn.textContent = "⏸ Зупинити фонк";
        } catch (e) {
          console.warn("Не вдалося запустити аудіо:", e);
        }
      } else {
        phonk.pause();
        musicBtn.textContent = "▶️ Включити фонк";
      }
    });
  }

  // --------------------------
  // Оновлення стрілок годинника
  // --------------------------
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

  // --------------------------
  // РЕДАГУВАННЯ НАЗВИ (ВАРІАНТ C)
  // Беремо весь введений текст і додаємо " Time" (один раз)
  // --------------------------
  if (worldTitle) {
    // Заборонити Enter
    worldTitle.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });

    worldTitle.addEventListener("blur", () => {
      let text = worldTitle.textContent.trim();

      if (text.length === 0) {
        worldTitle.textContent = "Times Time"; // якщо порожньо — дефолт
        return;
      }

      // Якщо користувач вже написав "Time" вкінці — не додаємо ще раз
      if (!/(\bTime)$/i.test(text)) {
        text = `${text} Time`;
      }
      worldTitle.textContent = text;
    });
  }
};
