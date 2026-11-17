/* Recherche Facebook : liens de recherche construits avec les sujets clés, mots d'intention et limite de jours */
const FB_RECENT = 'eyJyZWNlbnRfcG9zdHM6MCI6IntcIm5hbWVcIjpcInJlY2VudF9wb3N0c1wiLFwiYXJnc1wiOlwiXCJ9In0%3D';
let fbS = 0, fbI = -1, fbSuj = [], fbInt = [];
const fbListe = id => $(id).value.split(',').map(s => s.trim()).filter(Boolean);
const fbEsc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fbUrl = q => 'https://www.facebook.com/search/posts/?q=' + encodeURIComponent(q) + '&filters=' + FB_RECENT;
function fbPickS(i) { fbS = i; renderFb(); }
function fbPickI(i) { fbI = fbI === i ? -1 : i; renderFb(); }
function fbOuvrir() {
  const q = [fbSuj[fbS], fbInt[fbI]].filter(Boolean).join(' ');
  if (!q) return toast(M(`Safidio ny lohahevitra`, `Choisissez un sujet`));
  window.open(fbUrl(q), '_blank');
}
function renderFb() {
  const box = $('fbBox'); if (!box) return;
  fbSuj = fbListe('inputSujets'); fbInt = fbListe('inputIntentions');
  if (fbS >= fbSuj.length) fbS = 0;
  if (fbI >= fbInt.length) fbI = -1;
  const j = $('inputJours').value || 7;
  const chips = (a, act, fn) => a.map((t, i) => `<button class="puce ${i === act ? 'on' : ''}" onclick="${fn}(${i})">${fbEsc(t)}</button>`).join('');
  box.innerHTML = `<h2 class="font-bold text-sm">🔎 ${M(`Fikarohana ao amin'i Facebook`, `Recherche sur Facebook`)}</h2>
    <div><label class="lbl">${M(`Lohahevitra`, `Sujet clé`)}</label><div class="flex flex-wrap gap-2">${chips(fbSuj, fbS, 'fbPickS')}</div></div>
    <div><label class="lbl">${M(`Teny mampiseho filàna (azo atao na tsy atao)`, `Mot d'intention (facultatif)`)}</label><div class="flex flex-wrap gap-2">${chips(fbInt, fbI, 'fbPickI')}</div></div>
    <button class="btn btn-o w-full" onclick="fbOuvrir()">${M(`Hikaroka ao amin'i Facebook →`, `Rechercher sur Facebook →`)}</button>
    <p class="text-xs">${M(`Tazony ny lahatsoratra latsaky ny ${j} andro ihany.`, `Ne retenez que les publications de moins de ${j} jours.`)}</p>`;
}
['inputSujets', 'inputIntentions', 'inputJours'].forEach(id => $(id) && $(id).addEventListener('input', renderFb));
const _cl5 = changerLangue;
changerLangue = function () { _cl5(); renderFb(); };
renderFb();
