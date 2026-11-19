/* Recherche (Facebook / Google) + analyse de texte brut + partage vers l'application */
const FB_RECENT = 'eyJyZWNlbnRfcG9zdHM6MCI6IntcIm5hbWVcIjpcInJlY2VudF9wb3N0c1wiLFwiYXJnc1wiOlwiXCJ9In0%3D';
let fbS = 0, fbI = -1, fbSuj = [], fbInt = [], fbQ = '';
const fbListe = id => $(id).value.split(',').map(s => s.trim()).filter(Boolean);
const fbEsc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fbUrl = q => 'https://www.facebook.com/search/posts/?q=' + encodeURIComponent(q) + '&filters=' + FB_RECENT;
const fbQuery = () => fbQ.trim() || [fbSuj[fbS], fbInt[fbI]].filter(Boolean).join(' ');
function fbPickS(i) { fbS = i; fbQ = ''; renderFb(); }
function fbPickI(i) { fbI = fbI === i ? -1 : i; fbQ = ''; renderFb(); }
function fbGo(mode) {
  const q = fbQuery();
  if (!q) return toast(M(`Soraty ny teny hotadiavina`, `Saisissez des mots à chercher`));
  const j = parseInt($('inputJours').value) || 7, tbs = j <= 1 ? 'd' : j <= 7 ? 'w' : j <= 31 ? 'm' : 'y';
  try { navigator.clipboard.writeText(q); } catch (e) {}
  toast(M(`Voadika ny teny : ${q}`, `Mots copiés : ${q}`));
  window.open(mode === 'fb' ? fbUrl(q) : 'https://www.google.com/search?q=' + encodeURIComponent(mode === 'gfb' ? q + ' site:facebook.com' : q) + '&tbs=qdr:' + tbs, '_blank');
}
function renderFb() {
  const box = $('fbBox'); if (!box) return;
  fbSuj = fbListe('inputSujets'); fbInt = fbListe('inputIntentions');
  if (fbS >= fbSuj.length) fbS = 0;
  if (fbI >= fbInt.length) fbI = -1;
  const j = $('inputJours').value || 7;
  const chips = (a, act, fn) => a.map((t, i) => `<button class="puce ${i === act ? 'on' : ''}" onclick="${fn}(${i})">${fbEsc(t)}</button>`).join('');
  box.innerHTML = `<h2 class="font-bold text-sm">🔎 ${M(`Fikarohana`, `Recherche`)}</h2>
    <input id="fbQ" class="champ" placeholder="${M(`Teny na andian-teny (oh : mpanao trano)`, `Mots à chercher (ex : mpanao trano)`)}" value="${fbEsc(fbQ)}" oninput="fbQ=this.value">
    <div class="flex flex-wrap gap-2">${chips(fbSuj, fbQ ? -1 : fbS, 'fbPickS')}</div>
    <div class="flex flex-wrap gap-2">${chips(fbInt, fbQ ? -1 : fbI, 'fbPickI')}</div>
    <div class="flex gap-2"><button class="btn btn-o" style="flex:1" onclick="fbGo('fb')">Facebook</button><button class="btn btn-l" style="flex:1" onclick="fbGo('g')">Google</button><button class="btn btn-l" style="flex:1" onclick="fbGo('gfb')">Google·FB</button></div>
    <p class="text-xs">${M(`Ny teny dia voadika ho azy. Tazony ny lahatsoratra latsaky ny ${j} andro ihany.`, `Les mots sont copiés automatiquement. Ne retenez que les publications de moins de ${j} jours.`)}</p>`;
}

/* ----- Texte brut : on colle les publications telles quelles, sans format ----- */
function brDate(t) {
  const l = t.toLowerCase(); let m;
  if ((m = l.match(/(\d+)\s*(semaines?|sem|herinandro)/))) return m[1] + ' semaines';
  if ((m = l.match(/(\d+)\s*(mois|volana)/))) return m[1] + ' mois';
  if ((m = l.match(/(\d+)\s*(jours?|j|andro)\b/))) return m[1] + ' jours';
  if (/\bhier\b|omaly/.test(l)) return '1 jour';
  return '0 jour';
}
function brAnalyser() {
  const raw = $('brutInput').value.trim();
  if (!raw) return toast(M(`Apetaho ny lahatsoratra aloha`, `Collez d'abord les publications`));
  const lignes = [];
  raw.split(/\n\s*\n+/).forEach(b => {
    b = b.trim(); if (!b) return;
    const lm = b.match(/https?:\/\/\S+/);
    let lien = lm ? lm[0].replace(/[).,]+$/, '') : '';
    let txt = b.replace(/https?:\/\/\S+/g, ' ').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
    if (!txt && !lien) return;
    if (!txt) txt = M(`Lahatsoratra nozaraina (ampio ny lahatsoratra)`, `Publication partagée (ajoutez son texte)`);
    if (!lien) lien = 'https://www.facebook.com/search/posts/?q=' + encodeURIComponent(txt.split(' ').slice(0, 8).join(' '));
    lignes.push(brDate(b.slice(0, 200)) + ' | ' + txt + ' | ' + lien);
  });
  $('fluxInput').value = lignes.join('\n');
  analyser();
}
function brSauve() { try { localStorage.setItem('pt_brut', $('brutInput').value); } catch (e) {} }
function renderBrut(ajout) {
  const b = $('brutBox'); if (!b) return;
  let v = $('brutInput') ? $('brutInput').value : '';
  if (!v) { try { v = localStorage.getItem('pt_brut') || ''; } catch (e) {} }
  if (ajout) v = (v ? v + '\n\n' : '') + ajout;
  b.innerHTML = `<h2 class="font-bold text-sm">📋 ${M(`Lahatsoratra tsy voalamina`, `Texte brut`)}</h2>
    <textarea id="brutInput" class="champ" rows="5" oninput="brSauve()" placeholder="${M(`Apetaho eto ny lahatsoratra voadika avy ao Facebook. Ataovy tsipika foana eo anelanelan'ny lahatsoratra roa.`, `Collez ici les publications copiées dans Facebook. Séparez deux publications par une ligne vide.`)}">${fbEsc(v)}</textarea>
    <button class="btn btn-o w-full" onclick="brAnalyser()">${M(`Hamakafaka ny lahatsoratra →`, `Analyser le texte →`)}</button>`;
  brSauve();
}

['inputSujets', 'inputIntentions', 'inputJours'].forEach(id => $(id) && $(id).addEventListener('input', renderFb));
const _cl5 = changerLangue;
changerLangue = function () { _cl5(); renderFb(); renderBrut(); };
renderFb(); renderBrut();

/* ----- Partage vers l'application (Facebook > Partager > ProspectTracker) ----- */
(function () {
  const sp = new URLSearchParams(location.search);
  const sh = ['title', 'text', 'url'].map(k => sp.get(k)).filter(Boolean).join('\n');
  if (!sh) return;
  renderBrut(sh);
  history.replaceState(null, '', location.pathname);
  show('filtrer');
  toast(M(`Voaray ny zavatra nozaraina`, `Publication reçue, ajoutée au texte brut`));
})();
