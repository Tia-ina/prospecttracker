const L = {
  mg: {
    titre:"🎯 Mpitady Mpanjifa", sousTitre:"Sivana ireo olona mila ny tolotranao ao amin'ny Facebook.",
    paramTitre:"⚙️ Fikirana (Paramètres)", lblSujets:"Vatanteny / Sujets (sarahina amin'ny `,`) :",
    lblIntentions:"Teny fitadiavana / Mots d'intention :", lblJours:"Fetran'andro (Limite en jours) :",
    lblFlux:"Adika eto ny lahatsoratra (Andro | Lahatsoratra | Rohy) :", btnFiltrer:"Sivana ny Lahatsoratra ➔",
    navFiltrer:"Sivana", navListes:"Lisitra", navJournal:"Gazety", navProfil:"Profil",
    rechercher:"Hitady ao amin'ny lahatsoratra…", triRecent:"Vaovao aloha", triAncien:"Taloha aloha",
    cTous:"Rehetra", cProspects:"Mpanjifa", cAcontacter:"Hantsoina", cContactes:"Efa nantsoina", cFavoris:"Tiana", cEcartes:"Nolavina",
    nbPub:n=>n+" lahatsoratra", resume:(a,b,c)=>`${a} nodinihina · ${b} vaovao · ${c} mpanjifa`,
    badge:"🎯 Mpanjifa", voir:"Jereo", mp:"Mandefa MP", contacte:"Efa nantsoina ✓", ecarter:"Lavina", restaurer:"Averina",
    aucun:"Tsy misy lahatsoratra eto. Tsindrio ny « Sivana » mba hanomboka.",
    jTous:"Rehetra", jAnalyse:"Fanadihadiana", jContact:"Fifandraisana", jFavori:"Tiana", jEcart:"Fanafoanana",
    jAnalyseTxt:(a,b,c)=>`Nodinihina ${a} · vaovao ${b} · mpanjifa ${c}`, jContactTxt:t=>"MP/fifandraisana : "+t,
    jFavTxt:t=>"Tiana : "+t, jEcartTxt:t=>"Nolavina : "+t, jRestTxt:t=>"Naverina : "+t,
    jVide:"Mbola foana ny gazety.", viderJournal:"Fafana ny gazety", confirmJ:"Fafana ny gazety rehetra ?",
    statsTitre:"📊 Antontan-kevitra", sAnalyses:"Nodinihina", sProspects:"Mpanjifa", sContactes:"Efa nantsoina", sTaux:"Taha",
    profilTitre:"👤 Ny profilko", pNom:"Anarana", pEnt:"Orinasa", pTel:"Telefaona", pMail:"E-mail", pOffre:"Ny tolotra (fohy)",
    pMsg:"Hafatra MP", pMsgAide:"Ampiasao {nom}, {ent}, {offre}. Voadika ho azy rehefa tsindrio « Mandefa MP ».",
    exporter:"Mamoaka kopia", toutEffacer:"Fafana ny rehetra", confirmT:"Fafana ny angona rehetra ?",
    toastMp:"Voadika ny hafatra. Apetraho ao amin'ny Messenger.", toastSave:"Voatahiry",
    msgDefaut:"Salama! Hitako ny fangatahanao tao amin'ny Facebook. Izaho {nom} ao amin'ny {ent}, afaka manampy anao amin'ny fiompiana. {offre}"
  },
  fr: {
    titre:"🎯 ProspectTracker Pro", sousTitre:"Filtrez vos prospects et contactez-les en un clic.",
    paramTitre:"⚙️ Paramètres de recherche", lblSujets:"Sujets clés (séparés par des virgules) :",
    lblIntentions:"Mots d'intention (besoin, question…) :", lblJours:"Limite d'ancienneté (en jours) :",
    lblFlux:"Collez le flux (Format : Date | Texte | Lien) :", btnFiltrer:"Lancer le filtrage ➔",
    navFiltrer:"Filtrer", navListes:"Listes", navJournal:"Journal", navProfil:"Profil",
    rechercher:"Rechercher dans les publications…", triRecent:"Plus récentes", triAncien:"Plus anciennes",
    cTous:"Toutes", cProspects:"Prospects", cAcontacter:"À contacter", cContactes:"Contactés", cFavoris:"Favoris", cEcartes:"Écartées",
    nbPub:n=>n+(n>1?" publications":" publication"), resume:(a,b,c)=>`${a} analysées · ${b} nouvelles · ${c} prospects`,
    badge:"🎯 Prospect qualifié", voir:"Voir", mp:"Envoyer MP", contacte:"Contacté ✓", ecarter:"Écarter", restaurer:"Rétablir",
    aucun:"Aucune publication ici. Lancez un filtrage pour commencer.",
    jTous:"Tout", jAnalyse:"Analyses", jContact:"Contacts", jFavori:"Favoris", jEcart:"Écartées",
    jAnalyseTxt:(a,b,c)=>`Analyse : ${a} lues, ${b} nouvelles, ${c} prospects`, jContactTxt:t=>"Contact : "+t,
    jFavTxt:t=>"Favori : "+t, jEcartTxt:t=>"Écartée : "+t, jRestTxt:t=>"Rétablie : "+t,
    jVide:"Le journal est vide.", viderJournal:"Vider le journal", confirmJ:"Vider tout le journal ?",
    statsTitre:"📊 Statistiques", sAnalyses:"Analysées", sProspects:"Prospects", sContactes:"Contactés", sTaux:"Taux de contact",
    profilTitre:"👤 Mon profil", pNom:"Nom", pEnt:"Entreprise", pTel:"Téléphone", pMail:"E-mail", pOffre:"Mon offre (court)",
    pMsg:"Message MP", pMsgAide:"Utilisez {nom}, {ent}, {offre}. Copié automatiquement avec « Envoyer MP ».",
    exporter:"Exporter une copie", toutEffacer:"Tout effacer", confirmT:"Effacer toutes les données ?",
    toastMp:"Message copié. Collez-le dans Messenger.", toastSave:"Enregistré",
    msgDefaut:"Bonjour ! J'ai vu votre publication. Je suis {nom} de {ent}, nous pouvons vous aider pour votre élevage. {offre}"
  }
};

