/* =========================================================
   Sayantan Dhara — Portfolio interactions
   ========================================================= */

/* ---------- HERO BACKGROUND VIDEO: AUTOPLAY, AUTO SOUND, NO CONTROLS ---------- */
const bgVideo = document.getElementById('heroBgVideo');

let soundOn = false;

// Returns true once the video is confirmed playing with sound
function soundConfirmed(){
  return bgVideo && !bgVideo.muted && !bgVideo.paused && bgVideo.currentTime > 0;
}

// Attempt to play WITH sound. If the browser blocks it, keep the video playing muted.
function tryWithSound(){
  if(!bgVideo || soundOn) return;
  bgVideo.muted = false;
  bgVideo.volume = 1;
  const p = bgVideo.play();
  if(p && p.then){
    p.then(()=>{ if(!bgVideo.muted){ soundOn = true; removeAllListeners(); } })
     .catch(()=>{ bgVideo.muted = true; bgVideo.play().catch(()=>{}); }); // fallback: stay playing, muted
  }
}

// 1) On load: start the video, attempting sound immediately
if(bgVideo){
  bgVideo.muted = true;
  bgVideo.play().catch(()=>{});                 // guarantee it plays (muted)
  tryWithSound();                               // then immediately try to add sound
  bgVideo.addEventListener('loadeddata', tryWithSound, {once:true});
  bgVideo.addEventListener('canplay',    tryWithSound, {once:true});
}

// 2) Re-attempt sound on the FIRST of ANY signal — move, scroll, click, key, touch.
//    Listeners stay until sound is actually confirmed, so nothing gets removed too early.
const SOUND_EVENTS = ['pointerdown','pointermove','pointerover','mousemove','mousedown',
  'click','keydown','touchstart','touchend','scroll','wheel','focus'];
function onAnySignal(){ tryWithSound(); if(soundConfirmed()){ soundOn = true; removeAllListeners(); } }
function removeAllListeners(){ SOUND_EVENTS.forEach(ev=> window.removeEventListener(ev, onAnySignal)); }
SOUND_EVENTS.forEach(ev=> window.addEventListener(ev, onAnySignal, {passive:true}));

// 3) Also retry a few times in the first seconds (covers late media-permission grants)
let retries = 0;
const retryTimer = setInterval(()=>{
  if(soundOn || retries++ > 12){ clearInterval(retryTimer); return; }
  tryWithSound();
}, 400);

// 3) When the video finishes, auto-scroll down to the next section
let autoScrolled = false;
bgVideo?.addEventListener('ended', ()=>{
  if(autoScrolled) return;
  autoScrolled = true;
  document.getElementById('about')?.scrollIntoView({behavior:'smooth'});
});
// If the visitor scrolls on their own first, don't yank them later
window.addEventListener('wheel', ()=>{ autoScrolled = true; }, {passive:true, once:true});
window.addEventListener('touchmove', ()=>{ autoScrolled = true; }, {passive:true, once:true});

/* ---------- NAV ---------- */
const nav       = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle?.addEventListener('click', ()=>{
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});
navLinks?.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
}));

/* ---------- SCROLL: nav bg, progress bar, active link ---------- */
const progress = document.getElementById('scrollProgress');
const sections = [...document.querySelectorAll('section[id]')];
const links    = [...document.querySelectorAll('.nav-links a')];

function onScroll(){
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);

  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (y / h * 100) + '%';

  let current = sections[0]?.id;
  for(const s of sections){
    if(y >= s.offsetTop - window.innerHeight*0.35) current = s.id;
  }
  links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+current));
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

/* ---------- REVEAL ON SCROLL ---------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      // animate skill bars when their group reveals
      e.target.querySelectorAll?.('[data-bars]').forEach(b=>b.classList.add('run'));
      io.unobserve(e.target);
    }
  });
},{threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---------- TYPING EFFECT ---------- */
const typed = document.getElementById('typed');
const words = ['scalable web apps.','REST APIs.','quantum-secure systems.','automation pipelines.','full-stack products.'];
let wi=0, ci=0, deleting=false;
function type(){
  if(!typed) return;
  const w = words[wi];
  typed.textContent = deleting ? w.slice(0,--ci) : w.slice(0,++ci);
  let delay = deleting ? 45 : 85;
  if(!deleting && ci===w.length){ delay=1600; deleting=true; }
  else if(deleting && ci===0){ deleting=false; wi=(wi+1)%words.length; delay=350; }
  setTimeout(type, delay);
}
type();

