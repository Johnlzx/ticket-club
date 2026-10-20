import './style.css';
import { PaperTicket, W, BODY, STUB, HOLES, pitch } from './paper.js';
import { qrSvg } from './qr.js';

const icons = {
  apple:'<path d="M16 12c0-3 2-4 2-4-1-2-3-2-4-2-2 0-3 1-4 1S8 6 6 6C3 6 1 9 1 12c0 4 3 9 5 9 1 0 2-1 4-1s2 1 4 1 4-4 5-6c-2-1-3-2-3-3ZM10 5c0-2 2-4 4-4 0 2-2 4-4 4Z"/>',
  arrow:'<path d="M5 19 19 5M5 5h14v14"/>',
  github:'<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.1-2-1-2 3 0 6-1 6-6a5 5 0 0 0-1-3c.2-1 .2-3 0-3-2 0-3 1-4 1a12 12 0 0 0-6 0C8 4 6 3 5 4c-.4 1-.2 2 0 3a5 5 0 0 0-1 3c0 5 3 6 6 6-1 0-1 1-1 2v4"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  chat:'<path d="M21 11c0 5-5 8-10 7l-5 3 1-5a8 8 0 1 1 14-5Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
  clipboard:'<path d="M9 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-3M9 2h6v5H9zM8 12h8M8 16h5"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  settings:'<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>',
  volume:'<path d="m4 9 4 0 5-5v16l-5-5H4zM17 8c3 2 3 6 0 8M20 5c5 4 5 10 0 14"/>',
  mute:'<path d="m4 9 4 0 5-5v16l-5-5H4zM17 9l6 6m0-6-6 6"/>',
  refresh:'<path d="M20 8a9 9 0 1 0 0 8M20 3v5h-5"/>',
  wifi:'<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M9 16a5 5 0 0 1 6 0M12 20h.01"/>',
  search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  folder:'<path d="M3 7h7l2-3h9v16H3z"/>',
  trash:'<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  play:'<path d="m9 5 11 7-11 7z"/>',
};
const icon = (name, cls='') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.arrow}</svg>`;
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const defaults = { name:'Zhongxin', website:'https://example.com', github:'https://github.com/yourname/your-project', wechat:'your-wechat-id' };
let profile;
try { profile = {...defaults, ...JSON.parse(localStorage.getItem('ticket-club-profile') || '{}')}; } catch { profile = {...defaults}; }
let history = [];
try { history = JSON.parse(sessionStorage.getItem('ticket-club-history') || '[]'); } catch {}
let soundOn = localStorage.getItem('ticket-club-sound') === 'on';
let audio;
let opened = true;
let active = 1;
let papers = [];
let toastTimer;

const specs = [
  { key:'website', n:'01', label:'THE WEBSITE', title:['A LITTLE','ABOUT ME.'], subtitle:'A home for ideas & things I make.', foot:'COME ON IN', icon:'globe', short:'Website', color:'cyan' },
  { key:'github', n:'02', label:'THE REPOSITORY', title:['BUILT TO','BE OPEN.'], subtitle:'Good things are better when shared.', foot:'FORK SOMETHING GOOD', icon:'github', short:'GitHub', color:'black' },
  { key:'wechat', n:'03', label:'THE CONVERSATION', title:['KEEP IN','TOUCH.'], subtitle:'Every good thing starts with a hello.', foot:'SAY HELLO', icon:'chat', short:'WeChat', color:'black' },
];

function sound(type, count=1) {
  if (!soundOn) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const duration = type === 'snap' ? .047 : type === 'pick' ? .012 : .009;
    const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * duration), audio.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i=0; i<channel.length; i++) channel[i] = (Math.random()*2-1) * Math.pow(1-i/channel.length, 3);
    const noise = audio.createBufferSource(); noise.buffer=buffer;
    const filter = audio.createBiquadFilter(); filter.type='highpass'; filter.frequency.value=type==='snap'?1700:3500;
    const gain = audio.createGain(); gain.gain.value=type==='snap'?.11:Math.min(.08,.027 + count*.007);
    noise.connect(filter).connect(gain).connect(audio.destination); noise.start();
  } catch {}
}

document.querySelector('#app').innerHTML = `
  <main class="desktop" aria-label="Ticket Club desktop">
    <div class="wallpaper" aria-hidden="true"><div class="wallpaper-light"></div><div class="wallpaper-fold fold-one"></div><div class="wallpaper-fold fold-two"></div><div class="grain"></div></div>
    <header class="menubar">
      <div class="menu-left"><span class="apple">${icon('apple')}</span><strong>Ticket Club</strong><button data-action="settings">File</button><button data-action="reset">Edit</button><button data-action="toggle">View</button><button data-action="help">Help</button></div>
      <div class="menu-right"><button class="menubar-ticket active" data-action="toggle" aria-label="Show or hide tickets" aria-expanded="true"><img src="/assets/ticket-icon.svg" alt=""/><span class="menu-dot"></span></button><button data-action="sound" class="sound-menu" aria-label="Turn paper sounds on">${icon(soundOn?'volume':'mute')}</button><span class="system-icon">${icon('wifi')}</span><span class="battery" aria-label="Battery full"></span><span class="menu-clock"></span></div>
    </header>

    <div class="desktop-label"><span class="brand-star">✳</span><span>YOUR LITTLE<br>LINK COLLECTION</span></div>
    <button class="edition" data-action="settings">PERSONAL EDITION <span>↗</span></button>

    <section class="collection is-open" aria-label="Three shareable tickets">
      <svg class="clothesline" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true"><path class="rope-shadow" d="M-30 20Q720 86 1470 18"/><path class="rope" d="M-30 18Q720 84 1470 16"/><path class="rope-highlight" d="M-30 17Q720 83 1470 15"/></svg>
      <div class="tickets-stage">${specs.map((s,i)=>ticketMarkup(s,i)).join('')}</div>
      <div class="interaction-hint"><span class="hint-mark">↳</span><span class="hint-text">Grab a corner. Take a link.</span><kbd>↓</kbd></div>
      <nav class="mobile-tabs" aria-label="Choose a ticket">${specs.map((s,i)=>`<button data-ticket="${i}" class="${i===active?'selected':''}">${s.short}</button>`).join('')}</nav>
    </section>

    <section class="desktop-title" aria-label="Ticket Club"><div class="eyebrow"><i></i> GOOD THINGS. PASSED ALONG.</div><h1>TICKET<br><span>CLUB<span class="title-asterisk">✳</span></span></h1><p>A little piece of my internet.<br>Tear one off. Make it yours.</p><div class="desktop-actions"><button data-action="settings">${icon('settings')} Edit your links</button><span>/</span><button data-action="reset">${icon('refresh')} Fresh tickets</button></div></section>

    <aside class="clipboard-window" aria-label="Clipboard history"><div class="window-bar"><div class="traffic-lights"><button class="red-light" data-action="clipboard-hide" aria-label="Hide clipboard"></button><i></i><i></i></div><span>${icon('clipboard')} Clipboard</span><button class="window-clear" data-action="clear" aria-label="Clear clipboard history">${icon('trash')}</button></div><div class="clipboard-content"></div><div class="window-foot"><i></i><span>Ready for something good.</span><kbd>⌘ V</kbd></div></aside>

    <div class="desktop-foot"><span>COLLECT MOMENTS, SHARE LINKS.</span><span>© 2026 TC.</span></div>
    <nav class="dock" aria-label="Desktop dock"><button class="dock-item finder" data-action="help" aria-label="About this desktop"><span class="finder-face">⌣</span></button><button class="dock-item safari" data-action="website" aria-label="Select website ticket"><span>◈</span></button><button class="dock-item notes" data-action="settings" aria-label="Edit your links"><i></i><i></i><i></i></button><div class="dock-divider"></div><button class="dock-item ticket-dock" data-action="toggle" aria-label="Open Ticket Club"><img src="/assets/ticket-icon.svg" alt="Ticket Club"/><i class="dock-running"></i></button><button class="dock-item clipboard-dock" data-action="clipboard" aria-label="Show clipboard">${icon('clipboard')}</button><div class="dock-divider"></div><button class="dock-item trash-dock" data-action="reset" aria-label="Get fresh tickets">${icon('trash')}</button></nav>
    <div class="toast" role="status" aria-live="polite"></div>
    <dialog class="settings-dialog"><form id="settings-form"><div class="dialog-top"><span>MAKE IT YOURS</span><button type="button" data-action="close-settings" aria-label="Close settings">${icon('close')}</button></div><h2>Good links.<br>Your links.</h2><p>Three little tickets. One small corner of the internet.</p><label>Your name<input name="name" maxlength="28" required autocomplete="name"/></label><label>Website<input name="website" type="url" required placeholder="https://your.website"/></label><label>GitHub repository<input name="github" type="url" required placeholder="https://github.com/you/repo"/></label><label>WeChat ID<input name="wechat" maxlength="80" required placeholder="your-wechat-id"/></label><div class="settings-note">Saved on this device. QR codes update with your links.</div><button class="save-button" type="submit">Print my tickets ${icon('arrow')}</button></form></dialog>
    <dialog class="qr-dialog"><div class="dialog-top"><span>TAKE IT WITH YOU</span><button data-action="close-qr" aria-label="Close QR code">${icon('close')}</button></div><div class="qr-large"></div><h2></h2><p></p><button class="qr-copy save-button">Copy link ${icon('arrow')}</button></dialog>
  </main>`;

function ticketMarkup(s,i) {
  return `<article class="ticket ticket-${s.key} ${i===active?'mobile-active':''}" data-index="${i}" style="--index:${i};--angle:${[-7,1.5,7][i]}deg;--hang-y:${[5,14,3][i]}px" aria-label="${s.short} share ticket">
    <div class="clip" aria-hidden="true"><i></i></div>
    <div class="ticket-swing"><div class="ticket-face"><div class="ticket-print"><div class="ticket-meta"><span>TC / ${s.n}</span><span>PERSONAL PASS</span></div><div class="ticket-brand">TICKET CLUB <span>✳</span></div><div class="ticket-art"><img src="/assets/motif.svg" alt="Cyan woven pixel diamond"/></div><div class="ticket-section"><span>${s.n} / ${s.label}</span>${icon(s.icon)}</div><h2>${s.title.join('<br>')}</h2><p class="ticket-subtitle">${s.subtitle}</p><div class="ticket-bottom"><span class="owner-name"></span><span>2026 · ∞</span></div></div><div class="ticket-grain" aria-hidden="true"></div><div class="perforation" aria-hidden="true"></div><div class="tear-line" aria-hidden="true"></div></div>
    <canvas class="paper-canvas" aria-hidden="true"></canvas><button class="tear-handle" aria-label="Tear ${s.short} ticket and copy ${s.short==='WeChat'?'WeChat ID':'link'}"><span class="sr-only">Drag down to tear, or press Enter</span></button><div class="ticket-rest" inert><span>${icon('check')} TAKEN. GOOD CHOICE.</span><button class="reprint" data-reprint="${i}">PRINT ANOTHER ↻</button><button class="retry-copy" data-retry="${i}">RETRY COPY ↗</button></div><div class="rip-readout" aria-hidden="true">0%</div><button class="qr-button" data-qr="${i}" aria-label="Show ${s.short} QR code"></button></div>
  </article>`;
}

function shortValue(s) {
  const value = profile[s.key];
  return value.replace(/^https?:\/\//,'').replace(/\/$/,'');
}

function stubSvg(s) {
  const cyan = s.key==='website';
  const bg=cyan?'#a7e8e3':'#111310', fg=cyan?'#10211e':'#beece7';
  const value = shortValue(s), short = value.length>31?value.slice(0,29)+'…':value;
  let holes='';
  for(let i=0;i<=HOLES;i++) holes+=`<circle cx="${i*pitch}" cy="0" r="2.4" fill="black"/>`;
  let bars=''; for(let i=0;i<45;i++) if((i*7%11)>3)bars+=`<rect x="${17+i*2.35}" y="68" width="${i%3===0?1.4:.7}" height="10" fill="${fg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${STUB}" viewBox="0 0 ${W} ${STUB}"><defs><mask id="holes"><rect width="280" height="92" fill="white"/>${holes}</mask><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter></defs><g mask="url(#holes)"><rect width="280" height="92" fill="${bg}"/><path d="M0 1H280" stroke="${fg}" opacity=".18" stroke-dasharray="2 9.2"/><text x="17" y="27" fill="${fg}" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" letter-spacing="1.1">${s.key==='wechat'?'TAKE MY WECHAT':'TAKE MY LINK'}</text><text x="17" y="49" fill="${fg}" font-family="monospace" font-size="9.3">${escape(short)}</text>${bars}<text x="137" y="77" fill="${fg}" font-family="monospace" font-size="7" letter-spacing=".7">PULL TO COLLECT</text><path d="m246 21 14 14m-14 0h14V21" fill="none" stroke="${fg}" stroke-width="1.5"/><rect width="280" height="92" opacity=".25" filter="url(#grain)" fill="transparent"/></g></svg>`;
}

