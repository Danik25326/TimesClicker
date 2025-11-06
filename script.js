window.onload = function() {
  // ===== Основні елементи =====
  const clock = document.getElementById('clickableClock');
  const hourHand = document.querySelector('.hour');
  const minuteHand = document.querySelector('.minute');
  const secondHand = document.querySelector('.second');
  const clickBtn = document.getElementById('clickBtn');
  const musicBtn = document.getElementById('musicBtn');
  const phonk = document.getElementById('phonk');
  const scoreText = document.getElementById('score');
  const upgradesContainer = document.getElementById('upgrades');

  // ===== Ігрові змінні =====
  let score = parseFloat(localStorage.getItem('score')) || 0;
  let clickPower = parseFloat(localStorage.getItem('clickPower')) || 1;
  let autoGain = parseFloat(localStorage.getItem('autoGain')) || 0;
  let gameTimeOffset = 0; // бонусний час від кліків

  // ===== Збереження прогресу =====
  function saveProgress() {
    localStorage.setItem('score', score);
    localStorage.setItem('clickPower', clickPower);
    localStorage.setItem('autoGain', autoGain);
  }

  // ===== Форматування часу =====
  function formatTime(totalSeconds) {
    if (totalSeconds < 60) return `${totalSeconds} сек`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} хв ${seconds} сек`;
  }

  // ===== Синхронізований годинник =====
  function updateClock() {
    const now = new Date();
    const virtualTime = new Date(now.getTime() + gameTimeOffset * 1000);

    const ms = virtualTime.getMilliseconds();
    const sec = virtualTime.getSeconds() + ms / 1000;
    const min = virtualTime.getMinutes() + sec / 60;
    const hour = (virtualTime.getHours() % 12) + min / 60;

    const secondsDeg = sec * 6;   // 360/60
    const minutesDeg = min * 6;
    const hoursDeg = hour * 30;   // 360/12

    secondHand.style.transform = `translateX(-50%) rotate(${secondsDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minutesDeg}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hoursDeg}deg)`;

    requestAnimationFrame(updateClock);
  }
  requestAnimationFrame(updateClock);

  // ===== Клік по годиннику =====
  clock.addEventListener("click", () => {
    score += clickPower;
    gameTimeOffset += clickPower; // додаємо "прискорений" час
    scoreText.textContent = `Часу зібрано: ${formatTime(Math.floor(score))}`;
    saveProgress();
    clockClickAnimation();
  });

  // ===== Автогенерація =====
  setInterval(() => {
    if (autoGain > 0) {
      score += autoGain;
      scoreText.textContent = `Часу зібрано: ${formatTime(Math.floor(score))}`;
      saveProgress();
    }
  }, 1000);

  // ===== Візуальна анімація кліку =====
  function clockClickAnimation() {
    clock.classList.add("clicked");
    setTimeout(() => clock.classList.remove("clicked"), 150);
  }

  // ===== Кнопка "Зупинити фонк" =====
  let musicPlaying = false;
  musicBtn.addEventListener("click", () => {
    if (!musicPlaying) {
      phonk.play();
      musicBtn.textContent = "⏸ Зупинити фонк";
    } else {
      phonk.pause();
      musicBtn.textContent = "▶ Включити фонк";
    }
    musicPlaying = !musicPlaying;
  });

  // ===== Ініціалізація =====
  scoreText.textContent = `Часу зібрано: ${formatTime(Math.floor(score))}`;
};
