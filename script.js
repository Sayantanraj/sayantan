/* =========================================================
   Sayantan Dhara — Portfolio interactions
   ========================================================= */

/* ---------- PRELOADER (buffers the hero video, then reveals) ---------- */
(function(){
  const pre  = document.getElementById('preloader');
  const bar  = document.getElementById('plBar');
  const pct  = document.getElementById('plPct');
  if(!pre) return;
  document.documentElement.style.overflow = 'hidden';   // lock scroll while loading

  const video = document.getElementById('heroBgVideo');
  let pageLoaded = false, videoReady = false, done = false, prog = 0;

  // start buffering the video immediately
  if(video){
    try{ video.load(); }catch(e){}
    if(video.readyState >= 4) videoReady = true;          // HAVE_ENOUGH_DATA
    video.addEventListener('canplaythrough', ()=>{ videoReady = true; }, {once:true});
    // some browsers settle on canplay — accept that too after buffering
    video.addEventListener('canplay', ()=>{ if(video.readyState >= 3) videoReady = true; }, {once:true});
  } else { videoReady = true; }
  window.addEventListener('load', ()=>{ pageLoaded = true; });

  function bufferedPct(){
    try{
      if(video && video.duration && video.buffered.length){
        return (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
      }
    }catch(e){}
    return 0;
  }
  function paint(p){ p = Math.min(100, Math.round(p)); if(bar) bar.style.width = p + '%'; if(pct) pct.textContent = p + '%'; }

  const tick = setInterval(()=>{
    if(done) return;
    prog += Math.max(0.4, (70 - prog) * 0.04);            // baseline crawl to 70%
    if(prog > 70) prog = 70;
    paint(Math.max(prog, bufferedPct()));                  // show REAL video buffering
  }, 100);

  function finish(){
    if(done) return; done = true;
    clearInterval(tick);
    paint(100);
    setTimeout(()=>{ pre.classList.add('loaded'); document.documentElement.style.overflow = ''; }, 450);
    setTimeout(()=>{ pre.remove(); }, 1350);
  }

  // reveal only when the page AND the video are ready (so play is instant) — min 1s
  setTimeout(function waitReady(){
    if(done) return;
    if(pageLoaded && videoReady) finish();
    else setTimeout(waitReady, 150);
  }, 1000);
  setTimeout(finish, 12000);                               // hard safety cap (slow connections)
})();

/* ---------- HERO VIDEO: PLAY BUTTON → PLAYS WITH SOUND ---------- */
const bgVideo  = document.getElementById('heroBgVideo');
const playBtn  = document.getElementById('playBtn');
const playHint = document.getElementById('playHint');

// The video does NOT autoplay. Clicking the play button is a real user gesture,
// so the browser allows it to start WITH sound — no other controls needed.
function startWithSound(){
  if(!bgVideo) return;
  bgVideo.muted = false;
  bgVideo.volume = 1;
  try{ bgVideo.currentTime = 0; }catch(e){}
  bgVideo.play().catch(()=>{});
  playBtn?.classList.add('hidden');
  playHint?.classList.add('hidden');
}
playBtn?.addEventListener('click', startWithSound);

// When the video finishes, auto-scroll down to the next section
let autoScrolled = false;
bgVideo?.addEventListener('ended', ()=>{
  if(autoScrolled) return;
  autoScrolled = true;
  document.getElementById('about')?.scrollIntoView({behavior:'smooth'});
});

/* ---------- MOBILE: move Skills + tech marquee to just before Contact ---------- */
(function(){
  const about   = document.getElementById('about');
  const skills  = document.getElementById('skills');
  const patent  = document.getElementById('patent');
  const marquee = document.querySelector('.marquee');
  const contact = document.getElementById('contact');
  if(!contact) return;
  const mq = matchMedia('(max-width:768px)');
  function place(e){
    if(e.matches){
      // mobile → Skills, then the marquee, right before Contact
      if(skills)  contact.parentNode.insertBefore(skills, contact);
      if(marquee) contact.parentNode.insertBefore(marquee, contact);
    }else{
      // desktop → restore original order: About → Skills → Marquee → Patent
      if(about && skills)   about.insertAdjacentElement('afterend', skills);
      if(patent && marquee) patent.insertAdjacentElement('beforebegin', marquee);
    }
  }
  place(mq);
  mq.addEventListener ? mq.addEventListener('change', place) : mq.addListener(place);
})();

/* ---------- MOBILE: keep section serial numbers sequential ---------- */
(function(){
  const DASH = ' — ';
  const map = [
    {sel:'#about .section-head .tag',       label:'About',                 d:'01', m:'01'},
    {sel:'#patent .patent-head .tag',       label:'Intellectual Property', d:'03', m:'02'},
    {sel:'#achievement .section-head .tag', label:'Achievement',           d:'04', m:'03'},
    {sel:'#projects .section-head .tag',    label:'Projects',              d:'05', m:'04'},
    {sel:'#experience .section-head .tag',  label:'Journey',               d:'06', m:'05'},
    {sel:'#skills .section-head .tag',      label:'Skills',                d:'02', m:'06'},
    {sel:'#contact .section-head .tag',     label:'Contact',               d:'07', m:'07'},
  ];
  const mqn = matchMedia('(max-width:768px)');
  function setNums(e){
    map.forEach(t=>{
      const el = document.querySelector(t.sel);
      if(el) el.textContent = (e.matches ? t.m : t.d) + DASH + t.label;
    });
  }
  setNums(mqn);
  mqn.addEventListener ? mqn.addEventListener('change', setNums) : mqn.addListener(setNums);
})();

/* ---------- PATENT DETAILS POPUP (mobile) ---------- */
const patentMore  = document.getElementById('patentMore');
const patentModal = document.getElementById('patentModal');
const pmClose     = document.getElementById('pmClose');
function openPatent(){ patentModal?.classList.add('open'); patentModal?.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
function closePatent(){ patentModal?.classList.remove('open'); patentModal?.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
patentMore?.addEventListener('click', openPatent);
pmClose?.addEventListener('click', closePatent);
patentModal?.addEventListener('click', e=>{ if(e.target === patentModal) closePatent(); });
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && patentModal?.classList.contains('open')) closePatent(); });