function updateTickets() {
  document.querySelectorAll('.ticket').forEach((root,i)=>{
    root.querySelector('.owner-name').textContent = profile.name.toUpperCase();
    const qr = root.querySelector('.qr-button');
    qr.innerHTML = qrSvg(profile[specs[i].key],{size:34,dark:'#b9e9e4',light:'transparent'});
    papers[i]?.setTexture(stubSvg(specs[i]));
  });
}

papers = [...document.querySelectorAll('.ticket')].map((root,i)=>new PaperTicket(root,{
  onCopy:()=>copyTicket(i), sound, onActivity:state=>{
    const texts = { pull:'One little pull. One good link.', continue:'A little further. You’re almost there.', ready:'Grab a corner. Take a link.' };
    document.querySelector('.hint-text').textContent = texts[state];
  }
}));
updateTickets();

async function writeClipboard(value) {
  if(navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(value); return; } catch {}
  }
  const field=document.createElement('textarea'); field.value=value; field.style.cssText='position:fixed;opacity:0;left:0;top:0';
  document.body.append(field); field.select();
  const success=document.execCommand('copy'); field.remove();
  if(!success) throw new Error('Clipboard unavailable');
}

async function copyTicket(i) {
  const s=specs[i], value=profile[s.key];
  try {
    await writeClipboard(value);
    papers[i].root.classList.remove('copy-failed');
    const item={key:s.key,label:s.short,value,time:Date.now()};
    history=[item,...history.filter(x=>x.value!==value)].slice(0,6);
    sessionStorage.setItem('ticket-club-history',JSON.stringify(history));
    renderClipboard();
    document.querySelector('.clipboard-window').classList.add('is-visible','just-copied');
    setTimeout(()=>document.querySelector('.clipboard-window').classList.remove('just-copied'),600);
    document.querySelector('.hint-text').textContent='A good link, ready to go. ⌘ V';
    toast(`${s.short==='WeChat'?'WeChat ID':s.short+' link'} copied. All yours.`,'check');
    setTimeout(()=>{ if(papers.every(p=>p.detached))document.querySelector('.hint-text').textContent='A whole collection. In good hands.'; },700);
  } catch {
    papers[i].root.classList.add('copy-failed');
    document.querySelector('.hint-text').textContent='Clipboard needs a click. Try “Retry copy”.';
    toast('Couldn’t access clipboard. Use Retry copy.','clipboard');
  }
}

