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
