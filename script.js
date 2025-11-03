window.onload = function() {
  const clock = document.getElementById('clickableClock');
  const hourHand = document.querySelector('.hour');
  const minuteHand = document.querySelector('.minute');
  const secondHand = document.querySelector('.second');
  const clickBtn = document.getElementById('clickBtn');
  const scoreText = document.getElementById('score');
  const upgradesContainer = document.getElementById('upgrades');

  let score = 0;
  let clickPower = 1;

  const upgrades = [
    { name: "📱 Включити телефон", cost: 10, bonus: 1 },
    { name: "☕ Зробити каву", cost: 100, bonus: 2 },
    { name: "💻 Увімкнути ноут", cost: 1000, bonus: 3 },
    { name: "🎧 Надіти навушники", cost: 10000, bonus: 4 },
    { name: "💪 Почати тренування", cost: 100000, bonus: 5 },
    { name: "📚 Відкрити книгу", cost: 1000000, bonus: 6 },
    { name: "🌇 Вийти на прогулянку", cost: 10000000, bonus: 7 },
    { name: "🚀 Почати проєкт", cost: 100000000, bonus: 8 },
    { name: "🧠 Медитувати над сенсом часу", cost: 1000000000, bonus: 9 },
    { name: "⏳ Стати володарем часу", cost: 10000000000, bonus: 10 },
  ];

  upgrades.forEach(upgrade => {
    const btn = document.createElement('button');
    btn.textContent = `${upgrade.name} — ${upgrade.cost.toLocaleString()} сек`;
    btn.className = 'upgrade-btn';
    btn.disabled = true;

    btn.addEventListener('click', () => {
      if (score >= upgrade.cost) {
        score -= upgrade.cost;
        clickPower += upgrade.bonus;
        updateScore();
        btn.remove(); // ← видаляємо кнопку після покупки
        updateButtons();
      }
    });

    upgradesContainer.appendChild(btn);
    upgrade.element = btn;
  });

  function updateScore() {
    scoreText.textContent = `Часу зібрано: ${score.toLocaleString()} сек`;
  }

  function updateButtons() {
    upgrades.forEach(upg => {
      if (upg.element && score >= upg.cost) {
        upg.element.disabled = false;
      } else if (upg.element) {
        upg.element.disabled = true;
      }
    });
  }

  function boomEffect() {
    clock.style.scale = "1.05";
    setTimeout(() => (clock.style.scale = "1"), 100);
  }

  function addTime() {
    score += clickPower;
    updateScore();
    updateButtons();

    clock.style.borderColor = "#ec4899";
    clock.style.boxShadow = "0 0 50px #ec4899, 0 0 100px #ec4899";
    boomEffect();

    setTimeout(() => {
      clock.style.borderColor = "#0ea5e9";
      clock.style.boxShadow =
        "0 0 30px #0ea5e9, 0 0 60px #0ea5e9, inset 0 0 30px rgba(14, 165, 233, 0.3)";
    }, 300);
  }

  clock.addEventListener('click', addTime);
  clickBtn.addEventListener('click', addTime);

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