/* ---------- INLINE "SEE MORE" TOGGLES (mobile) ---------- */
function wireSeeMore(btnId, targetSel, moreLabel = 'See more ', lessLabel = 'See less '){
  const btn = document.getElementById(btnId);
  const target = document.querySelector(targetSel);
  if(!btn || !target) return;
  btn.addEventListener('click', ()=>{
    const ex = target.classList.toggle('expanded');
    btn.setAttribute('aria-expanded', ex ? 'true' : 'false');
    btn.childNodes[0].nodeValue = ex ? lessLabel : moreLabel;
  });
}
wireSeeMore('aboutSeeMore', '#about .about-grid');
wireSeeMore('achSeeMore',   '#achievement .ach-card');
wireSeeMore('projSeeMore',  '#projects .project-featured', 'See more about this project ', 'Show less ');

/* ---------- CONTACT FORM ---------- */
const contactForm = document.getElementById('contactForm');
const cfStatus = document.getElementById('cfStatus');
const cfSubmit = document.getElementById('cfSubmit');
contactForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(contactForm).entries());
  // basic validation
  if(!data.name || !data.email || !data.message){
    cfStatus.className = 'cf-status err';
    cfStatus.textContent = '✕ Please fill in your name, email and message.';
    return;
  }
  cfSubmit.disabled = true;
  cfSubmit.textContent = 'Sending…';
  cfStatus.className = 'cf-status';
  cfStatus.textContent = '';
  try{
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(()=>({}));
    if(res.ok && json.ok){
      cfStatus.className = 'cf-status ok';
      cfStatus.textContent = '✓ Message sent! A confirmation email is on its way to you.';
      contactForm.reset();
    } else if(res.status === 404 || res.status === 405){
      throw new Error('The contact form only works on the live deployed site (Vercel), not when opened locally.');
    } else {
      throw new Error(json.error || 'Something went wrong. Please try again.');
    }
  }catch(err){
    cfStatus.className = 'cf-status err';
    cfStatus.textContent = '✕ ' + (err.message || 'Could not send. Please try again later.');
  }finally{
    cfSubmit.disabled = false;
    cfSubmit.textContent = 'Send Message';
  }
});

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

// patent popup image → bring the picture to front (full-screen) on click
const pmImg = document.querySelector('#patentModal .pm-img');
pmImg?.addEventListener('click', ()=>{
  lbImg.src = pmImg.src;
  lbImg.alt = pmImg.alt;
  lb.classList.add('open');
  lb.setAttribute('aria-hidden','false');
});

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
