// ============================================================
// DERIVAÇÃO COM PILHA
// ============================================================
function derive(grammar, maxSteps) {
  maxSteps = maxSteps || 50;
  const { productions, startSymbol } = grammar;
  const steps = [];
  const stackHistory = [];
  let output = '';
  let stepCount = 0;

  // Start: choose a production for the start symbol
  function processNonTerminal(nt) {
    if (stepCount >= maxSteps) return;
    if (!productions[nt]) {
      throw new Error(`Não-terminal "${nt}" não possui produções definidas.`);
    }

    const alts = productions[nt];
    // Random choice
    const chosen = alts[Math.floor(Math.random() * alts.length)];

    // Build the stack: leftmost symbol on top
    // We push right to left so leftmost is on top
    const stack = [];
    for (let i = chosen.symbols.length - 1; i >= 0; i--) {
      stack.push(chosen.symbols[i]);
    }

    // Record stack state
    stackHistory.push({
      step: stepCount + 1,
      cells: chosen.symbols.map(s => ({ ...s }))
    });

    stepCount++;

    // Record derivation step
    steps.push({
      step: stepCount,
      rule: `P${chosen.index}`,
      nt: nt,
      production: chosen.raw,
      currentOutput: output,
      fullDerivation: ''
    });

    // Process stack
    while (stack.length > 0) {
      const top = stack.pop();
      if (top.type === 'terminal') {
        output += top.value;
      } else if (top.type === 'nonterminal') {
        processNonTerminal(top.value);
      }
      // epsilon: do nothing
    }
  }

  processNonTerminal(startSymbol);

  // Build derivation display
  let currentForm = startSymbol;
  const derivationDisplay = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    // Replace the first occurrence of the non-terminal with the production
    const idx = currentForm.indexOf(s.nt);
    if (idx !== -1) {
      currentForm = currentForm.substring(0, idx) + s.production + currentForm.substring(idx + s.nt.length);
    }
    derivationDisplay.push({
      step: s.step,
      rule: s.rule,
      result: currentForm,
      nt: s.nt,
      production: s.production
    });
  }

  return {
    sentence: output,
    steps: derivationDisplay,
    stackHistory: stackHistory,
    rulesUsed: steps.map(s => s.rule)
  };
}
