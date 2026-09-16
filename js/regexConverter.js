// ============================================================
// CONVERSÃO GRAMÁTICA REGULAR → EXPRESSÃO REGULAR (Arden)
// ============================================================
function grammarToRegex(grammar) {
  const { productions, startSymbol, nonTerminals } = grammar;
  const ntList = Array.from(nonTerminals);
  const eqSteps = [];

  // Build equation system.
  // Each equation: variable -> [ { coeff: 'terminal_prefix', target: 'NT'|null } ]
  // Represents: variable = coeff1·target1 + coeff2·target2 + ...
  const eqSystem = {};

  for (const nt of ntList) {
    eqSystem[nt] = [];
    if (!productions[nt]) continue;
    for (const alt of productions[nt]) {
      let terminalPrefix = '', nonTerminalTarget = null;
      for (const sym of alt.symbols) {
        if (sym.type === 'terminal') terminalPrefix += sym.value;
        else if (sym.type === 'nonterminal') nonTerminalTarget = sym.value;
      }
      eqSystem[nt].push({ coeff: terminalPrefix, target: nonTerminalTarget });
    }
  }

  // Show initial equations
  for (const nt of ntList) {
    const terms = eqSystem[nt].map(t => t.target ? t.coeff + t.target : t.coeff);
    eqSteps.push(`${nt} = ${terms.join(' + ')}`);
  }

  // Elimination order: non-start variables first, then start
  const order = ntList.filter(v => v !== startSymbol).concat([startSymbol]);

  for (let idx = 0; idx < order.length; idx++) {
    const current = order[idx];
    if (!eqSystem[current] || eqSystem[current].length === 0) continue;

    // Substitute all previously processed variables into this equation
    let changed = true;
    while (changed) {
      changed = false;
      const newTerms = [];
      for (const term of eqSystem[current]) {
        if (term.target !== null && term.target !== current) {
          // Check if target was already processed
          const targetIdx = order.indexOf(term.target);
          if (targetIdx >= 0 && targetIdx < idx && eqSystem[term.target]) {
            // Distribute: coeff * (each term of target's equation)
            for (const sub of eqSystem[term.target]) {
              newTerms.push({
                coeff: term.coeff + sub.coeff,
                target: sub.target
              });
            }
            changed = true;
          } else {
            newTerms.push(term);
          }
        } else {
          newTerms.push(term);
        }
      }
      eqSystem[current] = newTerms;
    }

    // Show substituted equation if different from initial
    if (idx > 0 || eqSystem[current].some(t => t.target === current)) {
      const subTerms = eqSystem[current].map(t => t.target ? t.coeff + t.target : t.coeff);
      const subEq = `${current} = ${subTerms.join(' + ')}`;
      if (!eqSteps.includes(subEq)) {
        eqSteps.push(subEq);
      }
    }

    // Apply Arden's Lemma if self-referencing
    const selfTerms = eqSystem[current].filter(t => t.target === current);
    const otherTerms = eqSystem[current].filter(t => t.target !== current);

    if (selfTerms.length > 0) {
      // X = αX + β → X = α*β (where β = β₁ + β₂ + ...)
      const alpha = selfTerms.map(t => t.coeff).join('+');
      const needsParensAlpha = selfTerms.length > 1 || alpha.length > 1;
      const alphaStr = needsParensAlpha ? `(${alpha})` : alpha;

      // Replace equation: apply α* prefix to each β term
      const newTerms = otherTerms.map(t => ({
        coeff: alphaStr + '*' + t.coeff,
        target: t.target
      }));
      if (newTerms.length === 0) {
        newTerms.push({ coeff: alphaStr + '*', target: null });
      }
      eqSystem[current] = newTerms;

      // Display the step from the same distributed terms used to build the
      // final regex, so the text always matches the result exactly.
      const resultDisplay = newTerms.map(t => t.target ? t.coeff + t.target : t.coeff).join(' + ');
      eqSteps.push(`${current} = ${resultDisplay}  (Lema de Arden)`);
    }
  }

  // Build final regex from start symbol's equation
  const finalTerms = eqSystem[startSymbol] || [{ coeff: 'ε', target: null }];
  let finalRegex;
  if (finalTerms.length === 1) {
    finalRegex = finalTerms[0].coeff + (finalTerms[0].target || '');
  } else {
    finalRegex = finalTerms.map(t => t.coeff + (t.target || '')).join(' + ');
  }

  // Clean up unnecessary parentheses for single chars
  finalRegex = finalRegex.replace(/\((\w)\)/g, '$1');

  return {
    steps: eqSteps,
    regex: finalRegex
  };
}
