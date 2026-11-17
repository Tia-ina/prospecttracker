/* ===== Licence : essai de 3 jours + déverrouillage MVola (paiement unique par appareil) ===== */
const LIC = {
  api: 'https://script.google.com/macros/s/AKfycbw8ngLS0EsCPeRpC6SpSRDr6IpHlP_G0_ta-TiATPRkzhDWyZ3x1N3Le2Kbziy5LoeldQ/exec',      // adresse de api.php (adresse du script Google)
  verrouillees: ['marche', 'profil'],        // écrans payants une fois l'essai terminé
  filtresGratuits: ['tous', 'prospects'],
  paiement: '038 93 056 91'      // numéro MVola qui reçoit les paiements     // listes gratuites ; les autres sont payantes
};
const TEL = /^(?:\+?261|0)3[48]\d{7}$/;
let LS = null, _t = null;
const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

/* Identifiant d'appareil (et non l'IP : l'IP change avec le Wi-Fi / les données mobiles) */
let devId = lsGet('pt_dev');
if (!devId) {
  devId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => (Math.random() * 16 | 0).toString(16));
  lsSet('pt_dev', devId);
}
async function api(action, extra) {
  const r = await fetch(LIC.api, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(Object.assign({ action, device: devId }, extra)) });
  return r.json();
}
function charger() { try { LS = JSON.parse(lsGet('pt_lic') || 'null'); } catch (e) { LS = null; } }
function stocker(s) {
  LS = { statut: s.statut, fin: Date.now() + (s.reste || 0) * 1000, tel: s.tel || '', prix: s.prix };
  lsSet('pt_lic', JSON.stringify(LS));
}
function etat() {                                   // 'paye' | 'essai' | 'limite' | 'inconnu'
  if (!LS) return 'inconnu';
  if (LS.statut === 'paye') return 'paye';
  return LS.statut === 'essai' && Date.now() < LS.fin ? 'essai' : 'limite';
}

/* ---------- Fenêtre ---------- */
function ov(h, fermable) {
  let o = $('lic');
  if (!o) { o = document.createElement('div'); o.id = 'lic'; o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,40,28,.9);display:flex;align-items:center;justify-content:center;padding:20px'; document.body.appendChild(o); }
  o.innerHTML = `<div class="carte p-5 space-y-3 text-sm" style="max-width:360px;width:100%;position:relative">${fermable ? '<button onclick="licFermer()" style="position:absolute;right:12px;top:6px;font-size:20px">✕</button>' : ''}${h}<p id="licMsg" class="text-xs font-semibold" style="color:#a63d2f"></p><p class="text-[10px] opacity-60">ID : ${devId.slice(0, 8)}</p></div>`;
}
const licMsg = t => { const m = $('licMsg'); if (m) m.textContent = t; };
const sansReseau = () => M('Tsy misy tambajotra', 'Pas de connexion internet');
function licFermer() { const o = $('lic'); if (o) o.remove(); }
function fini() { licFermer(); clearInterval(_t); pastille(); renderTout(); toast(M('Voasokatra ny zava-drehetra ✓', 'Tout est débloqué ✓')); }

/* 1. Identification du numéro (obligatoire avant usage) */
function inscription() {
  ov(`<h2 class="font-extrabold text-base">📱 ${M('Soraty ny laharana MVola', 'Enregistrez votre numéro MVola')}</h2>
    <p class="text-xs">${M("Ity laharana ity no handray ny kaody fanokafana. Andro 3 maimaim-poana.", "Ce numéro recevra vos codes de déverrouillage. Essai gratuit de 3 jours.")}</p>
    <input id="licTel" type="tel" class="champ" placeholder="034 00 000 00">
    <button class="btn btn-o w-full" onclick="licInscrire()">${M('Atombohy ny fitsapana', "Démarrer l'essai")}</button>`, false);
}
async function licInscrire() {
  const t = $('licTel').value.replace(/[\s.]/g, '');
  if (!TEL.test(t)) return licMsg(M('Laharana tsy mety (034 / 038)', 'Numéro invalide (034 ou 038)'));
  try { const s = await api('init', { tel: t }); if (s.erreur) return licMsg(s.erreur); stocker(s); fini(); } catch (e) { licMsg(sansReseau() + ' (' + e.message + ')'); }
}

