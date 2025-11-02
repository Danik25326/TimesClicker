window.onload = function() {
  const clock = document.getElementById('clickableClock');
  const hourHand = document.querySelector('.hour');
  const minuteHand = document.querySelector('.minute');
  const secondHand = document.querySelector('.second');
  const clickBtn = document.getElementById('clickBtn');
  const scoreText = document.getElementById('score');

  let score = 0;

  // Оновлення годинника
  function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours() % 12; // 12-годинний формат

    const secDeg = seconds * 6;
    const minDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = hours * 30 + minutes * 0.5;

    secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
  }

  setInterval(updateClock, 1000);
  updateClock();

  // Клік по годиннику
  clock.addEventListener('click', () => {
    score++;
    scoreText.textContent = `Часу зібрано: ${score} сек`;

    // Ефект "зупинки"
    clock.style.borderColor = "#ec4899";
    clock.style.boxShadow = "0 0 50px #ec4899, 0 0 100px #ec4899";
    
    setTimeout(() => {
      clock.style.borderColor = "#0ea5e9";
      clock.style.boxShadow = 
        "0 0 30px #0ea5e9, 0 0 60px #0ea5e9, inset 0 0 30px rgba(14, 165, 233, 0.3)";
    }, 300);
  });

  // Клік по кнопці (альтернатива)
  clickBtn.addEventListener('click', () => {
    score++;
    scoreText.textContent = `Часу зібрано: ${score} сек`;
    clickBtn.textContent = '✅ Час піймано!';
    setTimeout(() => {
      clickBtn.textContent = '⏰ Клікни, щоб зупинити час!';
    }, 800);
  });
};
