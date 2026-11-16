/* ===== Module Marché : demande/offre, évolution, bilan, stratégie ===== */
const M = (mg, fr) => lang === 'mg' ? mg : fr;
const DAY = 864e5, NH = 180;
const nz = s => String(s).toLowerCase().replace(/œ/g, 'oe').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const rx = (list, f) => new RegExp('(?:^|[^a-z0-9])(?:' + list.map(k => nz(k).replace(/\$$/, '(?![a-z0-9])')).join('|') + ')', f || '');
const sum = a => a.reduce((x, y) => x + y, 0);
const pct = v => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
let mSub = 'porte', mMode = 'jours', mCat = '', mSujet = '';

/* Produits (p) et services (s) : [type, français, malgache, mots-clés] */
const CATS = [
 ['p','Lapin','Lapina',['lapin','lapina','clapier']],
 ['p','Poulet / volaille','Akoho',['poulet','poule','akoho','volaille','poussin','pondeuse','coq']],
 ['p','Œufs','Atody',['oeuf','atody']],
 ['p','Porc','Kisoa',['porc','kisoa','porcelet','truie']],
 ['p','Bovin / zébu','Omby',['bovin','zebu','omby','vache','genisse','veau']],
 ['p','Poisson','Trondro',['poisson','trondro','tilapia','alevin','carpe']],
 ['p','Aliment / provende','Sakafo biby',['provende','aliment','sakafo','rakitra','granule']],
 ['p','Semences / plants','Voa / zanaka-javamaniry',['semence','graine','plant','bouture','voamaina']],
 ['p','Engrais','Zezika',['engrais','zezika','fumier','compost','fertilisant']],
 ['p','Médicaments / vaccins','Fanafody / vaksiny',['vaccin','vaksiny','medicament','fanafody','antibiotique','vermifuge','vitamine']],
 ['p','Matériel / équipement','Fitaovana',['materiel','equipement','fitaovana','cage','mangeoire','abreuvoir','incubateur','couveuse']],
 ['p','Lait / produits laitiers','Ronono',['lait','ronono','fromage','yaourt']],
 ['p','Légumes','Legioma',['legume','legioma','tomate','carotte','salade']],
 ['p','Riz','Vary',['riz','vary','paddy']],
 ['s','Vétérinaire / soins','Mpitsabo biby',['veterinaire','veto','mpitsabo','soins','fitsaboana']],
 ['s','Formation','Fanofanana',['formation','fanofanana','apprendre']],
 ['s','Conseil / encadrement','Torohevitra',['conseil','torohevitra','accompagnement','encadrement','technicien']],
 ['s','Livraison / transport','Fitaterana',['livraison','transport','fitaterana','mitondra','expedition']],
 ['s','Construction / aménagement','Fanamboarana',['construction','fanamboarana','poulailler','amenagement','hangar','batiment','enclos']],
 ['s','Financement / crédit','Famatsiam-bola',['credit','pret$','financement','famatsiam-bola','microfinance','subvention']],
 ['s','Abattage / transformation','Famonoana / fanodinana',['abattage','famonoana','transformation','fanodinana','charcuterie','boucherie']],
 ['s','Reproduction / insémination','Fiterahana',['reproducteur','saillie','insemination','reproduction','fiterahana']],
 ['s','Location (terrain, matériel)','Fampanofana',['location','louer','fanofana','terrain']],
 ['s','Analyse / laboratoire','Fanadihadiana / laboratoara',['analyse','laboratoire','certification','label']],
 ['s','Main-d\'œuvre','Mpiasa',['ouvrier','mpiasa','recrutement','gardien',"main d'oeuvre"]],
 ['s','Commercialisation / débouchés','Fivarotana / toerana hivarotana',['commercialisation','debouche','marketing','publicite','grossiste','fivarotana']]
].map(c => ({ t: c[0], fr: c[1], mg: c[2], re: rx(c[3]) }));

