// ============================================================
// PARSER: Converte texto das produções em estrutura de dados
// ============================================================

function parseSet(text) {
  const set = new Set();
  const match = text.match(/\{([^}]*)\}/);
  if (match) {
    match[1].split(',').map(s => s.trim()).filter(Boolean).forEach(s => set.add(s));
  }
  return set;
}

function parseGrammar(nText, tText, pText, sText) {
  const nonTerminals = parseSet(nText);
  const terminals = parseSet(tText);

  // Parse S
  const startSymbol = sText.trim();

  if (!nonTerminals.has(startSymbol)) {
    throw new Error(`Símbolo inicial "${startSymbol}" não está nos não-terminais.`);
  }

  // Parse P
  const productions = {};
  const lines = pText.split('\n').map(l => l.trim()).filter(Boolean);

  for (const line of lines) {
    const parts = line.split('::=');
    if (parts.length !== 2) {
      throw new Error(`Formato inválido na produção: "${line}". Use o formato: S ::= aS | ab`);
    }

    const lhs = parts[0].trim();
    if (!nonTerminals.has(lhs)) {
      throw new Error(`"${lhs}" usado como lado esquerdo mas não está em N.`);
    }

    const rhsAlts = parts[1].split('|').map(a => a.trim()).filter(Boolean);
    if (rhsAlts.length === 0) {
      throw new Error(`Nenhuma produção definida para "${lhs}".`);
    }

    productions[lhs] = [];
    for (let i = 0; i < rhsAlts.length; i++) {
      const alt = rhsAlts[i];
      // Parse each alternative into symbols
      const symbols = parseSymbols(alt, nonTerminals, terminals);
      productions[lhs].push({
        index: i + 1,
        raw: alt,
        symbols: symbols
      });
    }
  }

  // Validate: Regular Grammar check
  // A regular grammar production is of the form:
  //   A -> aB  (terminal followed by non-terminal)
  //   A -> a   (just terminal(s))
  //   A -> ε   (epsilon)
  for (const [lhs, alts] of Object.entries(productions)) {
    for (const alt of alts) {
      const syms = alt.symbols;
      // Check: at most one non-terminal, and it must be the last symbol
      let ntCount = 0;
      let lastNtIdx = -1;
      for (let i = 0; i < syms.length; i++) {
        if (syms[i].type === 'nonterminal') {
          ntCount++;
          lastNtIdx = i;
        }
      }
      if (ntCount > 1) {
        throw new Error(`Produção "${lhs} ::= ${alt.raw}" não é regular (mais de um não-terminal).`);
      }
      if (ntCount === 1 && lastNtIdx !== syms.length - 1) {
        throw new Error(`Produção "${lhs} ::= ${alt.raw}" não é regular à direita (não-terminal não está no final).`);
      }
    }
  }

  return { nonTerminals, terminals, productions, startSymbol };
}

function parseSymbols(str, nonTerminals, terminals) {
  const symbols = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === ' ') { i++; continue; }

    // Try to match non-terminal (uppercase letter, possibly followed by digits/primes)
    if (nonTerminals.has(str[i]) || (str[i] >= 'A' && str[i] <= 'Z')) {
      let sym = str[i];
      let j = i + 1;
      // Check multi-char non-terminals
      while (j < str.length && (str[j] === "'" || (str[j] >= '0' && str[j] <= '9'))) {
        sym += str[j];
        j++;
      }
      if (nonTerminals.has(sym)) {
        symbols.push({ type: 'nonterminal', value: sym });
        i = j;
        continue;
      }
    }

    // Otherwise it's a terminal
    if (terminals.has(str[i]) || (str[i] >= 'a' && str[i] <= 'z') || (str[i] >= '0' && str[i] <= '9')) {
      symbols.push({ type: 'terminal', value: str[i] });
      i++;
      continue;
    }

    // Epsilon
    if (str[i] === 'ε' || str[i] === 'λ') {
      symbols.push({ type: 'epsilon', value: 'ε' });
      i++;
      continue;
    }

    throw new Error(`Símbolo desconhecido: "${str[i]}" na produção "${str}".`);
  }
  return symbols;
}