let lang = 'mg', filtre = 'tous', filtreJ = 'tous';
let S = { posts:[], journal:[], profil:{ nom:'', ent:'T.A.S (Trafo AgroSystème)', tel:'+261 38 93 056 91', mail:'t.a.strafo@gmail.com', offre:'', msg:'' } };
try {
  const d = JSON.parse(localStorage.getItem('pt_data') || 'null'); if (d) S = Object.assign(S, d);
  lang = localStorage.getItem('pt_lang') || 'mg';
} catch (e) {}

const $ = id => document.getElementById(id);
const T = () => L[lang];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){ try { localStorage.setItem('pt_data', JSON.stringify(S)); } catch (e) {} }
function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('on'); setTimeout(()=>t.classList.remove('on'),2200); }
function log(type, txt){ S.journal.unshift({ t:new Date().toISOString(), type, txt }); save(); }

/* ---------- Langue ---------- */
function changerLangue(){ lang = $('selectLangue').value; try{localStorage.setItem('pt_lang',lang);}catch(e){} appliquerLangue(); }
function appliquerLangue(){
  const t = T(); $('selectLangue').value = lang; document.documentElement.lang = lang;
  $('uiTitre').textContent = t.titre;
  document.querySelectorAll('[data-i18n]').forEach(e => e.textContent = t[e.dataset.i18n]);
  document.querySelectorAll('[data-ph]').forEach(e => e.placeholder = t[e.dataset.ph]);
  renderTout();
}

/* ---------- Navigation ---------- */
function show(v){
  document.querySelectorAll('.view').forEach(e => e.classList.toggle('on', e.id === 'v-'+v));
  document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === v));
  window.scrollTo(0,0);
  if (v==='listes') renderListe(); if (v==='journal') renderJournal(); if (v==='profil') renderProfil();
}

/* ---------- Analyse ---------- */
function ageEnJours(s){
  const m = s.match(/\d+/); let n = m ? parseInt(m[0]) : 0; const l = s.toLowerCase();
  if (/semaine|herinandro/.test(l)) n *= 7; else if (/mois|volana/.test(l)) n *= 30;
  return n;
}
const liste = id => $(id).value.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
function classer(p, sujets, intentions, limite){
  const low = p.texte.toLowerCase();
  const s = sujets.filter(x => low.includes(x)), i = intentions.filter(x => low.includes(x));
  p.mots = s.concat(i); p.prospect = p.jours <= limite && s.length > 0 && i.length > 0;
}
function analyser(){
  const sujets = liste('inputSujets'), intentions = liste('inputIntentions'), limite = parseInt($('inputJours').value) || 30;
  let lues = 0, nouvelles = 0;
  $('fluxInput').value.split('\n').forEach(ligne => {
    const p = ligne.split('|'); if (p.length < 3) return;
    const temps = p[0].trim(), texte = p[1].trim(), lien = p[2].trim(); if (!texte) return;
    lues++;
    let post = S.posts.find(x => (lien && x.lien === lien) || (!lien && x.texte === texte));
    if (!post) {
      post = { id: Date.now().toString(36)+Math.random().toString(36).slice(2,6), temps, texte, lien, jours: ageEnJours(temps),
               ajoute: new Date().toISOString(), contacte:false, fav:false, ecarte:false };
      S.posts.unshift(post); nouvelles++;
    }
    classer(post, sujets, intentions, limite);
  });
  const nbP = S.posts.filter(p => p.prospect && !p.ecarte).length;
  log('analyse', T().jAnalyseTxt(lues, nouvelles, nbP)); save();
  $('resume').textContent = T().resume(lues, nouvelles, nbP);
  renderTout();
  if (lues) { filtre = 'prospects'; show('listes'); }
}

