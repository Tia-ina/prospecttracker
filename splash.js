/* ===== Animation de démarrage : le logo glisse sur l'eau, se dissipe en fumée, le menu apparaît ===== */
(function () {
  const sp = document.getElementById('splash'); if (!sp) return;
  const b = document.body; let vu = false;
  try { vu = sessionStorage.getItem('pt_splash'); } catch (e) {}
  if (vu || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { sp.remove(); return; }
  try { sessionStorage.setItem('pt_splash', '1'); } catch (e) {}
  b.classList.add('pre');
  const T = [], at = (ms, f) => T.push(setTimeout(f, ms));
  const fin = () => { T.forEach(clearTimeout); sp.remove(); b.classList.remove('pre'); };
  at(5300, () => sp.classList.add('fume'));                                   // le logo se dissipe en fumée
  at(6000, () => { b.classList.remove('pre'); b.classList.add('reveal'); });  // le menu apparaît progressivement
  at(8100, fin);
  at(9800, () => b.classList.remove('reveal'));
  sp.addEventListener('click', () => {                                        // toucher l'écran = passer
    T.forEach(clearTimeout); sp.style.transition = 'opacity .45s'; sp.style.opacity = 0;
    b.classList.remove('pre'); b.classList.add('reveal');
    setTimeout(() => sp.remove(), 480); setTimeout(() => b.classList.remove('reveal'), 2200);
  });
})();