function renderClipboard() {
  const content=document.querySelector('.clipboard-content');
  content.innerHTML=history.length?history.slice(0,2).map((h,i)=>`<button class="clipboard-entry" data-history="${i}" title="Copy again"><span class="entry-icon">${icon(h.key==='github'?'github':h.key==='wechat'?'chat':'globe')}</span><span><strong>${escape(h.label)}</strong><span class="entry-value">${escape(h.value)}</span></span><span class="entry-check">${i===0?icon('check'):icon('clipboard')}</span></button>`).join(''):`<div class="clipboard-empty"><span class="empty-icon">${icon('clipboard')}</span><div><strong>Something worth keeping.</strong><p>Your next link lands here.</p></div></div>`;
  document.querySelector('.window-foot span').textContent=history.length?'Copied & ready to paste.':'Ready for something good.';
}
renderClipboard();

function toast(message, glyph='check') {
  clearTimeout(toastTimer);
  const el=document.querySelector('.toast');
  el.innerHTML=`${icon(glyph)}<span>${escape(message)}</span>`;
  el.classList.add('show');
  toastTimer=setTimeout(()=>el.classList.remove('show'),3300);
}

function toggle(value) {
  opened=typeof value==='boolean'?value:!opened;
  document.querySelector('.collection').classList.toggle('is-open',opened);
  document.querySelector('.collection').inert = !opened;
  document.querySelector('.menubar-ticket').classList.toggle('active',opened);
  document.querySelector('.menubar-ticket').setAttribute('aria-expanded',String(opened));
  document.querySelector('.desktop').classList.toggle('tickets-hidden',!opened);
}