/* ---------- Listes ---------- */
const FILTRES = {
  tous: p => true,
  prospects: p => p.prospect && !p.ecarte,
  acontacter: p => p.prospect && !p.ecarte && !p.contacte,
  contactes: p => p.contacte,
  favoris: p => p.fav,
  ecartes: p => !p.prospect || p.ecarte
};
const NOMS = { tous:'cTous', prospects:'cProspects', acontacter:'cAcontacter', contactes:'cContactes', favoris:'cFavoris', ecartes:'cEcartes' };

function renderPuces(cont, items, actif, fnClick){
  $(cont).innerHTML = items.map(([k, nom, n]) =>
    `<button class="puce ${k===actif?'on':''}" onclick="${fnClick}('${k}')">${nom}${n!==undefined?`<b>${n}</b>`:''}</button>`).join('');
}
function setFiltre(k){ filtre = k; renderListe(); }
function renderListe(){
  const t = T();
  renderPuces('puces', Object.keys(FILTRES).map(k => [k, t[NOMS[k]], S.posts.filter(FILTRES[k]).length]), filtre, 'setFiltre');
  const q = $('recherche').value.toLowerCase().trim(), sens = $('tri').value === 'a' ? -1 : 1;
  const res = S.posts.filter(FILTRES[filtre]).filter(p => !q || p.texte.toLowerCase().includes(q))
    .sort((a,b) => sens * (a.jours - b.jours));
  $('nbListe').textContent = t.nbPub(res.length);
  $('liste').innerHTML = res.length ? res.map(carte).join('') : `<p class="text-xs opacity-60 italic py-6 text-center">${t.aucun}</p>`;
  const n = S.posts.filter(FILTRES.acontacter).length;
  $('bListes').hidden = !n; $('bListes').textContent = n;
}
function carte(p){
  const t = T(), bord = p.prospect && !p.ecarte ? 'var(--or)' : 'var(--ligne)';
  const mots = (p.mots||[]).map(m => `<span class="mot">${esc(m)}</span>`).join(' ');
  return `<article class="carte p-3 text-xs" style="border-left:5px solid ${bord}">
    <div class="flex justify-between items-center mb-2">
      <span class="font-bold" style="color:var(--vert)">${p.prospect&&!p.ecarte?t.badge:''}</span>
      <span class="text-[11px] px-2 py-0.5 rounded-full" style="background:#eef1e6">${esc(p.temps)}</span>
    </div>
    <p class="text-[13px] leading-snug mb-2">${esc(p.texte)}</p>
    <div class="flex flex-wrap gap-1 mb-3">${mots}</div>
    <div class="grid grid-cols-2 gap-2 mb-2">
      <a href="${esc(p.lien)}" target="_blank" rel="noopener" class="btn btn-l">👁️ ${t.voir}</a>
      <button onclick="contacter('${p.id}')" class="btn btn-v">💬 ${t.mp}</button>
    </div>
    <div class="flex gap-2">
      <button class="act" onclick="basculer('${p.id}','fav')">${p.fav?'★':'☆'}</button>
      <button class="act" onclick="basculer('${p.id}','contacte')" style="${p.contacte?'background:#e6efdc':''}">${t.contacte}</button>
      <button class="act ml-auto" onclick="basculer('${p.id}','ecarte')">${p.ecarte||!p.prospect?'↺ '+t.restaurer:'✕ '+t.ecarter}</button>
    </div></article>`;
}
function coupe(p){ return p.texte.length > 50 ? p.texte.slice(0,50)+'…' : p.texte; }
function basculer(id, champ){
  const p = S.posts.find(x => x.id === id); if (!p) return; const t = T();
  if (champ === 'ecarte' && !p.prospect) { p.prospect = true; p.ecarte = false; log('ecart', t.jRestTxt(coupe(p))); }
  else {
    p[champ] = !p[champ];
    if (champ==='fav') log('favori', t.jFavTxt(coupe(p)));
    if (champ==='contacte' && p.contacte) log('contact', t.jContactTxt(coupe(p)));
    if (champ==='ecarte') log('ecart', (p.ecarte ? t.jEcartTxt : t.jRestTxt)(coupe(p)));
  }
  save(); renderTout();
}
function messagePerso(){
  const pr = S.profil, m = pr.msg || T().msgDefaut;
  return m.replace('{nom}', pr.nom || '').replace('{ent}', pr.ent || '').replace('{offre}', pr.offre || '').trim();
}
function contacter(id){
  const p = S.posts.find(x => x.id === id); if (!p) return;
  try { navigator.clipboard.writeText(messagePerso()); } catch (e) {}
  if (!p.contacte) { p.contacte = true; log('contact', T().jContactTxt(coupe(p))); save(); }
  toast(T().toastMp); renderTout();
  if (p.lien) window.open(p.lien, '_blank');
}