/* Demande ou offre ? */
const DEM = rx(['mila','tadiavina','mitady','tiako','cherche','recherche','besoin','je veux','qui vend','ou trouver','ou acheter','iza$','aiza','aide','vonjy','svp','azafady','combien','ohatrinona','firy$','comment','mividy','hividy','achete','recommand'], 'g');
const OFF = rx(['mivarotra','manolotra','fivarotana','vente','a vendre','je vends','nous vendons','disponible','promo','tolotra','nous proposons','je propose','en stock','commandez','contactez','azo vidiana'], 'g');
const PRIX = /\d[\d\s.,]*\s*(ar\b|ariary|mga|fmg|€|eur|usd|\$)|(prix|vidiny)\s*[:=]?\s*\d/;
const LIV = /livraison|fitaterana|mitondra|expedition|delivery/;
const CONT = /\d{2}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}|whatsapp|contact|antsoy|inbox|\bmp\b|telephone|tel[\s:.]/;
const GAR = /garantie|suivi|conseil|torohevitra|certifi|laboratoire|qualite|vaccin/;

/* Faiblesses : plaintes détectées (re) ou lacunes dans les annonces des vendeurs (o) */
const FAIB = [
 { k:'prix', re: rx(['lafo loatra','mahalafo','cher','prix eleve','vidiny avo']), mg:`Vidiny heverina ho lafo loatra`, fr:`Prix jugés trop élevés`,
   am:`Asehoy mazava ny vidiny, manolora vidiny mihena ho an'ny betsaka na andrana kely`, af:`Affichez un prix clair, proposez des paliers (remise au volume) ou un lot d'essai` },
 { k:'rupture', re: rx(['lany','tsy misy','rupture','indisponible','introuvable','tsy hita','epuise']), mg:`Entana lany / tsy hita`, fr:`Ruptures de stock / produit introuvable`,
   am:`Mitazona tahiry fiarovana ary lazao ny daty hahatongavan'ny entana`, af:`Gardez un stock de sécurité et annoncez les dates de réapprovisionnement` },
 { k:'qualite', re: rx(['ratsy','tsy tsara','mauvaise qualite','mauvais','faux']), mg:`Fitarainana momba ny kalitao`, fr:`Plaintes sur la qualité`,
   am:`Omeo porofo (sary, fanamarinana, andrana) sy antoka fanoloana`, af:`Donnez des preuves (photos, certificats, échantillon) et une garantie de remplacement` },
 { k:'retard', re: rx(['tara','retard','delai','tsy tonga','livraison tardive']), mg:`Tara ny fandefasana`, fr:`Retards de livraison`,
   am:`Lazao daty mazava ary tano; fitaterana tsotra sy arahina`, af:`Annoncez un délai précis et tenez-le ; livraison simple et suivie` },
 { k:'reponse', re: rx(['tsy mamaly','pas de reponse','sans reponse','injoignable','tsy mahazo antso']), mg:`Mpivarotra tsy mamaly`, fr:`Vendeurs injoignables / sans réponse`,
   am:`Mamalia ao anatin'ny 1 ora (Messenger/WhatsApp) amin'ny hafatra efa vonona`, af:`Répondez en moins d'1 h (Messenger/WhatsApp) avec des messages types prêts` },
 { k:'confiance', re: rx(['hosoka','arnaque','escroc','tsy azo itokisana','fraude']), mg:`Tsy fitokisana / hosoka`, fr:`Méfiance, arnaques signalées`,
   am:`Asehoy ny toerana, ny porofo fanaterana ary ny hevitry ny mpanjifa`, af:`Montrez votre adresse, des preuves de livraison et des avis de clients` },
 { k:'distance', re: rx(['lavitra','loin','province','tsy mitondra','pas de livraison']), mg:`Lavitra / tsy tafiditra ny faritra`, fr:`Zones non desservies / éloignement`,
   am:`Manolora fandefasana any amin'ny faritra na toerana fanangonana`, af:`Proposez l'envoi en province ou des points de retrait` },
 { k:'sansprix', o:'prix', mg:`Tsy asehon'ny mpivarotra ny vidiny`, fr:`Prix non affiché dans les annonces`,
   am:`Atero foana ny vidiny: lasa ny mpanjifa raha tsy misy`, af:`Publiez toujours le prix : les clients ignorent les annonces sans prix` },
 { k:'sansliv', o:'liv', mg:`Tsy lazaina ny fitaterana`, fr:`Livraison non mentionnée`,
   am:`Lazao ny fitaterana, na dia mandoa aza, miaraka amin'ny faritra sy ny fotoana`, af:`Annoncez la livraison, même payante, avec zones et délais` },
 { k:'sanscont', o:'cont', mg:`Tsy misy fifandraisana mazava`, fr:`Pas de contact clair (téléphone/WhatsApp)`,
   am:`Atero ny laharana sy WhatsApp amin'ny post rehetra`, af:`Mettez téléphone et WhatsApp dans chaque publication` },
 { k:'sansgar', o:'gar', mg:`Tsy misy antoka na torohevitra`, fr:`Ni garantie ni conseil / suivi`,
   am:`Atolory antoka, torohevitra maimaim-poana ary fanaraha-maso aorian'ny varotra`, af:`Offrez garantie, conseil technique gratuit et suivi après-vente` }
];