function reset() {
  papers.forEach(p=>p.reset());
  toggle(true);
  document.querySelector('.hint-text').textContent='Fresh paper. Same good links.';
  toast('Three fresh tickets. Help yourself.','refresh');
}

function selectTicket(i) {
  active=i;
  document.querySelectorAll('.ticket').forEach((el,n)=>el.classList.toggle('mobile-active',n===i));
  document.querySelectorAll('[data-ticket]').forEach((el,n)=>el.classList.toggle('selected',n===i));
  toggle(true);
  syncTicketAccessibility();
}

const mobileQuery = matchMedia('(max-width: 760px)');
function syncTicketAccessibility() {
  document.querySelectorAll('.ticket').forEach((el,n)=>{
    el.inert = mobileQuery.matches && n !== active;
    if(el.inert) el.setAttribute('aria-hidden','true'); else el.removeAttribute('aria-hidden');
  });
}
mobileQuery.addEventListener('change',syncTicketAccessibility);
syncTicketAccessibility();

document.addEventListener('click',async e=>{
  const reprint=e.target.closest('[data-reprint]');
  if(reprint){papers[+reprint.dataset.reprint].reset();return;}
  const retry=e.target.closest('[data-retry]');
  if(retry){await copyTicket(+retry.dataset.retry);if(!papers[+retry.dataset.retry].root.classList.contains('copy-failed'))return;return;}
  const tab=e.target.closest('[data-ticket]'); if(tab){selectTicket(+tab.dataset.ticket);return;}
  const saved=e.target.closest('[data-history]');
  if(saved){try{await writeClipboard(history[+saved.dataset.history].value);toast('Copied again. Ready to paste.');}catch{toast('Clipboard is unavailable. Please try again.');}return;}
  const qr=e.target.closest('[data-qr]'); if(qr){showQR(+qr.dataset.qr);return;}
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  switch(action){
    case 'toggle':toggle();break;
    case 'reset':reset();break;
    case 'settings':{
      const form=document.querySelector('#settings-form');
      Object.entries(profile).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v;});
      document.querySelector('.settings-dialog').showModal();break;
    }
    case 'close-settings':document.querySelector('.settings-dialog').close();break;
    case 'close-qr':document.querySelector('.qr-dialog').close();break;
    case 'sound':soundOn=!soundOn;localStorage.setItem('ticket-club-sound',soundOn?'on':'off');document.querySelector('.sound-menu').innerHTML=icon(soundOn?'volume':'mute');document.querySelector('.sound-menu').setAttribute('aria-label',`Turn paper sounds ${soundOn?'off':'on'}`);if(soundOn)sound('snap');toast(`Paper sounds ${soundOn?'on':'off'}.`,soundOn?'volume':'mute');break;
    case 'clear':history=[];sessionStorage.removeItem('ticket-club-history');renderClipboard();break;
    case 'clipboard':document.querySelector('.clipboard-window').classList.add('is-visible');break;
    case 'clipboard-hide':document.querySelector('.clipboard-window').classList.remove('is-visible');document.querySelector('.clipboard-window').classList.add('was-hidden');break;
    case 'website':selectTicket(0);break;
    case 'help':toast('Drag a ticket’s bottom corner down. Or Tab to it and press Enter.','arrow');break;
  }
});