/* ---------- Journal ---------- */
function setFiltreJ(k){ filtreJ = k; renderJournal(); }
function renderJournal(){
  const t = T();
  renderPuces('pucesJ', [['tous',t.jTous],['analyse',t.jAnalyse],['contact',t.jContact],['favori',t.jFavori],['ecart',t.jEcart]], filtreJ, 'setFiltreJ');
  const ev = S.journal.filter(e => filtreJ==='tous' || e.type===filtreJ);
  if (!ev.length) { $('journal').innerHTML = `<p class="text-xs opacity-60 italic py-6 text-center">${t.jVide}</p>`; return; }
  const icones = { analyse:'🔎', contact:'💬', favori:'★', ecart:'✕' };
  let jour = '', html = '';
  ev.forEach(e => {
    const d = new Date(e.t), j = d.toLocaleDateString(lang==='mg'?'fr-MG':'fr-FR', { weekday:'long', day:'numeric', month:'long' });
    if (j !== jour) { jour = j; html += `<h3 class="text-xs font-bold pt-2" style="color:var(--vert2)">${esc(j)}</h3>`; }
    html += `<div class="carte px-3 py-2 text-xs flex gap-2 items-start"><span>${icones[e.type]||'•'}</span>
      <span class="flex-1">${esc(e.txt)}</span><span class="opacity-60">${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div>`;
  });
  $('journal').innerHTML = html;
}
function viderJournal(){ if (confirm(T().confirmJ)) { S.journal = []; save(); renderJournal(); } }

/* ---------- Profil ---------- */
function renderProfil(){
  const t = T(), pr = S.profil, pros = S.posts.filter(FILTRES.prospects).length, con = S.posts.filter(FILTRES.contactes).length;
  $('pNom').value = pr.nom; $('pEnt').value = pr.ent; $('pTel').value = pr.tel; $('pMail').value = pr.mail; $('pOffre').value = pr.offre;
  $('pMsg').value = pr.msg || t.msgDefaut;
  const taux = pros ? Math.round(con / pros * 100) + '%' : '0%';
  const cases = [[S.posts.length,t.sAnalyses],[pros,t.sProspects],[con,t.sContactes],[taux,t.sTaux]];
  $('stats').innerHTML = cases.map(([v,l]) => `<div class="rounded-xl py-3" style="background:#eef1e6"><div class="text-xl font-extrabold" style="color:var(--vert)">${v}</div><div class="text-[11px]">${l}</div></div>`).join('');
}
function saveProfil(){
  const pr = S.profil; pr.nom=$('pNom').value; pr.ent=$('pEnt').value; pr.tel=$('pTel').value; pr.mail=$('pMail').value; pr.offre=$('pOffre').value;
  pr.msg = $('pMsg').value === T().msgDefaut ? '' : $('pMsg').value; save(); toast(T().toastSave);
}
function exporter(){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], {type:'application/json'}));
  a.download = 'prospecttracker-' + new Date().toISOString().slice(0,10) + '.json'; a.click();
}
function toutEffacer(){
  if (!confirm(T().confirmT)) return;
  try { localStorage.removeItem('pt_data'); } catch (e) {} location.reload();
}

function renderTout(){ renderListe(); renderJournal(); renderProfil(); }
appliquerLangue();