/* ---------- Analyse d'une publication (mise en cache) ---------- */
const cacheInfo = new WeakMap();
function info(p){
  let i = cacheInfo.get(p); if (i) return i;
  const x = nz(p.texte), nd = (x.match(DEM) || []).length + (x.includes('?') ? 1 : 0), no = (x.match(OFF) || []).length + (PRIX.test(x) ? 1 : 0);
  const cats = []; CATS.forEach((c, k) => { if (c.re.test(x)) cats.push(k); });
  i = { x, cats, t: nd > no ? 'd' : no > nd ? 'o' : 'n', prix: PRIX.test(x), liv: LIV.test(x), cont: CONT.test(x), gar: GAR.test(x),
        date: new Date(p.ajoute || Date.now()).getTime() - (p.jours || 0) * DAY };
  cacheInfo.set(p, i); return i;
}

/* ---------- Séries, tendance, prévisions ---------- */
function serie(filtre){
  const now = Date.now(), d = new Array(NH).fill(0), o = new Array(NH).fill(0);
  S.posts.forEach(p => {
    const i = info(p); if (!filtre(i)) return;
    const k = Math.floor((now - i.date) / DAY); if (k < 0 || k >= NH) return;
    if (i.t === 'd') d[k]++; else if (i.t === 'o') o[k]++;
  });
  return { d: d.reverse(), o: o.reverse() };            // du plus ancien à aujourd'hui
}
function proj(y, h){                                     // régression linéaire, bornée
  const n = y.length, mx = (n - 1) / 2, my = sum(y) / n; let num = 0, den = 0;
  y.forEach((v, i) => { num += (i - mx) * (v - my); den += (i - mx) ** 2; });
  const b = den ? num / den : 0, a = my - b * mx, cap = Math.max(my * 3, 1), out = [];
  for (let k = 0; k < h; k++) out.push(Math.min(cap, Math.max(0, a + b * (n + k))));
  return out;
}
const bins = (a, n, size) => Array.from({ length: n }, (_, m) => sum(a.slice(a.length - size * (n - m), a.length - size * (n - m - 1))));
function previsions(filtre){
  const s = serie(filtre), yd = s.d.slice(-90), yo = s.o.slice(-90);
  return { s, yd, yo, pd: proj(yd, 365), po: proj(yo, 365), n90: sum(yd) + sum(yo) };
}
function horizon(pv, h){
  const ed = sum(pv.pd.slice(0, h)), eo = sum(pv.po.slice(0, h)), bd = sum(pv.yd) / 90 * h, bo = sum(pv.yo) / 90 * h;
  return { ed, eo, td: bd ? (ed - bd) / bd : 0, to: bo ? (eo - bo) / bo : 0 };
}