document.querySelector('#settings-form').addEventListener('submit',e=>{
  e.preventDefault();
  const data=new FormData(e.target);
  const next=Object.fromEntries(Object.keys(defaults).map(k=>[k,String(data.get(k)||'').trim()]));
  if(!next.name || !next.wechat)return;
  for(const key of ['website','github']){
    try{const url=new URL(next[key]);if(!['https:','http:'].includes(url.protocol))throw Error();if(new TextEncoder().encode(next[key]).length>600)throw Error();}catch{toast('Please use a valid http or https link (under 600 bytes).');return;}
  }
  profile=next;localStorage.setItem('ticket-club-profile',JSON.stringify(profile));
  papers.forEach(p=>p.reset());updateTickets();
  document.querySelector('.settings-dialog').close();toggle(true);
  toast('Your links. Freshly printed.');
});

function showQR(i) {
  const dialog=document.querySelector('.qr-dialog'),s=specs[i];
  dialog.querySelector('.qr-large').innerHTML=qrSvg(profile[s.key],{size:224,dark:'#111310',light:'#e8f0df'});
  dialog.querySelector('h2').textContent=s.short==='WeChat'?'Say hello.':'Take a good link.';
  dialog.querySelector('p').textContent=profile[s.key];
  dialog.querySelector('.qr-copy').onclick=async()=>{try{await writeClipboard(profile[s.key]);dialog.close();toast('Copied. Take it with you.');}catch{toast('Clipboard is unavailable.');}};
  dialog.showModal();
}

for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{
  if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!document.querySelector('dialog[open]'))toggle(false);
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'&&!document.querySelector('dialog[open]')){e.preventDefault();toggle();}
});
function updateClock(){document.querySelector('.menu-clock').textContent=new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',hour12:false,timeZone:'Asia/Shanghai'}).format(new Date()).replaceAll(',','');}
updateClock();setInterval(updateClock,30000);
document.querySelector('.desktop').classList.add('loaded');

// Public demo controls are also used for visual QA. Clipboard follows the real UI path.
window.ticketClub={tear:i=>papers[i].demo(),reset,select:selectTicket,getState:()=>({profile,history,opened,tickets:papers.map(p=>({broken:p.progress,detached:p.detached}))})};