/* ---------- COUNT-UP STATS ---------- */
const counters = document.querySelectorAll('.num');
const cio = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.target);
    const decimals = (el.dataset.target.split('.')[1]||'').length;
    let cur = 0;
    const step = target / 60;
    const tick = ()=>{
      cur += step;
      if(cur >= target){ el.textContent = target.toFixed(decimals); return; }
      el.textContent = cur.toFixed(decimals);
      requestAnimationFrame(tick);
    };
    tick();
    cio.unobserve(el);
  });
},{threshold:0.6});
counters.forEach(c=>cio.observe(c));

/* ---------- LIGHTBOX GALLERY ---------- */
const lb      = document.getElementById('lightbox');
const lbImg   = document.getElementById('lbImg');
const lbClose = document.getElementById('lbClose');
const lbPrev  = document.getElementById('lbPrev');
const lbNext  = document.getElementById('lbNext');
const zoomImgs = [...document.querySelectorAll('[data-zoom]')];
let lbIndex = 0;

function openLb(i){
  lbIndex = (i + zoomImgs.length) % zoomImgs.length;
  lbImg.src = zoomImgs[lbIndex].src;
  lbImg.alt = zoomImgs[lbIndex].alt;
  lb.classList.add('open');
  lb.setAttribute('aria-hidden','false');
}
function closeLb(){ lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); }

zoomImgs.forEach((img,i)=> img.addEventListener('click', ()=>openLb(i)) );
lbClose?.addEventListener('click', closeLb);
lbPrev?.addEventListener('click', e=>{ e.stopPropagation(); openLb(lbIndex-1); });
lbNext?.addEventListener('click', e=>{ e.stopPropagation(); openLb(lbIndex+1); });
lb?.addEventListener('click', e=>{ if(e.target === lb) closeLb(); });
document.addEventListener('keydown', e=>{
  if(!lb.classList.contains('open')) return;
  if(e.key === 'Escape') closeLb();
  if(e.key === 'ArrowLeft') openLb(lbIndex-1);
  if(e.key === 'ArrowRight') openLb(lbIndex+1);
});

/* ---------- TIMELINE: draw the connector line when in view ---------- */
const timelineEl = document.querySelector('.timeline');
if(timelineEl){
  const tlio = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ timelineEl.classList.add('lit'); tlio.disconnect(); } });
  },{threshold:0.2});
  tlio.observe(timelineEl);
}

/* ---------- INTERACTIVE 3D TILT (desktop only) ---------- */
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  const tiltEls = document.querySelectorAll('.mini-card,.project,.contact-card');
  tiltEls.forEach(el=>{
    el.style.transformStyle = 'preserve-3d';
    el.addEventListener('mousemove', e=>{
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width  - .5;
      const py = (e.clientY - r.top)  / r.height - .5;
      el.style.transform =
        `perspective(800px) rotateY(${px*9}deg) rotateX(${-py*9}deg) translateY(-8px) scale(1.015)`;
    });
    el.addEventListener('mouseleave', ()=>{ el.style.transform = ''; });
  });
}

/* ---------- CURSOR GLOW ---------- */
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', e=>{
  glow.style.left = e.clientX+'px';
  glow.style.top  = e.clientY+'px';
});

/* ---------- ANIMATED PARTICLE BACKGROUND ---------- */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W,H,dots;
function resize(){
  W = canvas.width  = innerWidth;
  H = canvas.height = innerHeight;
  const count = Math.min(90, Math.floor(W*H/22000));
  dots = Array.from({length:count}, ()=>({
    x:Math.random()*W, y:Math.random()*H,
    vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4
  }));
}
resize();
addEventListener('resize', resize);
function draw(){
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<dots.length;i++){
    const d=dots[i];
    d.x+=d.vx; d.y+=d.vy;
    if(d.x<0||d.x>W)d.vx*=-1;
    if(d.y<0||d.y>H)d.vy*=-1;
    ctx.beginPath();
    ctx.arc(d.x,d.y,1.5,0,Math.PI*2);
    ctx.fillStyle='rgba(124,92,255,.6)';
    ctx.fill();
    for(let j=i+1;j<dots.length;j++){
      const o=dots[j], dx=d.x-o.x, dy=d.y-o.y, dist=Math.hypot(dx,dy);
      if(dist<130){
        ctx.strokeStyle=`rgba(124,92,255,${(1-dist/130)*0.18})`;
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(d.x,d.y); ctx.lineTo(o.x,o.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(draw);
}
if(!matchMedia('(prefers-reduced-motion:reduce)').matches) draw();
