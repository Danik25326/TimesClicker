window.onload = function() {
  const clock = document.getElementById('clickableClock');
  const hourHand = document.querySelector('.hour');
  const minuteHand = document.querySelector('.minute');
  const secondHand = document.querySelector('.second');
  const clickBtn = document.getElementById('clickBtn');
  const scoreText = document.getElementById('score');

  let totalSeconds = 0;

  // === Ефект при кліку ===
  function boomEffect() {
    clock.style.scale = "1.05";
    setTimeout(() => (clock.style.scale = "1"), 100);
  }

  // === Форматування часу ===
  function formatTime(totalSeconds) {
    let seconds = totalSeconds;
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let hours = Math.floor(minutes / 60);
    minutes %= 60;

    let days = Math.floor(hours / 24);
    hours %= 24;

    let months = Math.floor(days / 30);
    days %= 30;

    let years = Math.floor(months / 12);
    months %= 12;

    // Формуємо рядок для відображення
    const parts = [];
    if (years > 0) parts.push(`${years} рік${years > 1 ? 'и' : ''}`);
    if (months > 0) parts.push(`${months} міс`);
    if (days > 0) parts.push(`${days} дн`);
    if (hours > 0) parts.push(`${hours} год`);
    if (minutes > 0) parts.push(`${minutes} хв`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} сек`);

    return parts.join(' ');
  }

  // === Оновлення тексту рахунку ===
  function updateScore() {
    scoreText.textContent = `Часу зібрано: ${formatTime(totalSeconds)}`;
  }

  // === Клік по годиннику ===
  clock.addEventListener('click', () => {
    totalSeconds++;
    updateScore();

    clock.style.borderColor = "#ec4899";
    clock.style.boxShadow = "0 0 50px #ec4899, 0 0 100px #ec4899";
    boomEffect();

    setTimeout(() => {
      clock.style.borderColor = "#0ea5e9";
      clock.style.boxShadow =
        "0 0 30px #0ea5e9, 0 0 60px #0ea5e9, inset 0 0 30px rgba(14, 165, 233, 0.3)";
    }, 300);
  });

  // === Клік по кнопці (рахує, але не заважає музиці) ===
  clickBtn.addEventListener('click', () => {
    totalSeconds++;
    updateScore();
    boomEffect();
  });

  // === ГОДИННИК ===
  function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12;

    const secDeg = seconds * 6;
    const minDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = hours * 30 + minutes * 0.5;

    secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
  }

  setInterval(updateClock, 1000);
  updateClock();

  // Початковий текст
  updateScore();
};