/* ---------- Graphique SVG (historique plein, prévision en pointillés) ---------- */
function chart(series, nHist, labs){
  const W = 340, H = 170, p = { l: 28, r: 8, t: 10, b: 22 }, n = nHist + series[0].fc.length;
  const mx = Math.max(1, ...series.flatMap(s => s.hist.concat(s.fc)));
  const X = i => p.l + (W - p.l - p.r) * i / (n - 1), Y = v => H - p.b - (H - p.t - p.b) * v / mx;
  let g = '';
  [0, .5, 1].forEach(f => { const v = mx * f; g += `<line x1="${p.l}" x2="${W - p.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e1e6d8"/><text x="2" y="${Y(v) + 3}" font-size="9" fill="#6b7a6f">${Math.round(v * 10) / 10}</text>`; });
  g += `<line x1="${X(nHist - 1)}" x2="${X(nHist - 1)}" y1="${p.t}" y2="${H - p.b}" stroke="#b9c3ab" stroke-dasharray="2 3"/>`;
  series.forEach(s => {
    const h = s.hist.map((v, i) => X(i) + ',' + Y(v)).join(' '), f = [s.hist[nHist - 1]].concat(s.fc).map((v, i) => X(nHist - 1 + i) + ',' + Y(v)).join(' ');
    g += `<polyline points="${h}" fill="none" stroke="${s.c}" stroke-width="2.2" stroke-linejoin="round"/><polyline points="${f}" fill="none" stroke="${s.c}" stroke-width="2.2" stroke-dasharray="5 4"/>`;
  });
  labs.forEach(([i, t]) => { g += `<text x="${X(i)}" y="${H - 6}" font-size="9" text-anchor="middle" fill="#6b7a6f">${t}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" class="w-full">${g}</svg>`;
}

/* ---------- Statistiques par produit / service ---------- */
function catStats(){
  const now = Date.now(), st = CATS.map((c, k) => ({ k, c, d: 0, o: 0, n: 0, r: 0, p: 0 }));
  S.posts.forEach(p => {
    const i = info(p), age = (now - i.date) / DAY; if (age > NH || age < 0) return;
    i.cats.forEach(k => {
      const s = st[k];
      if (i.t === 'd') { s.d++; if (age < 14) s.r++; else if (age < 28) s.p++; } else if (i.t === 'o') s.o++; else s.n++;
    });
  });
  st.forEach(s => { s.tr = s.p ? (s.r - s.p) / s.p : (s.r > 0 ? 1 : 0); s.sc = s.d * (s.d + 1) / (s.o + 1); });
  return st;
}
function statut(s){
  if (s.d >= 2 && s.d > s.o * 1.5) return 'porte';
  if (s.o >= 3 && s.o > s.d * 1.5) return 'sature';
  return s.d + s.o ? 'equilibre' : 'aucun';
}
const ST = { porte: ['#2f6b45', () => M(`Varavarana`, `Porte d'entrée`)], sature: ['#a63d2f', () => M(`Feno`, `Saturé`)], equilibre: ['#b08a1c', () => M(`Mahatoky`, `Équilibré`)], aucun: ['#8a958c', () => '—'] };
const puceSt = s => `<span style="background:${ST[statut(s)][0]};color:#fff;border-radius:999px;font-size:10px;font-weight:700;padding:2px 8px">${ST[statut(s)][1]()}</span>`;
const nom = s => M(s.c.mg, s.c.fr);
const fl = v => v > .15 ? `<span style="color:#2f6b45">↗ ${pct(v)}</span>` : v < -.15 ? `<span style="color:#a63d2f">↘ ${pct(v)}</span>` : `<span style="color:#6b7a6f">→</span>`;
const box = h => `<div class="carte p-4 space-y-2">${h}</div>`;
const barre = (d, o) => `<div class="barre"><i style="width:${d + o ? d / (d + o) * 100 : 0}%;background:#2f6b45"></i><i style="width:${d + o ? o / (d + o) * 100 : 0}%;background:#a63d2f"></i></div>`;

/* ---------- Onglets ---------- */
function vuePorte(st){
  const D = sum(st.map(s => s.d)), O = sum(st.map(s => s.o));
  const portes = st.filter(s => statut(s) === 'porte').sort((a, b) => b.sc - a.sc).slice(0, 3);
  let h = box(`<h2 class="font-bold text-sm">${M(`Fangatahana vs Tolotra`, `Demande vs Offre`)}</h2>${barre(D, O)}
    <p class="text-xs"><b style="color:#2f6b45">${D}</b> ${M('fangatahana', 'demandes')} · <b style="color:#a63d2f">${O}</b> ${M('tolotra', 'offres')} · ${M('tahan\'ny fangatahana/tolotra', 'ratio')} <b>${O ? (D / O).toFixed(1) : (D ? '∞' : '0')}</b></p>`);
  h += box(`<h2 class="font-bold text-sm">🚪 ${M(`Varavarana hidiran'ny tsena`, `Points d'entrée sur le marché`)}</h2>` + (portes.length ? portes.map(s => {
    const f = horizon(previsions(i => i.cats.includes(s.k)), 90);
    return `<div class="rounded-xl p-3" style="background:#eef1e6"><div class="flex justify-between"><b>${nom(s)}</b>${puceSt(s)}</div>
      <p class="text-xs mt-1">${s.d} ${M('fangatahana', 'demandes')} / ${s.o} ${M('tolotra', 'offres')} · ${M('Tombana 90 andro', 'Estimation 90 j')} : ≈${Math.round(f.ed)} ${M('fangatahana', 'demandes')} ${fl(f.td)}</p></div>`;
  }).join('') : `<p class="text-xs opacity-70">${M(`Tsy mbola misy varavarana mazava. Ampio lahatsoratra bebe kokoa.`, `Aucun point d'entrée net pour l'instant. Ajoutez plus de publications.`)}</p>`));
  const act = st.filter(s => s.d + s.o + s.n > 0).sort((a, b) => b.sc - a.sc);
  h += box(`<h2 class="font-bold text-sm">${M(`Vokatra sy tolotra rehetra`, `Tous les produits et services`)}</h2>` + (act.map(s =>
    `<div><div class="flex justify-between text-xs mb-1"><span>${s.c.t === 'p' ? '📦' : '🛠️'} <b>${nom(s)}</b></span>${puceSt(s)}</div>${barre(s.d, s.o)}
     <div class="text-[11px] opacity-70">${s.d} ${M('fangatahana', 'demandes')} · ${s.o} ${M('tolotra', 'offres')}</div></div>`).join('') || `<p class="text-xs opacity-70">${M('Tsy mbola misy angona.', 'Pas encore de données.')}</p>`));
  return h;
}

function vueEvol(){
  const filtre = i => mSujet ? i.x.includes(nz(mSujet)) : (mCat === '' ? true : i.cats.includes(+mCat));
  const pv = previsions(filtre), s = pv.s, J = mMode === 'jours';
  const hd = J ? s.d.slice(-30) : bins(s.d, 6, 30), ho = J ? s.o.slice(-30) : bins(s.o, 6, 30);
  const fd = J ? pv.pd.slice(0, 7) : bins(pv.pd.slice(0, 360), 12, 30), fo = J ? pv.po.slice(0, 7) : bins(pv.po.slice(0, 360), 12, 30);
  const labs = J ? [[0, '-30j'], [29, M('Androany', 'Auj.')], [36, '+7j']] : [[0, '-6m'], [5, M('Ankehitriny', 'Auj.')], [17, '+12m']];
  const conf = pv.n90 < 15 ? [M('Ambany', 'Faible'), '#a63d2f'] : pv.n90 < 60 ? [M('Antonony', 'Moyenne'), '#b08a1c'] : [M('Avo', 'Bonne'), '#2f6b45'];
  let h = box(`<div class="grid grid-cols-2 gap-2">
      <select class="champ" onchange="setCat(this.value)"><option value="">${M('Tsena manontolo', 'Tout le marché')}</option>${CATS.map((c, k) => `<option value="${k}" ${mCat === '' + k ? 'selected' : ''}>${c.t === 'p' ? '📦' : '🛠️'} ${nom({ c })}</option>`).join('')}</select>
      <input class="champ" value="${esc(mSujet)}" placeholder="${M('Teny fanalahidy malalaka', 'Mot-clé libre')}" onchange="setSujet(this.value)"></div>
    <div class="flex gap-2"><button class="puce ${J ? 'on' : ''}" onclick="setMode('jours')">${M('Andro', 'Jours')}</button><button class="puce ${J ? '' : 'on'}" onclick="setMode('mois')">${M('Volana', 'Mois')}</button></div>
    ${chart([{ c: '#2f6b45', hist: hd, fc: fd }, { c: '#a63d2f', hist: ho, fc: fo }], hd.length, labs)}
    <p class="text-[11px]"><b style="color:#2f6b45">━ ${M('Fangatahana', 'Demande')}</b> &nbsp; <b style="color:#a63d2f">━ ${M('Tolotra', 'Offre')}</b> &nbsp; ┅ ${M('tombana', 'estimation')}</p>`);
  const cards = [[7, M('7 andro', '7 jours')], [90, M('3 volana', '3 mois')], [365, M('1 taona', '1 an')]].map(([n, t]) => {
    const f = horizon(pv, n), lecture = f.ed > f.eo * 1.3 ? M('Filàna tsy voafehy', 'Besoin non couvert') : f.eo > f.ed * 1.3 ? M('Mety ho feno', 'Risque de saturation') : M('Mahatoky', 'Équilibré');
    return `<div class="rounded-xl p-2 text-center" style="background:#eef1e6"><div class="text-[11px] font-bold">${t}</div>
      <div class="text-sm font-extrabold" style="color:#2f6b45">≈${Math.round(f.ed)}</div><div class="text-[10px]">${fl(f.td)}</div>
      <div class="text-sm font-extrabold" style="color:#a63d2f">≈${Math.round(f.eo)}</div><div class="text-[10px]">${fl(f.to)}</div>
      <div class="text-[10px] mt-1">${lecture}</div></div>`;
  }).join('');
  h += box(`<h2 class="font-bold text-sm">${M('Tombana ho avy', 'Estimation à venir')}</h2><div class="grid grid-cols-3 gap-2">${cards}</div>
    <p class="text-[11px] opacity-80">${M('Azo itokisana', 'Fiabilité')} : <b style="color:${conf[1]}">${conf[0]}</b> (${pv.n90} ${M('lahatsoratra tao anatin\'ny 90 andro', 'publications sur 90 jours')}). ${M('Tombana fotsiny; arakaraka ny habetsahan\'ny angona no hitombo ny hatsaran-te-hevitra.', 'Estimation indicative : plus vous collectez de publications, plus elle devient fiable.')}</p>`);
  return h;
}

function ligneTop(s, i, max){
  return `<div class="text-xs"><div class="flex justify-between"><span><b>${i + 1}.</b> ${nom(s)}</span><span>${s.d} ${M('fangatahana', 'demandes')} · ${s.o} ${M('tolotra', 'offres')} ${fl(s.tr)}</span></div>
    <div class="barre mt-1"><i style="width:${max ? s.d / max * 100 : 0}%;background:${s.d ? '#2f6b45' : '#cfd6c3'}"></i></div></div>`;
}
function vueBilan(st){
  const top = t => st.filter(s => s.c.t === t).sort((a, b) => b.d - a.d || b.n - a.n || b.o - a.o).slice(0, 10);
  const tp = top('p'), ts = top('s'), D = sum(st.map(s => s.d)), O = sum(st.map(s => s.o));
  const hausse = st.filter(s => s.d >= 2 && s.tr >= .25).sort((a, b) => b.tr - a.tr).slice(0, 3);
  const portes = st.filter(s => statut(s) === 'porte').sort((a, b) => b.sc - a.sc).slice(0, 3);
  const satur = st.filter(s => statut(s) === 'sature').slice(0, 3);
  const li = (t, a) => a.length ? `<li>${t} ${a.map(nom).join(', ')}</li>` : '';
  const top1 = tp[0] && tp[0].d ? tp[0] : null;
  let fut = '';
  if (top1) { const f = horizon(previsions(i => i.cats.includes(top1.k)), 90); fut = `<li>🔮 ${nom(top1)} : ≈${Math.round(f.ed)} ${M('fangatahana ao anatin\'ny 3 volana', 'demandes attendues sous 3 mois')} ${fl(f.td)}</li>`; }
  const futures = li('🚀 ' + M('Mitombo:', 'En hausse :'), hausse) + li('🚪 ' + M('Varavarana:', 'Portes d\'entrée :'), portes) + li('⚠️ ' + M('Efa feno:', 'Déjà saturés :'), satur) + fut;
  return box(`<h2 class="font-bold text-sm">📊 ${M('Famintinana farany ny tsena', 'Bilan final du marché')}</h2>
      <p class="text-xs">${S.posts.length} ${M('lahatsoratra nodinihina', 'publications analysées')} · <b style="color:#2f6b45">${D}</b> ${M('fangatahana', 'demandes')} · <b style="color:#a63d2f">${O}</b> ${M('tolotra', 'offres')}</p>`)
    + box(`<h2 class="font-bold text-sm">📦 ${M('Vokatra 10 be fangatahana', 'Top 10 produits les plus demandés')}</h2>${tp.map((s, i) => ligneTop(s, i, tp[0].d)).join('')}`)
    + box(`<h2 class="font-bold text-sm">🛠️ ${M('Tolotra 10 be fangatahana', 'Top 10 services les plus demandés')}</h2>${ts.map((s, i) => ligneTop(s, i, ts[0].d)).join('')}`)
    + box(`<h2 class="font-bold text-sm">🔮 ${M('Hoavin\'ny tsena hita', 'Futurs du marché identifiés')}</h2><ul class="text-xs space-y-1 list-none">${futures || `<li class="opacity-70">${M('Tsy ampy ny angona.', 'Pas assez de données.')}</li>`}</ul>`)
    + `<button onclick="window.print()" class="btn btn-l w-full">🖨️ ${M('Hanonta / PDF', 'Imprimer / PDF')}</button>`;
}

function faiblesses(){
  const P = S.posts.map(info), off = P.filter(i => i.t === 'o'), L = [];
  FAIB.forEach(f => {
    const tot = f.o ? off.length : P.length, c = f.o ? off.filter(i => !i[f.o]).length : P.filter(i => f.re.test(i.x)).length;
    if (c > 0 && tot > 0) L.push({ f, c, tot, p: c / tot });
  });
  return L.sort((a, b) => b.p - a.p);
}
function vueStrat(st){
  const fb = faiblesses(), top = fb.slice(0, 4);
  const portes = st.filter(s => statut(s) === 'porte').sort((a, b) => b.sc - a.sc).slice(0, 3);
  const cibles = portes.length ? portes : st.filter(s => s.d > 0).sort((a, b) => b.d - a.d).slice(0, 3);
  const noms = cibles.map(nom).join(', ') || '—', nP = S.posts.filter(FILTRES.acontacter).length;
  const E = [
    [M('1. Tanjona', '1. Cible'), M(`Atombohy amin'ny: ${noms}. Misy mpanjifa ${nP} hantsoina ao amin'ny lisitra.`, `Démarrez par : ${noms}. ${nP} prospect(s) à contacter dans vos listes.`)],
    [M('2. Fanavahana', '2. Différenciation'), top.length ? top.map(x => '• ' + M(x.f.am, x.f.af)).join('<br>') : M('Tsy ampy ny angona: ampio lahatsoratra.', 'Pas assez de données : collez plus de publications.')],
    [M('3. Vidiny sy tolotra', '3. Prix et offre'), M(`Asehoy mazava ny vidiny, omeo andrana kely; ampifanaraho amin'ny mpivarotra nefa aoka ho tsara kokoa ny kalitao sy ny serivisy.`, `Prix affiché, lot d'essai ; alignez-vous sur les revendeurs sans casser les prix et gagnez sur la qualité et le service.`)],
    [M('4. Fizarana', '4. Distribution'), M(`Fitaterana mazava + toerana fanangonana any amin'ny faritra be fangatahana indrindra.`, `Livraison claire + points de retrait dans les zones où la demande est la plus forte.`)],
    [M('5. Fifandraisana', '5. Communication'), M(`Mamalia ao anatin'ny 1 ora; ampiasao ny hafatra MP ao amin'ny Profil; posteo isan'andro ny vokatra sy ny porofo.`, `Réponse en moins d'1 h ; message MP du Profil ; publiez chaque jour produits et preuves (photos, avis).`)],
    [M('6. Tanjona isa', '6. Parts de marché'), M(`Tanjona fampiharana: 10% amin'ny mpanjifa hita ao anatin'ny 30 andro, avy eo 20-30% ao anatin'ny 3 volana. Araho ao amin'ny Gazety sy Profil.`, `Objectif indicatif : convertir 10 % des prospects en 30 jours, puis 20-30 % en 3 mois. Suivi dans le Journal et le Profil.`)]
  ];
  return box(`<h2 class="font-bold text-sm">🔎 ${M('Fahalemena hita amin\'ny mpivarotra', 'Faiblesses des vendeurs / revendeurs')}</h2>` + (fb.length ? fb.map(x =>
      `<div class="text-xs"><div class="flex justify-between"><span>${M(x.f.mg, x.f.fr)}</span><b>${x.c}/${x.tot} · ${Math.round(x.p * 100)}%</b></div><div class="barre mt-1"><i style="width:${x.p * 100}%;background:#a63d2f"></i></div></div>`).join('')
      : `<p class="text-xs opacity-70">${M('Tsy mbola hita ny fahalemena. Ampidiro ny lahatsoratra (fangatahana sy tolotra).', 'Aucune faiblesse détectée. Collez des publications (demandes et offres de vendeurs).')}</p>`))
    + box(`<h2 class="font-bold text-sm">🎯 ${M('Tetika varotra hahazoana tsena', 'Stratégie de vente pour gagner des parts de marché')}</h2>` + E.map(e => `<div class="text-xs"><b style="color:#1f4d33">${e[0]}</b><br>${e[1]}</div>`).join(''))
    + `<button onclick="window.print()" class="btn btn-l w-full">🖨️ ${M('Hanonta / PDF', 'Imprimer / PDF')}</button>`;
}

/* ---------- Données d'exemple (pour tester les graphiques) ---------- */
function demo(){
  let sd = 7; const R = () => (sd = sd * 16807 % 2147483647) / 2147483647, pick = a => a[Math.floor(R() * a.length)];
  const dPool = [0,0,0,0,0,6,6,6,6,1,1,1,2,3,3,4,5,7,8,9,10,11,14,14,14,15,15,16,17,18,19,20,22,23], oPool = [1,1,1,1,1,4,4,4,2,2,6,3,0,7,9,10];
  for (let i = 0; i < 80; i++) {
    const off = i % 3 === 2, k = pick(off ? oPool : dPool), c = CATS[k], fr = c.fr.split(' / ')[0].toLowerCase(), mg = c.mg.split(' / ')[0].toLowerCase(), prix = 5 + Math.floor(R() * 40) * 1000;
    const j = (!off && (k === 0 || k === 6) && R() < .65) ? Math.floor(R() * 14) : Math.floor(R() * 75);
    const T0 = off ? [`Mivarotra ${mg} ${prix} Ar, livraison gratuite. Antsoy 034 12 345 67`, `À vendre ${fr}, disponible, prix ${prix} Ar`, `${fr} disponible, promo cette semaine !`, `Nous proposons ${fr} de qualité, garantie et suivi, contactez-nous en inbox`]
      : [`Mila ${mg} tsara, iza no misy mivarotra ?`, `Je cherche ${fr} à Antananarivo, qui vend ?`, `Besoin de ${fr}, où trouver svp ?`, `Mitady ${mg} aho, ohatrinona ny vidiny ?`, `${fr} trop cher chez les revendeurs, pas de réponse et livraison en retard`, `Lafo loatra ny ${mg} ary tara ny fandefasana, tsy mamaly ny mpivarotra`];
    S.posts.push({ id: 'x' + i + Date.now().toString(36), temps: lang === 'mg' ? `Tamin'ny ${j} andro lasa` : `Il y a ${j} jours`, texte: pick(T0), lien: '#demo' + i, jours: j, ajoute: new Date().toISOString(), contacte: false, fav: false, ecarte: false, prospect: false, mots: [], demo: true });
  }
  save(); renderTout();
}
function sansDemo(){ S.posts = S.posts.filter(p => !p.demo); save(); renderTout(); }

/* ---------- Affichage ---------- */
const setSub = k => { mSub = k; renderMarche(); }, setMode = k => { mMode = k; renderMarche(); },
      setCat = v => { mCat = v; mSujet = ''; renderMarche(); }, setSujet = v => { mSujet = v.trim(); renderMarche(); };
function renderMarche(){
  const nav = $('navMarche'); if (nav) nav.textContent = M('Tsena', 'Marché');
  const v = $('v-marche'); if (!v) return;
  const st = catStats();
  const subs = [['porte', M('Fangatahana/Tolotra', 'Demande/Offre')], ['evol', M('Fivoarana', 'Évolution')], ['bilan', M('Famintinana', 'Bilan')], ['strat', M('Tetika', 'Stratégie')]];
  const corps = mSub === 'porte' ? vuePorte(st) : mSub === 'evol' ? vueEvol() : mSub === 'bilan' ? vueBilan(st) : vueStrat(st);
  const hasDemo = S.posts.some(p => p.demo);
  v.innerHTML = `<div class="flex gap-2 overflow-x-auto pb-1">${subs.map(([k, t]) => `<button class="puce ${k === mSub ? 'on' : ''}" onclick="setSub('${k}')">${t}</button>`).join('')}</div>`
    + (S.posts.length ? '' : `<p class="text-xs text-center opacity-70 py-2">${M(`Tsy mbola misy angona. Adika ao amin'ny « Sivana » ny lahatsoratra, na andramo ny santionany.`, `Pas encore de données. Collez des publications dans « Filtrer », ou essayez les exemples.`)}</p>`)
    + corps
    + `<button onclick="${hasDemo ? 'sansDemo()' : 'demo()'}" class="btn btn-l w-full">${hasDemo ? M('Esory ny santionany', 'Retirer les exemples') : M('Ampidiro ny angona santionany', "Charger des données d'exemple")}</button>`;
}

/* Intégration à l'application existante */
const _show = show; show = function(v){ _show(v); if (v === 'marche') renderMarche(); };
const _renderTout = renderTout; renderTout = function(){ _renderTout(); renderMarche(); };
renderMarche();
