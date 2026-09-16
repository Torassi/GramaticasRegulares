// ============================================================
// ENTRADA DA APLICAÇÃO: conecta eventos e carrega o estado inicial
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => loadExample(Number(btn.dataset.example)));
  });

  document.getElementById('btnGenerate').addEventListener('click', runDerivation);
  document.getElementById('btnClear').addEventListener('click', clearAll);

  loadExample(0);
});