/* 2. Mur de paiement : virement MVola manuel, puis code envoyé par e-mail après vérification */
function mur() {
  if (etat() === 'paye') return;
  const px = LS && LS.prix || '';
  ov(`<h2 class="font-extrabold text-base">🔒 ${M('Voafetra ny fampiasana', 'Fonctions verrouillées')}</h2>
    <p class="text-xs">${M(`1) Alefaso amin'ny MVola ny ${px} Ar mankany amin'ny ${LIC.paiement}. 2) Angataho ny kaody : halefa amin'ny e-mail izy aorian'ny fanamarinana ny fandoavam-bola.`, `1) Envoyez ${px} Ar par MVola au ${LIC.paiement}. 2) Demandez votre code : il vous sera envoyé par e-mail après vérification du paiement.`)}</p>
    <input id="licMail" type="email" class="champ" placeholder="E-mail">
    <button class="btn btn-o w-full" onclick="licDemande()">✉️ ${M('Angataho ny kaody', 'Demander mon code')}</button>
    <div class="flex gap-2"><input id="licCode" class="champ" placeholder="${M('Kaody voaray', 'Code reçu')}" inputmode="numeric"><button class="btn btn-l" onclick="licCode()">OK</button></div>`, true);
}
async function licDemande() {                        // envoie ID appareil + téléphone + e-mail au propriétaire
  const m = $('licMail').value.trim();
  if (!/^\S+@\S+\.\S+$/.test(m)) return licMsg(M('E-mail tsy mety', 'E-mail invalide'));
  try {
    const r = await api('demande', { email: m });
    licMsg(r.ok ? M("Voalefa ny fangatahana. Hahazo ny kaody amin'ny e-mail ianao aorian'ny fanamarinana.", 'Demande envoyée. Vous recevrez votre code par e-mail après vérification du paiement.') : (r.erreur || 'Erreur'));
  } catch (e) { licMsg(sansReseau() + ' (' + e.message + ')'); }
}
async function licCode() {
  try { const s = await api('unlock', { code: $('licCode').value.trim() }); if (s.statut === 'paye') { stocker(s); fini(); } else licMsg(M('Kaody diso', 'Code incorrect')); } catch (e) { licMsg(sansReseau() + ' (' + e.message + ')'); }
}

/* ---------- Pastille d'état ---------- */
function pastille() {
  let p = $('licPill'); const e = etat();
  if (e !== 'essai' && e !== 'limite') { if (p) p.remove(); return; }
  if (!p) { p = document.createElement('button'); p.id = 'licPill'; p.onclick = mur; p.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(76px + env(safe-area-inset-bottom));z-index:60;background:#b08a1c;color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.3)'; document.body.appendChild(p); }
  const j = e === 'essai' ? Math.max(1, Math.ceil((LS.fin - Date.now()) / 864e5)) : 0;
  p.textContent = e === 'essai' ? M(`⏳ Fitsapana : ${j} andro`, `⏳ Essai : ${j} j`) : M('🔒 Voafetra', '🔒 Version limitée');
}

/* ---------- Verrouillage des écrans (la logique existante n'est pas modifiée) ---------- */
const _show4 = show;
show = function (v, pop) { if (etat() === 'limite' && LIC.verrouillees.includes(v)) { mur(); return; } return _show4(v, pop); };
const _sf = setFiltre;
setFiltre = function (k) { if (etat() === 'limite' && !LIC.filtresGratuits.includes(k)) { mur(); return; } _sf(k); };

async function rafraichir() {
  try {
    const s = await api('status');
    if (s.statut === 'inconnu') { LS = null; lsSet('pt_lic', ''); } else stocker(s);
  } catch (e) {}
  pastille();
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && LS) rafraichir(); });
charger();
rafraichir().then(() => {
  if (LS && LS.tel) return;
  const t = setInterval(() => { if (!$('splash')) { clearInterval(t); inscription(); } }, 300);   // après l'animation de démarrage
});
