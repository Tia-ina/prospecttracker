/* ===== Menu principal (écran d'accueil) ===== */
const TUILES = [
  ['🔎', () => M('Sivana', 'Filtrer'), () => M(`Adika sy sivano ny lahatsoratra`, `Collez et filtrez les publications`), () => show('filtrer'), () => 0],
  ['📋', () => M('Lisitra', 'Listes'), () => M(`Mpanjifa, tiana, efa nantsoina`, `Prospects, favoris, contactés`), () => show('listes'), () => S.posts.filter(FILTRES.acontacter).length],
  ['⚖️', () => M('Fangatahana / Tolotra', 'Demande / Offre'), () => M(`Varavarana hidiran'ny tsena`, `Points d'entrée du marché`), () => { show('marche'); setSub('porte'); }, () => 0],
  ['📈', () => M('Fivoarana', 'Évolution'), () => M(`Sary sy tombana`, `Graphiques et estimations`), () => { show('marche'); setSub('evol'); }, () => 0],
  ['📊', () => M('Famintinana', 'Bilan'), () => M(`Vokatra sy tolotra 10 be`, `Top 10 produits et services`), () => { show('marche'); setSub('bilan'); }, () => 0],
  ['🎯', () => M('Tetika', 'Stratégie'), () => M(`Fahalemen'ny mpivarotra, tetika varotra`, `Faiblesses des vendeurs, plan de vente`), () => { show('marche'); setSub('strat'); }, () => 0],
  ['📒', () => M('Gazety', 'Journal'), () => M(`Tantara isan'andro`, `Historique jour par jour`), () => show('journal'), () => S.journal.length],
  ['👤', () => M('Profil', 'Profil'), () => M(`Orinasa, hafatra MP, antontan-kevitra`, `Entreprise, message MP, statistiques`), () => show('profil'), () => 0]
];
const tuile = i => TUILES[i][3]();

function renderMenu(){
  const v = $('v-menu'); if (!v) return;
  const nP = S.posts.length, pr = S.posts.filter(FILTRES.prospects).length, ac = S.posts.filter(FILTRES.acontacter).length, pf = S.profil;
  const stat = (n, t) => `<div class="glass py-2" style="--i:0"><div class="text-lg font-extrabold">${n}</div><div class="text-[11px] opacity-90">${t}</div></div>`;
  const tel = (pf.tel || '').replace(/[^+\d]/g, '');
  v.innerHTML = `<div class="grid grid-cols-3 gap-2 text-center">${stat(nP, M('Lahatsoratra', 'Publications'))}${stat(pr, M('Mpanjifa', 'Prospects'))}${stat(ac, M('Hantsoina', 'À contacter'))}</div>
    <div class="grid grid-cols-2 gap-3">${TUILES.map((t, i) => { const n = t[4](); return `<button class="tuile" style="--i:${i + 1}" onclick="tuile(${i})">${n ? `<em>${n}</em>` : ''}<i>${t[0]}</i><b>${t[1]()}</b><span>${t[2]()}</span></button>`; }).join('')}</div>
    <div class="glass p-3 text-center text-xs space-y-2" style="--i:9"><div class="font-bold">${esc(pf.ent || 'T.A.S')}</div>
      <div class="flex gap-2 justify-center">${tel ? `<a class="btn btn-l flex-1" href="tel:${tel}">📞 ${esc(pf.tel)}</a>` : ''}${pf.mail ? `<a class="btn btn-l flex-1" href="mailto:${esc(pf.mail)}">✉️ E-mail</a>` : ''}</div></div>`;
}

/* Navigation : le menu est l'écran de départ ; le bouton retour du téléphone revient au menu */
const _show3 = show;
show = function(v, pop){
  _show3(v);
  document.body.classList.toggle('menu', v === 'menu');
  const b = $('btnMenu'); if (b) b.hidden = v === 'menu';
  if (v === 'menu') renderMenu();
  if (!pop && v !== 'menu') { try { if (!(history.state && history.state.v && history.state.v !== 'menu')) history.pushState({ v }, ''); } catch (e) {} }
};
window.addEventListener('popstate', () => show('menu', true));
const _renderTout3 = renderTout; renderTout = function(){ _renderTout3(); renderMenu(); };
try { history.replaceState({ v: 'menu' }, ''); } catch (e) {}
show('menu', true);
