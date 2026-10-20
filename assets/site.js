const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
}

const langSwitch = document.querySelector('.lang-switch');
if (langSwitch) {
  const langButton = langSwitch.querySelector('.lang-current');
  langButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = langSwitch.classList.toggle('open');
    langButton.setAttribute('aria-expanded', String(open));
  });
  // Options are real links to set_lang.php — clicking one just navigates and
  // reloads the page in the new language, no extra JS needed here.
  document.addEventListener('click', () => {
    langSwitch.classList.remove('open');
    langButton.setAttribute('aria-expanded', 'false');
  });
}

const userSwitch = document.querySelector('.user-switch');
if (userSwitch) {
  const userButton = userSwitch.querySelector('.user-current');
  userButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = userSwitch.classList.toggle('open');
    userButton.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', () => {
    userSwitch.classList.remove('open');
    userButton.setAttribute('aria-expanded', 'false');
  });
}

const cookieBanner = document.getElementById('cookie-banner');
const cookieAccept = document.getElementById('cookie-accept');
if (cookieBanner && cookieAccept) {
  if (!localStorage.getItem('cookieConsent')) {
    cookieBanner.hidden = false;
  }
  cookieAccept.addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    cookieBanner.hidden = true;
  });
}

const discordPopup = document.getElementById('discord-popup');
if (discordPopup) {
  const discordClose = document.getElementById('discord-popup-close');
  const discordDismiss = document.getElementById('discord-popup-dismiss');
  const discordJoin = document.getElementById('discord-popup-join');
  const hideDiscordPopup = () => {
    sessionStorage.setItem('discordPopupSeen', 'true');
    discordPopup.hidden = true;
  };
  if (!sessionStorage.getItem('discordPopupSeen')) {
    setTimeout(() => { discordPopup.hidden = false; }, 4000);
  }
  discordClose?.addEventListener('click', hideDiscordPopup);
  discordDismiss?.addEventListener('click', hideDiscordPopup);
  discordJoin?.addEventListener('click', hideDiscordPopup);
  discordPopup.addEventListener('click', (e) => {
    if (e.target === discordPopup) hideDiscordPopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !discordPopup.hidden) hideDiscordPopup();
  });
}


// Public albums are committed to assets/albums/albums.json with image files in the repository.
(async function initPublicGallery(){
  const gallery=document.getElementById('public-gallery');
  if(!gallery)return;
  let albums=[];
  try{
    const response=await fetch('assets/albums/albums.json',{cache:'no-store'});
    if(!response.ok)throw new Error('No se pudo leer el índice de álbumes');
    const data=await response.json();
    albums=Array.isArray(data.albums)?data.albums:[];
  }catch(error){console.warn('Galería pública no disponible:',error);}
  const filters=[...document.querySelectorAll('[data-filter]')];
  function render(filter='all'){
    const visible=albums.filter(a=>filter==='all'||a.category===filter);
    if(!visible.length){
      gallery.innerHTML='<div class="gallery-empty panel"><div class="empty-symbol">✦</div><h2>La próxima historia la escribimos juntos</h2><p>Cuando se publiquen álbumes en el repositorio, vas a poder verlos acá.</p><p class="muted-note">Todavía no hay fotos públicas cargadas en esta categoría.</p></div>';
      return;
    }
    gallery.innerHTML='<div class="gallery-grid">'+visible.map((a,ai)=>`<article class="album-card"><img class="album-cover" src="${safe(a.cover||((a.photos||[])[0]||''))}" alt="${safe(a.title||'Álbum')}" loading="lazy"><div class="album-meta"><h3>${safe(a.title||'Álbum sin título')}</h3><p>${safe(a.date||'L2 Intratables')} · ${(a.photos||[]).length} fotos</p><div class="album-photos">${(a.photos||[]).map((src,pi)=>`<button type="button" data-album="${ai}" data-photo="${pi}" aria-label="Abrir foto ${pi+1}"><img src="${safe(src)}" alt="${safe(a.title||'Foto')}" loading="lazy"></button>`).join('')}</div></div></article>`).join('')+'</div>';
    gallery.querySelectorAll('[data-album]').forEach(btn=>btn.addEventListener('click',()=>openLightbox(visible[Number(btn.dataset.album)],Number(btn.dataset.photo))));
  }
  function safe(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(b=>b.classList.toggle('is-active',b===btn));render(btn.dataset.filter);}));
  const box=document.getElementById('gallery-lightbox'),img=document.getElementById('lightbox-image'),caption=document.getElementById('lightbox-caption');
  let currentAlbum=null,currentIndex=0;
  function openLightbox(album,index){currentAlbum=album;currentIndex=index;show();box.hidden=false;document.body.style.overflow='hidden';}
  function show(){const photos=currentAlbum?.photos||[];if(!photos.length)return;currentIndex=(currentIndex+photos.length)%photos.length;img.src=photos[currentIndex];img.alt=currentAlbum.title||'Captura de L2 Intratables';caption.textContent=(currentAlbum.title||'Álbum')+' · '+(currentIndex+1)+' / '+photos.length;}
  function close(){box.hidden=true;document.body.style.overflow='';}
  box?.querySelector('.lightbox-close')?.addEventListener('click',close);
  box?.querySelector('.lightbox-prev')?.addEventListener('click',()=>{currentIndex--;show();});
  box?.querySelector('.lightbox-next')?.addEventListener('click',()=>{currentIndex++;show();});
  box?.addEventListener('click',e=>{if(e.target===box)close();});
  document.addEventListener('keydown',e=>{if(box.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft'){currentIndex--;show();}if(e.key==='ArrowRight'){currentIndex++;show();}});
  render();
})();

(function initAlbumPreview(){
  const form=document.getElementById('album-form'),preview=document.getElementById('album-preview');
  if(!form||!preview)return;
  let objectUrls=[];
  form.addEventListener('submit',event=>{
    event.preventDefault();objectUrls.forEach(URL.revokeObjectURL);objectUrls=[];
    const files=[...form.querySelector('#album-photos').files].filter(f=>f.type.startsWith('image/'));
    if(!files.length){alert('Elegí al menos una imagen válida.');return;}
    const title=form.querySelector('#album-title').value.trim();
    const category=form.querySelector('#album-category').value;
    preview.hidden=false;
    preview.innerHTML=`<p class="panel-kicker">Vista previa local · ${files.length} fotos · ${category}</p><h3>${title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</h3><p class="muted-note">Estas fotos todavía no son públicas. Para publicarlas, agregá las imágenes al repositorio y actualizá <code>assets/albums/albums.json</code>.</p><div class="preview-images"></div>`;
    const grid=preview.querySelector('.preview-images');
    files.forEach(file=>{const url=URL.createObjectURL(file);objectUrls.push(url);const img=document.createElement('img');img.src=url;img.alt=file.name;grid.appendChild(img);});
    preview.scrollIntoView({behavior:'smooth',block:'start'});
  });
})();
