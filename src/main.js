import {t} from './ui/i18n.js';
document.querySelector('#ui').innerHTML=`<section class="panel title"><div class="eyebrow">${t('byline')}</div><h1>${t('title')}</h1><p class="lead">${t('tagline')}</p><p>${t('ready')}</p><div class="credit">${t('credit')}</div></section>`;
