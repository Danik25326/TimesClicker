window.onload = function () {
  // Elements
  const clock = document.getElementById("clickableClock");
  const hourHand = document.querySelector(".hour");
  const minuteHand = document.querySelector(".minute");
  const secondHand = document.querySelector(".second");
  const scoreText = document.getElementById("score");
  const upgradesContainer = document.getElementById("upgrades");
  const comboBubble = document.getElementById("comboBubble");
  const bubbleContainer = document.getElementById("bubbleContainer");
  const player = document.getElementById("player");
  const musicBtn = document.getElementById("musicBtn");
  const prevTrack = document.getElementById("prevTrack");
  const nextTrack = document.getElementById("nextTrack");
  const currentTrackName = document.getElementById("currentTrackName");
  const toastArea = document.getElementById("toastArea");

  // Game vars
  let score = 0; // seconds lost (virtual)
  let clickPower = 1; // seconds per click
  let clickCountFast = 0; // for combo bubble
  let comboTimer = null;
  let lastClickTime = 0;
  let currentTrack = 0;
  let isPlaying = false;

  // Format time (reused)
  function formatTime(seconds) {
    const units = [
      { name: "століття", value: 60*60*24*365*100 },
      { name: "десятиліття", value: 60*60*24*365*10 },
      { name: "рік", value: 60*60*24*365 },
      { name: "міс", value: 60*60*24*30 },
      { name: "дн", value: 60*60*24 },
      { name: "год", value: 60*60 },
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

  // TRACKS
  const tracks = [
    "asphalt-menace.mp3",
    "digital-overdrive.mp3",
    "drift-phonk-phonk-music-2-434611.mp3",
    "drift-phonk-phonk-music-432222.mp3",
    "phonk-music-409064 (2).mp3",
    "phonk-music-phonk-2025-432208.mp3",
    "pixel-drift.mp3"
  ].map(n => `musicList/${n}`);

  function setTrackName(i){ currentTrackName.textContent = `Фонк №${i+1}`; }

  function loadTrack(i){
    player.src = tracks[i];
    setTrackName(i);
    if (isPlaying) {
      // play new immediately
      player.currentTime = 0;
      player.play().catch(()=>{});
    }
  }
  loadTrack(currentTrack);

  // Player controls
  musicBtn.addEventListener("click", () => {
    if (!isPlaying) {
      player.volume = 0.45;
      player.play().catch(()=>{});
      musicBtn.textContent = "⏸ Зупинити музику";
      isPlaying = true;
    } else {
      player.pause();
      musicBtn.textContent = "▶️ Включити музику";
      isPlaying = false;
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

  // Ensure loop
  player.addEventListener("ended", () => {
    player.currentTime = 0;
    player.play().catch(()=>{});
  });

  // UPGRADES — creative list tuned to 'time wasting'
  const upgrades = [
    { id:'blink', name:"Кліпати очима", baseCost:1, bonusClick:1, type:'click', level:0, desc:'+1 сек за клік' },
    { id:'phone', name:"Включити телефон", baseCost:5, bonusAuto:1, type:'auto', level:0, desc:'+1 сек кожні 5 сек' },
    { id:'scroll', name:"Листати стрічку", baseCost:20, bonusAuto:3, type:'auto', level:0, desc:'+3 сек / 5с' },
    { id:'ads', name:"Дивитися рекламу", baseCost:80, bonusClick:2, type:'click', level:0, desc:'+2 сек за клік' },
    { id:'notif', name:"Перевіряти нотифікації", baseCost:300, bonusAuto:10, type:'auto', level:0, desc:'+10 сек / 5с' },
    { id:'doomscroll', name:"Doomscrolling", baseCost:2000, bonusAuto:60, type:'auto', level:0, desc:'+60 сек / 5с' },
    { id:'project', name:"Почати мем-проєкт", baseCost:12000, bonusClick:10, type:'click', level:0, desc:'+10 сек за клік' },
    { id:'deepdiv', name:"Глибокий дайв в треди", baseCost:90000, bonusAuto:600, type:'auto', level:0, desc:'+600 сек / 5с' },
  ];

  const buttons = [];

  upgrades.forEach((u, idx) => {
    const btn = document.createElement("button");
    btn.className = "upgrade-btn hidden";
    upgradesContainer.appendChild(btn);
    buttons.push(btn);

    function updateText(){
      // cost scales exponentially a bit
      const cost = Math.floor(u.baseCost * Math.pow(3, u.level));
      btn.textContent = `${u.name} (Lv.${u.level}) — ${formatTime(cost)} — ${u.desc}`;
      btn.disabled = score < cost;
    }
    updateText();

    btn.addEventListener("click", () => {
      const cost = Math.floor(u.baseCost * Math.pow(3, u.level));
      if (score >= cost){
        score -= cost;
        u.level++;
        // apply effect
        if (u.bonusClick) clickPower += u.bonusClick;
        if (u.bonusAuto){
          // spawn automatic income every 5s (track via setInterval per upgrade level)
          // we'll store timers on u
          if (!u._interval) {
            u._interval = setInterval(() => {
              // seconds per tick equals bonusAuto * level
              const add = u.bonusAuto * u.level;
              score += add;
              updateScore();
            }, 5000);
          }
        }
        updateText();
        updateScore();
        revealNext(idx);
        showToast(`Куплено: ${u.name}`);
      }
    });

    u.update = updateText;
  });

  // Show first upgrade
  if (buttons[0]) buttons[0].classList.remove("hidden");

  function revealNext(i){
    if (buttons[i+1]) {
      buttons[i+1].classList.remove("hidden");
      upgrades[i+1].update?.();
    }
  }

  function updateScore(){
    scoreText.textContent = `Часу втрачено: ${formatTime(score)}`;
    buttons.forEach((b, idx) => {
      if (!b.classList.contains('hidden')){
        const u = upgrades[idx];
        const cost = Math.floor(u.baseCost * Math.pow(3, u.level));
        b.disabled = score < cost;
      }
    });
    // update stats tab if present
    const statVirtual = document.getElementById('statVirtual');
    if (statVirtual) statVirtual.textContent = formatTime(score);
  }

  // CLICK EFFECTS, BUBBLES, COMBO
  function spawnSmallBubble(text){
    const el = document.createElement('div');
    el.className = 'small-bubble';
    el.textContent = text;
    bubbleContainer.appendChild(el);
    setTimeout(()=> el.remove(), 900);
  }

  function updateComboBubble(){
    if (clickCountFast >= 3){
      comboBubble.classList.remove('hidden');
      comboBubble.textContent = clickCountFast;
      // scale with clicks but cap
      const s = Math.min(1 + clickCountFast/20, 1.8);
      comboBubble.style.transform = `scale(${s})`;
    } else {
      comboBubble.classList.add('hidden');
    }
  }

  // trigger clock animation — choose skin class from data attr
  let clickSkin = 'skin-red'; // default
  function triggerClockAnim(){
    if (!clock) return;
    clock.classList.remove('click-anim','skin-red','skin-blue','skin-glitch');
    void clock.offsetWidth;
    clock.classList.add('click-anim', clickSkin);
  }

  // main addTime on click
  function addTime() {
    const now = Date.now();
    const delta = now - lastClickTime;
    lastClickTime = now;

    score += clickPower;
    updateScore();

    spawnSmallBubble(`+${clickPower}`);

    // combo logic: rapid clicks within 450ms count
    if (delta < 450) {
      clickCountFast++;
    } else {
      // small pause — start new combo
      if (clickCountFast > 0) {
        // if there was a combo, pop it
        popCombo();
      }
      clickCountFast = 1;
    }
    updateComboBubble();

    // reset combo timer
    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(()=> {
      popCombo();
      clickCountFast = 0;
      updateComboBubble();
    }, 900);

    triggerClockAnim();
  }

  function popCombo(){
    if (clickCountFast <= 0) return;
    // show popup toast near bottom with count
    showToast(`Витрачено ${clickCountFast} кліків`, 2000);
    // small particle pop visual: spawn multiple small bubbles
    for (let i=0;i<Math.min(clickCountFast,12);i++){
      spawnSmallBubble('💥');
    }
  }

  if (clock) clock.addEventListener('click', addTime);

  // CLOCK visual update
  function updateClock(){
    const now = new Date();
    const s = now.getSeconds();
    const m = now.getMinutes();
    const h = now.getHours() % 12;

    if (secondHand) secondHand.style.transform = `translateX(-50%) rotate(${s*6}deg)`;
    if (minuteHand) minuteHand.style.transform = `translateX(-50%) rotate(${m*6 + s*0.1}deg)`;
    if (hourHand) hourHand.style.transform = `translateX(-50%) rotate(${h*30 + m*0.5}deg)`;
  }
  setInterval(updateClock,1000);
  updateClock();
  updateScore();

  // TOAST
  function showToast(text, ms=3000){
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    toastArea.appendChild(t);
    setTimeout(()=> {
      t.style.opacity = '0';
      setTimeout(()=> t.remove(),400);
    }, ms);
  }

  // Tabs simple logic
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(tc=>tc.classList.add('hidden'));
      document.getElementById(target+'Tab').classList.remove('hidden');
    });
  });

  // Populate skins lists (simple)
  const skins = ['skin-red','skin-blue','skin-glitch'];
  const skinsList = document.getElementById('skinsList');
  const handsList = document.getElementById('handsList');
  const caseList = document.getElementById('caseList');

  skins.forEach(s=>{
    const el = document.createElement('div');
    el.className='skin-item';
    el.textContent = s;
    el.addEventListener('click', ()=> {
      clickSkin = s; showToast(`Вибрано шкіна: ${s}`);
    });
    skinsList.appendChild(el);
  });

  ['dark-blue','neon','pixel'].forEach(h=>{
    const el = document.createElement('div');
    el.className='skin-item';
    el.textContent = h;
    el.addEventListener('click', ()=>{
      // simple mapping
      if (h==='dark-blue'){ document.querySelector('.hour').style.background='#063b7a'; document.querySelector('.minute').style.background='#0e61a8'; document.querySelector('.second').style.background='#0b2846'; }
      if (h==='neon'){ document.querySelector('.hour').style.background='#ffb86b'; document.querySelector('.minute').style.background='#ffd86b'; document.querySelector('.second').style.background='#ff6b9a'; }
      if (h==='pixel'){ document.querySelector('.hour').style.background='#111'; document.querySelector('.minute').style.background='#222'; document.querySelector('.second').style.background='#000'; }
      showToast(`Вибрано стиль стрілок: ${h}`);
    });
    handsList.appendChild(el);
  });

  ['classic','glass','tech'].forEach(c=>{
    const el = document.createElement('div');
    el.className='skin-item';
    el.textContent=c;
    el.addEventListener('click', ()=> {
      if (c==='classic'){ document.querySelector('.clock').style.borderRadius='14px'; document.querySelector('.clock').style.border='6px solid var(--neon)'; }
      if (c==='glass'){ document.querySelector('.clock').style.borderRadius='26px'; document.querySelector('.clock').style.border='4px solid rgba(255,255,255,0.06)'; }
      if (c==='tech'){ document.querySelector('.clock').style.borderRadius='8px'; document.querySelector('.clock').style.border='6px solid #8b5cf6'; }
      showToast(`Вибрано корпус: ${c}`);
    });
    caseList.appendChild(el);
  });

  // Small accessibility: keyboard space to click
  window.addEventListener('keydown', (e)=>{
    if (e.code==='Space') { e.preventDefault(); addTime(); }
  });

  // small touch: spawn +bubble visually on click creation
  // spawnSmallBubble used in addTime already

  // final: show initial toast
  showToast('Готово — оновлено V3', 1800);
};
