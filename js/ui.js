// ============================================================
// UI FUNCTIONS
// ============================================================
function loadExample(idx) {
  const ex = EXAMPLES[idx];
  document.getElementById('inputN').value = ex.N;
  document.getElementById('inputT').value = ex.T;
  document.getElementById('inputP').value = ex.P;
  document.getElementById('inputS').value = ex.S;

  // Update active button
  document.querySelectorAll('.example-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i === idx);
  });
}

function clearAll() {
  document.getElementById('inputN').value = '';
  document.getElementById('inputT').value = '';
  document.getElementById('inputP').value = '';
  document.getElementById('inputS').value = '';
  document.getElementById('emptyState').hidden = false;
  document.getElementById('resultsContent').hidden = true;
  document.querySelectorAll('.example-btn').forEach(btn => btn.classList.remove('active'));
}

function runDerivation() {
  const nText = document.getElementById('inputN').value;
  const tText = document.getElementById('inputT').value;
  const pText = document.getElementById('inputP').value;
  const sText = document.getElementById('inputS').value;

  const errorBox = document.getElementById('errorBox');
  errorBox.hidden = true;

  try {
    // Parse grammar
    const grammar = parseGrammar(nText, tText, pText, sText);

    // Run derivation
    const result = derive(grammar);

    // Convert to regex
    const regexResult = grammarToRegex(grammar);

    // Show results
    document.getElementById('emptyState').hidden = true;
    document.getElementById('resultsContent').hidden = false;

    renderResults(result, regexResult);

  } catch (e) {
    document.getElementById('emptyState').hidden = true;
    document.getElementById('resultsContent').hidden = false;
    errorBox.hidden = false;
    errorBox.textContent = e.message;
  }
}

function renderResults(result, regexResult) {
  // Stats
  const statsBar = document.getElementById('statsBar');
  statsBar.innerHTML = `
    <div class="stat-chip">
      <dt class="label">Passos</dt>
      <dd class="value">${result.steps.length}</dd>
    </div>
    <div class="stat-chip">
      <dt class="label">Comprimento</dt>
      <dd class="value">${result.sentence.length}</dd>
    </div>
    <div class="stat-chip">
      <dt class="label">Produções Usadas</dt>
      <dd class="value">${result.rulesUsed.join(', ')}</dd>
    </div>
  `;

  // Output sentence
  const outputBox = document.getElementById('outputSentence');
  const spaced = result.sentence.split('').join(' ');
  outputBox.textContent = spaced;

  // Derivation steps
  const stepsList = document.getElementById('derivationSteps');
  stepsList.innerHTML = '';
  result.steps.forEach((step, idx) => {
    const ruleClass = step.rule === 'P1' ? 'p1' : step.rule === 'P2' ? 'p2' : 'p3';

    // Color the result string
    let colored = '';
    if (idx === 0) {
      colored = `${step.nt} ::= `;
    } else {
      colored = '&emsp;::= ';
    }

    // Color each character
    for (const ch of step.result) {
      if (ch >= 'A' && ch <= 'Z') {
        colored += `<span class="nt">${ch}</span>`;
      } else {
        colored += `<span class="t">${ch}</span>`;
      }
    }

    const li = document.createElement('li');
    li.className = 'deriv-step';
    li.style.animationDelay = `${idx * 0.08}s`;
    li.innerHTML = `
      <div class="step-num">${step.step}</div>
      <div class="step-rule ${ruleClass}">${step.rule}</div>
      <div class="step-result">${colored}</div>
    `;
    stepsList.appendChild(li);
  });

  // Stack visualization
  const stackList = document.getElementById('stackVisual');
  stackList.innerHTML = '';
  result.stackHistory.forEach((frame, idx) => {
    const col = document.createElement('li');
    col.className = 'stack-column';
    col.style.animationDelay = `${idx * 0.1}s`;

    const label = document.createElement('div');
    label.className = 'stack-col-label';
    label.textContent = `P${idx + 1}`;
    col.appendChild(label);

    frame.cells.forEach((cell, cellIdx) => {
      const cellDiv = document.createElement('div');
      cellDiv.className = `stack-cell ${cell.type === 'terminal' ? 'terminal' : 'nonterminal'}`;
      cellDiv.textContent = cell.value;
      cellDiv.style.animationDelay = `${idx * 0.1 + cellIdx * 0.05}s`;
      col.appendChild(cellDiv);
    });

    stackList.appendChild(col);
  });

  // End marker
  const endCol = document.createElement('li');
  endCol.className = 'stack-column';
  endCol.style.animationDelay = `${result.stackHistory.length * 0.1}s`;
  endCol.innerHTML = `
    <div class="stack-col-label end">Fim</div>
    <div class="stack-end">vazia</div>
  `;
  stackList.appendChild(endCol);

  // Regex section
  const regexDiv = document.getElementById('regexSection');
  regexDiv.innerHTML = '';

  const titleRow = document.createElement('div');
  titleRow.className = 'regex-title-row';
  titleRow.innerHTML = `
    <div class="regex-title-icon" aria-hidden="true">∗</div>
    <h3 class="regex-title-text">Conversão para Expressão Regular</h3>
  `;
  regexDiv.appendChild(titleRow);

  const eqsList = document.createElement('ol');
  eqsList.className = 'regex-equations';
  regexResult.steps.forEach((step, idx) => {
    const line = document.createElement('li');
    line.className = 'regex-eq-line';
    line.style.animationDelay = `${idx * 0.08}s`;
    if (step.includes('Arden')) {
      const parts = step.split('(Lema');
      line.innerHTML = `${escapeHtml(parts[0])} <span class="comment">(Lema${escapeHtml(parts[1] || '')}</span>`;
    } else {
      line.textContent = step;
    }
    eqsList.appendChild(line);
  });
  regexDiv.appendChild(eqsList);

  const finalWrap = document.createElement('div');
  finalWrap.innerHTML = `
    <p class="form-label output-label">Expressão Regular Final</p>
    <output class="regex-final">${escapeHtml(regexResult.regex)}</output>
  `;
  regexDiv.appendChild(finalWrap);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
