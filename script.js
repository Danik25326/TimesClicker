/* TimesClicker — compact + extended features
   - keeps original behaviour (music, upgrades, reverb, stats)
   - adds skins, rapid-click bubble, toasts, progressive upgrades, button animations
*/
window.onload = function () {
  // DOM
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
  const clickGainEl = document.getElementById("clickGain");
  const cloudTotalEl = document.getElementById("cloudTotal");
  const nowPlaying = document.getElementById("nowPlaying");
  const realTimePlayedEl = document.getElementById("realTimePlayed");
  const virtualTimeEl = document.getElementById("virtualTime");
  const totalUpgradesEl = document.getElementById("totalUpgrades");
  const maxPerClickEl = document.getElementById("maxPerClick");
  const prestigeMultEl = document.getElementById("prestigeMult");
  const reverbBtn = document.getElementById("reverbBtn");
  const timeTunnel = document.getElementById("timeTunnel");
  const worldTitle = document.getElementById("worldTitle");
  const skinsRoot = document.getElementById("skins");
  const achRoot = document.getElementById("achievements");
  const clockWrapper = document.getElementById("clockWrapper");

  // State (core)
  let score = 0, clickPower = 1, autoRate = 0, isPlaying = false, currentTrack = 0;
  let sessionStart = Date.now(), totalUpgradesBought = 0, maxPerClick = 1, prestigeMultiplier = 1.0;
  let clickCloudTotal = 0;

  // Rapid-click buffer & bubble
  let clickBuffer = []; // timestamps ms
  let rapidActive = false;
  let rapidAccum = 0; // total gained during rapid session
  let rapidCount = 0; // number of clicks in current rapid session
  const RAPID_THRESHOLD = 10;      // minimum clicks to start accumulation
  const RAPID_WINDOW = 500;        // ms window to count (<= 500ms per request)
  const RAPID_IDLE = 500;          // ms idle to consider session finished
  const BUBBLE_MAX = 160;          // px max bubble size
  let lastClickTs = 0;
  let rapidTimeout = null;

  // Tracks
  const trackNames = ["Фонк №1","Фонк №2","Фонк №3","Фонк №4","Фонк №5","Фонк №6","Фонк №7"];
  const tracks = [
    "asphalt-menace.mp3",
    "digital-overdrive.mp3",
    "drift-phonk-phonk-music-2-434611.mp3",
    "drift-phonk-phonk-music-432222.mp3",
    "phonk-music-409064 (2).mp3",
    "phonk-music-phonk-2025-432208.mp3",
    "pixel-drift.mp3"
  ].map(x => `musicList/${x}`);

  function loadTrack(i){
    currentTrack = i % tracks.length;
    player.src = tracks[currentTrack];
    nowPlaying.textContent = `Зараз: ${trackNames[currentTrack]}`;
    if(isPlaying) player.play().catch(()=>{});
  }
  loadTrack(0);
  player.addEventListener("ended", ()=> loadTrack((currentTrack+1)%tracks.length));

  musicBtn.addEventListener("click", ()=>{
    if(!isPlaying){ isPlaying = true; player.volume = 0.45; player.play().catch(()=>{}); musicBtn.textContent = "⏸ Зупинити музику"; }
    else { isPlaying = false; player.pause(); musicBtn.textContent = "▶️ Включити музику"; }
  });
  prevTrack.addEventListener("click", ()=> loadTrack((currentTrack-1+tracks.length)%tracks.length));
  nextTrack.addEventListener("click", ()=> loadTrack((currentTrack+1)%tracks.length));

  // format seconds into human readable
  function formatTime(seconds){
    seconds = Math.floor(seconds);
    const units = [
      {name:"століття", value:60*60*24*365*100},
      {name:"десятиліття", value:60*60*24*365*10},
      {name:"рік", value:60*60*24*365},
      {name:"міс", value:60*60*24*30},
      {name:"дн", value:60*60*24},
      {name:"год", value:60*60},
      {name:"хв", value:60},
      {name:"сек", value:1},
    ];
    let rem = seconds, parts = [];
    for(const u of units){
      const amt = Math.floor(rem / u.value);
      if(amt>0){ parts.push(`${amt} ${u.name}`); rem %= u.value; }
    }
    return parts.length ? parts.join(" ") : `${seconds} сек`;
  }

  // Upgrades (kept same names & balance as original)
  const upgrades = [
    { name:"Кліпати очима", baseCost:1, type:"click", bonus:1, level:0, desc:"Кліп - мінус секунду швидко." },
    { name:"Включити телефон", baseCost:8, type:"auto", bonus:1, level:0, desc:"Телефон віднімає час автоматично." },
    { name:"Гортати стрічку новин", baseCost:25, type:"auto", bonus:3, level:0, desc:"Погладжування стрічки — пасивний втрачач часу." },
    { name:"Невеликий мем-тур", baseCost:90, type:"click", bonus:2, level:0, desc:"Клік дає більше втрат." },
    { name:"Автоперегортання", baseCost:450, type:"auto", bonus:10, level:0, desc:"Серйозна автоматизація." },
    { name:"Придбати підписку", baseCost:2400, type:"auto", bonus:30, level:0, desc:"Всі підписки крадуть час." },
    { name:"Серіал-марафон", baseCost:15000, type:"auto", bonus:120, level:0, desc:"Великий пасив." },
    { name:"Проєкт із затримкою", baseCost:120000, type:"click", bonus:50, level:0, desc:"Коли клікаєш, втрачається дуже багато." },
    { name:"Життєвий крінж", baseCost:800000, type:"auto", bonus:500, level:0, desc:"Топовий авто-витрачальник." },
  ];

  // Render upgrades with progressive reveal
  const buttons = [];
  upgrades.forEach((up, idx) => {
    const btn = document.createElement("button");
    btn.className = "upgrade-btn hidden";
    btn.addEventListener("click", ()=> buyUpgrade(idx));
    upgradesContainer.appendChild(btn);
    buttons.push(btn);
    up.getCost = ()=> Math.floor(up.baseCost * Math.pow(1.15, up.level));
    up.update = ()=> {
      const cost = up.getCost();
      btn.textContent = `${up.name} (Lv.${up.level}) — ${formatTime(cost)}`;
      btn.disabled = score < cost;
    };
    up.update();
  });
  if(buttons[0]) buttons[0].classList.remove("hidden"); // reveal first

  function revealNext(i){ if(buttons[i+1]) buttons[i+1].classList.remove("hidden"); }
  function buyUpgrade(i){
    const up = upgrades[i]; const cost = up.getCost();
    if(score < cost) return;
    score -= cost; up.level++; totalUpgradesBought++;
    if(up.type==="click"){ clickPower += Math.round(up.bonus * prestigeMultiplier); if(clickPower>maxPerClick) maxPerClick = clickPower; }
    else { autoRate += Math.round(up.bonus * prestigeMultiplier); }
    up.update(); revealNext(i); updateAllButtons(); updateScore(); updateStats();
    // achievement: first purchase
    if(totalUpgradesBought===1) grantAchievement("ach3");
  }
  function updateAllButtons(){
    upgrades.forEach((up, idx)=>{ up.update(); if(!buttons[idx].classList.contains("hidden")) buttons[idx].disabled = score < up.getCost(); });
  }

  // Score / Stats UI
  function updateScore(){
    scoreText.textContent = `Часу витрачено: ${formatTime(score)}`;
    cloudTotalEl.textContent = `${formatTime(clickCloudTotal)}`;
    updateAllButtons();
  }
  function updateStats(){
    realTimePlayedEl.textContent = formatTime((Date.now()-sessionStart)/1000);
    virtualTimeEl.textContent = formatTime(score);
    totalUpgradesEl.textContent = totalUpgradesBought;
    maxPerClickEl.textContent = `${formatTime(maxPerClick)}`;
    prestigeMultEl.textContent = `${prestigeMultiplier.toFixed(2)}×`;
  }

  // Click animation skins (5)
  const clickSkins = [
    {id:"flash-red", fn:()=> clock.classList.add("anim-flash-red")},
    {id:"bolt-blue", fn:()=> clock.classList.add("anim-bolt-blue")},
    {id:"glitch", fn:()=> clock.classList.add("anim-glitch")},
    {id:"blackhole", fn:()=> clock.classList.add("anim-blackhole")},
    {id:"ripple", fn:()=> clock.classList.add("anim-ripple")}
  ];
  let currentClickSkin = 0;
  function triggerClockAnimation(){
    // remove all anim classes then add selected briefly
    clickSkins.forEach(s => clock.classList.remove(s.id, "anim-flash-red","anim-bolt-blue","anim-glitch","anim-blackhole","anim-ripple"));
    const skin = clickSkins[currentClickSkin];
    if(skin) skin.fn();
    setTimeout(()=> {
      clickSkins.forEach(s => clock.classList.remove(s.id, "anim-flash-red","anim-bolt-blue","anim-glitch","anim-blackhole","anim-ripple"));
    }, 420);
  }

  // Floating + bubble logic
  function showFloating(text){
    const el = document.createElement("div");
    el.className = "floating-gain";
    el.textContent = text;
    clockWrapper.appendChild(el);
    requestAnimationFrame(()=> { el.style.transform = "translateY(-40px)"; el.style.opacity = "0"; });
    setTimeout(()=> el.remove(), 900);
  }

  // Bubble element (for rapid click)
  let bubble = document.createElement("div");
  bubble.className = "rapid-bubble hidden";
  clockWrapper.appendChild(bubble);
  function updateBubbleVisual(sizePx, text){
    bubble.style.width = bubble.style.height = sizePx + "px";
    bubble.textContent = text || "";
  }
  function showBubble(){ bubble.classList.remove("hidden"); }
  function hideBubble(){ bubble.classList.add("hidden"); updateBubbleVisual(8,""); }

  // Add time on click (normal)
  function addTime(){
    const gained = Math.round(clickPower);
    score += gained;
    clickCloudTotal += gained;
    clickGainEl.textContent = `+${formatTime(gained)}`;
    showFloating(`+${formatTime(gained)}`);
    triggerClockAnimation();
    if(gained > maxPerClick) maxPerClick = gained;
    updateScore(); updateStats();
    lastClickTs = Date.now();
    handleRapidClick(); // track for rapid combo
    // achievement: first click
    if(clickCloudTotal >= 1) grantAchievement("ach1");
  }
  clock.addEventListener("click", addTime);

  // Rapid-click detection & accumulation logic
  function handleRapidClick(){
    const now = Date.now();
    clickBuffer.push(now);
    // keep only those within RAPID_WINDOW
    clickBuffer = clickBuffer.filter(t => now - t <= RAPID_WINDOW);
    // if threshold reached, start accumulation
    if(clickBuffer.length >= RAPID_THRESHOLD){
      if(!rapidActive){
        rapidActive = true;
        rapidAccum = 0;
        rapidCount = 0;
        showBubble();
      }
      // accumulate: each click adds clickPower (rounded)
      rapidAccum += clickPower;
      rapidCount++;
      // compute bubble size by rapidCount, capped
      const size = Math.min(BUBBLE_MAX, 24 + rapidCount * 8);
      updateBubbleVisual(size, `+${formatTime(rapidAccum)}`);
    }

    // reset idle timer
    if(rapidTimeout) clearTimeout(rapidTimeout);
    rapidTimeout = setTimeout(()=> finalizeRapid(now), RAPID_IDLE);
  }

  function finalizeRapid(ts){
    // if we were in rapid mode -> pop bubble
    if(rapidActive){
      // pop animation (we'll briefly show a "popped" class)
      bubble.classList.add("popped");
      setTimeout(()=> bubble.classList.remove("popped"), 260);
      // show floating summary
      showFloating(`Витрачено: ${formatTime(rapidAccum)}`);
      // keep the rapidAccum already added to score & clickCloudTotal (we added on each click)
      // grant an achievement if big combo
      if(rapidAccum >= 100) grantAchievement("ach2"); // example: 100 сек
      // reset
      rapidActive = false;
      rapidAccum = 0;
      rapidCount = 0;
      setTimeout(()=> hideBubble(), 260);
    }
    clickBuffer = [];
  }

  // Auto tick
  setInterval(()=> {
    const gained = Math.round(autoRate);
    if(gained>0){ score += gained; clickCloudTotal += gained; updateScore(); updateStats(); }
    updateStats();
  }, 1000);

  // Clock hands real time (smooth)
  function updateClockHands(){
    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds()/1000;
    const m = now.getMinutes() + s/60;
    const h = now.getHours()%12 + m/60;
    if(secondHand) secondHand.style.transform = `translateX(-50%) rotate(${s*6}deg)`;
    if(minuteHand) minuteHand.style.transform = `translateX(-50%) rotate(${m*6}deg)`;
    if(hourHand) hourHand.style.transform = `translateX(-50%) rotate(${h*30}deg)`;
    requestAnimationFrame(updateClockHands);
  }
  updateClockHands();

  // Skins (clock border / glow), hands skins, shape skins
  const clockSkins = [
    {name:"Неон синій", apply: ()=> { clock.style.borderColor="#0ea5e9"; clock.style.boxShadow="0 0 30px #0ea5e9"; }},
    {name:"Пурпурний", apply: ()=> { clock.style.borderColor="#8b5cf6"; clock.style.boxShadow="0 0 30px #8b5cf6"; }},
    {name:"Рожевий", apply: ()=> { clock.style.borderColor="#ec4899"; clock.style.boxShadow="0 0 30px #ec4899"; }},
    {name:"Чорний мінімал", apply: ()=> { clock.style.borderColor="#222"; clock.style.boxShadow="none"; }},
  ];
  const handSkins = [
    {name:"Темно-сині", apply: ()=> { hourHand.style.background="#001f5f"; minuteHand.style.background="#001f5f"; }},
    {name:"Неон", apply: ()=> { hourHand.style.background="#0ea5e9"; minuteHand.style.background="#0ea5e9"; }},
    {name:"Піксельні", apply: ()=> { hourHand.style.background="#d1d1d1"; minuteHand.style.background="#d1d1d1"; }},
    {name:"Хром", apply: ()=> { hourHand.style.background="linear-gradient(180deg,#fff,#bbb)"; minuteHand.style.background="linear-gradient(180deg,#fff,#bbb)"; }},
    {name:"Прозорі", apply: ()=> { hourHand.style.background="rgba(255,255,255,0.06)"; minuteHand.style.background="rgba(255,255,255,0.06)"; }},
  ];

  // Render skins UI (simple — reuses #skins area)
  function renderSkins(){
    skinsRoot.innerHTML = "";
    clockSkins.forEach((s,i)=> {
      const el = document.createElement("div"); el.className="skin"; el.textContent = s.name;
      el.onclick = ()=> { clockSkins.forEach(()=>{}); s.apply(); Array.from(skinsRoot.children).forEach(c=>c.classList.remove("active")); el.classList.add("active"); };
      skinsRoot.appendChild(el);
      if(i===0) { el.classList.add("active"); s.apply(); }
    });
    // add click-anim skins selector + hand skins
    const header = document.createElement("h4"); header.textContent="Анімації кліку"; header.style.marginTop="10px";
    skinsRoot.appendChild(header);
    clickSkins.forEach((s,i)=> {
      const el = document.createElement("div"); el.className="skin"; el.textContent = `Анім ${i+1}`; el.onclick = ()=> { currentClickSkin = i; Array.from(skinsRoot.querySelectorAll(".skin")).forEach(c=>c.classList.remove("sel")); el.classList.add("sel"); };
      skinsRoot.appendChild(el);
      if(i===0) el.classList.add("sel");
    });
    const header2 = document.createElement("h4"); header2.textContent="Стрілки"; header2.style.marginTop="10px";
    skinsRoot.appendChild(header2);
    handSkins.forEach((s,i)=>{
      const el = document.createElement("div"); el.className="skin"; el.textContent = s.name; el.onclick = ()=> { s.apply(); Array.from(skinsRoot.querySelectorAll(".skin")).forEach(c=>c.classList.remove("sel2")); el.classList.add("sel2"); };
      skinsRoot.appendChild(el);
      if(i===0) { el.classList.add("sel2"); s.apply(); }
    });
  }
  renderSkins();

  // Achievements + toasts
  const achievementsList = [
    {id:"ach1", title:"Перший клік", desc:"Зробити перший клік", check: ()=> clickCloudTotal >= 1},
    {id:"ach2", title:"100 сек", desc:"Витратити 100 сек", check: ()=> clickCloudTotal >= 100},
    {id:"ach3", title:"Перша покупка", desc:"Купити перший апгрейд", check: ()=> totalUpgradesBought >= 1},
    {id:"ach4", title:"Авто запущено", desc:"Маєш autoRate > 0", check: ()=> autoRate > 0},
  ];
  achievementsList.forEach(a=>{
    const el = document.createElement("div"); el.className="achievement"; el.id=a.id;
    el.innerHTML = `<strong>${a.title}</strong><div style="font-size:12px;color:#bcd">${a.desc}</div><div class="ach-state" style="margin-top:8px;color:#ffd">Стан: Чекає</div><div class="progress" data-target="0"></div>`;
    achRoot.appendChild(el);
  });

  function updateAchievements(){
    achievementsList.forEach(a=>{
      const el = document.getElementById(a.id);
      const state = el.querySelector(".ach-state");
      if(a.check()){ state.textContent = "Пройдено ✅"; state.style.color = "#8df299"; }
      else { state.textContent = "Чекає"; state.style.color = "#ffd"; }
      // example progress: set data-target for display (simple)
      const prog = el.querySelector(".progress");
      if(a.id==="ach2"){ // example progress: toward 100
        const cur = Math.min(100, Math.floor(clickCloudTotal));
        prog.textContent = `Прогрес: ${cur}/100 сек`;
      } else prog.textContent = "";
    });
  }

  // Toast system (bottom)
  const toastRoot = document.createElement("div");
  toastRoot.id = "toastRoot";
  document.body.appendChild(toastRoot);
  function showToast(text, duration=3000){
    const t = document.createElement("div"); t.className = "toast"; t.textContent = text;
    toastRoot.appendChild(t);
    requestAnimationFrame(()=> t.classList.add("visible"));
    setTimeout(()=> { t.classList.remove("visible"); setTimeout(()=> t.remove(), 300); }, duration);
  }

  // Grant achievement (id) and show toast
  const achieved = new Set();
  function grantAchievement(id){
    if(achieved.has(id)) return;
    achieved.add(id);
    const a = achievementsList.find(x=>x.id===id);
    if(a) showToast(`Ви отримали досягнення: ${a.title}`, 3500);
    updateAchievements();
  }

  // Reverb (prestige)
  reverbBtn.addEventListener("click", ()=>{
    timeTunnel.classList.add("active");
    setTimeout(()=> {
      timeTunnel.classList.remove("active");
      prestigeMultiplier *= 1.2;
      score = 0; clickPower = 1; autoRate = 0; totalUpgradesBought = 0; maxPerClick = 1;
      upgrades.forEach((u, idx)=> { u.level = 0; if(buttons[idx]) buttons[idx].classList.add("hidden"); if(idx===0 && buttons[0]) buttons[0].classList.remove("hidden"); u.update(); });
      updateScore(); updateStats(); updateAchievements();
      showToast(`Реверб завершено. Новий множник: ${prestigeMultiplier.toFixed(2)}×`, 3500);
    }, 1100);
  });

  // Tabs switching
  document.querySelectorAll(".tab").forEach(btn=>{
    btn.addEventListener("click", ()=> {
      document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".tab-page").forEach(p=>p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // Prevent Enter in title & append "Time" on blur
  if(worldTitle){
    worldTitle.addEventListener("keydown", (e)=>{ if(e.key==="Enter") e.preventDefault(); });
    worldTitle.addEventListener("blur", ()=>{ let t = worldTitle.textContent.trim(); if(!t) worldTitle.textContent = "Times Clicker"; else if(!/(\bTime)$/i.test(t)) worldTitle.textContent = `${t} Time`; });
  }

  // Button hover/active animations (simple: add classes on hover via JS to ensure effect)
  [musicBtn, prevTrack, nextTrack].forEach(b=>{
    b.addEventListener("mouseenter", ()=> b.classList.add("btn-hover"));
    b.addEventListener("mouseleave", ()=> b.classList.remove("btn-hover"));
    b.addEventListener("mousedown", ()=> b.classList.add("btn-active"));
    b.addEventListener("mouseup", ()=> b.classList.remove("btn-active"));
  });

  // periodic UI updates
  setInterval(()=>{ updateScore(); updateStats(); updateAchievements(); }, 1000);

  // initial UI refresh
  updateScore(); updateStats(); updateAchievements();
};
