// Star Wars Drone Tycoon Companion App

// State
let ownedBots = [];
let activePath = '1';

// Helpers
function normalizeRebirth(input) {
  if (input === null || input === undefined) return '';
  const str = input.toString().trim();
  if (!str) return '';
  if (str.includes('>')) {
    const parts = str.split('>').map(p => p.trim());
    return `${parts[0]} > ${parts[1]}`;
  }
  const num = parseInt(str, 10);
  if (!isNaN(num)) {
    return `${num} > ${num + 1}`;
  }
  return str;
}

function getRebirthStartNumber(rebirthStr) {
  if (!rebirthStr) return -1;
  const parts = rebirthStr.split('>');
  const num = parseInt(parts[0].trim(), 10);
  return isNaN(num) ? -1 : num;
}

function saveState() {
  try {
    localStorage.setItem('fn_swdt_owned_bots', JSON.stringify(ownedBots));
    localStorage.setItem('fn_swdt_active_path', activePath);
    const rebirthVal = document.getElementById('current-rebirth')?.value;
    if (rebirthVal) {
      localStorage.setItem('fn_swdt_current_rebirth', rebirthVal);
    }
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('fn_swdt_owned_bots');
    if (saved) ownedBots = JSON.parse(saved);
    const savedPath = localStorage.getItem('fn_swdt_active_path');
    if (savedPath) activePath = savedPath;
  } catch (e) {
    console.warn('Could not load from localStorage:', e);
  }
}

// Render owned bots list
function renderOwnedBots() {
  const ownedBotsList = document.getElementById('owned-bots-list');
  if (!ownedBotsList) return;
  ownedBotsList.innerHTML = '';

  if (ownedBots.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.style.color = '#888';
    emptyLi.textContent = 'No bots added yet. Add a bot above!';
    ownedBotsList.appendChild(emptyLi);
    return;
  }

  ownedBots.forEach((bot) => {
    const li = document.createElement('li');
    li.style.marginBottom = '6px';
    if (bot.sold) {
      li.style.textDecoration = 'line-through';
      li.style.color = '#777';
    }

    const textSpan = document.createElement('span');
    textSpan.textContent = `${bot.name} (${bot.variant}) `;
    li.appendChild(textSpan);

    // Sold button
    const soldBtn = document.createElement('button');
    soldBtn.textContent = bot.sold ? 'Unsold' : 'Sold';
    soldBtn.style.marginRight = '5px';
    soldBtn.addEventListener('click', () => markSold(bot.id));
    li.appendChild(soldBtn);

    // Upgrade button
    const upgradeBtn = document.createElement('button');
    upgradeBtn.textContent = 'Upgrade';
    upgradeBtn.style.marginRight = '5px';
    upgradeBtn.disabled = bot.sold;
    upgradeBtn.addEventListener('click', () => upgradeBot(bot.id));
    li.appendChild(upgradeBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Remove';
    deleteBtn.addEventListener('click', () => deleteBot(bot.id));
    li.appendChild(deleteBtn);

    ownedBotsList.appendChild(li);
  });
}

// Add a new bot
function addBot() {
  const botInput = document.getElementById('bot-input');
  const variantSelect = document.getElementById('variant-select');
  const botName = botInput.value.trim();
  const selectedVariant = variantSelect.value;

  if (!botName) {
    alert('Please enter a bot name.');
    return;
  }

  // Find canonical name if available in AllBots
  let canonicalName = botName;
  if (typeof data !== 'undefined' && data && data.AllBots) {
    const match = data.AllBots.find(b => b.toLowerCase() === botName.toLowerCase());
    if (match) canonicalName = match;
  }

  const newBot = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    name: canonicalName,
    variant: selectedVariant,
    sold: false
  };

  ownedBots.push(newBot);
  saveState();
  renderOwnedBots();
  botInput.value = '';
  botInput.focus();

  // Refresh advice if visible
  generateAdvice();
}

// Mark bot sold / unsold
function markSold(botId) {
  const bot = ownedBots.find(b => b.id === botId);
  if (bot) {
    bot.sold = !bot.sold;
    saveState();
    renderOwnedBots();
    generateAdvice();
  }
}

// Upgrade bot to next variant
function upgradeBot(botId) {
  const bot = ownedBots.find(b => b.id === botId);
  if (!bot) return;

  const variants = data.Variants;
  const currentVariantIndex = variants.findIndex(v => v.name.toLowerCase() === bot.variant.toLowerCase());
  if (currentVariantIndex >= 0 && currentVariantIndex < variants.length - 1) {
    bot.variant = variants[currentVariantIndex + 1].name;
    saveState();
    renderOwnedBots();
    generateAdvice();
  } else {
    alert(`${bot.name} is already at max variant (${bot.variant})!`);
  }
}

// Delete bot
function deleteBot(botId) {
  ownedBots = ownedBots.filter(b => b.id !== botId);
  saveState();
  renderOwnedBots();
  generateAdvice();
}

// Check if a bot is needed
function checkIfNeeded() {
  const botInput = document.getElementById('bot-input').value.trim();
  const selectedVariant = document.getElementById('variant-select').value;
  const resultDiv = document.getElementById('check-needed-result');

  if (!botInput) {
    if (resultDiv) resultDiv.textContent = 'Please enter a bot name to check.';
    else alert('Please enter a bot name to check.');
    return;
  }

  let canonicalName = botInput;
  if (typeof data !== 'undefined' && data && data.AllBots) {
    const match = data.AllBots.find(b => b.toLowerCase() === botInput.toLowerCase());
    if (match) canonicalName = match;
  }

  const targetBot = canonicalName.toLowerCase();
  const variantIndex = data.Variants.findIndex(v => v.name.toLowerCase() === selectedVariant.toLowerCase());
  const path = data.Paths.find(p => p['Path number'] === activePath.toString());

  let outputHtml = '';

  if (path) {
    const maxNeededObj = (path.max_bot_variant_needed || []).find(b => b.type.toLowerCase() === targetBot);
    const neededRebirths = [];
    path.bots_per_rebirth.forEach(r => {
      const m = r.bots.find(b => b.type.toLowerCase() === targetBot);
      if (m) neededRebirths.push({ rebirth: r.Rebirth, variant: m.variant });
    });

    if (maxNeededObj || neededRebirths.length > 0) {
      const maxVariant = maxNeededObj ? maxNeededObj.variant : neededRebirths[neededRebirths.length - 1].variant;
      const maxVarIdx = data.Variants.findIndex(v => v.name.toLowerCase() === maxVariant.toLowerCase());

      outputHtml += `<strong>Path ${path['Path number']}:</strong> ${canonicalName} <em>is needed</em>.<br>`;
      outputHtml += `Max variant needed: <strong>${maxVariant}</strong>.<br>`;
      outputHtml += `Rebirths required in: ${neededRebirths.map(nr => `${nr.rebirth} (${nr.variant})`).join(', ')}.<br>`;

      if (variantIndex < maxVarIdx) {
        outputHtml += `<span style="color: #d97706;">Action: Keep and upgrade from ${selectedVariant} to ${maxVariant}.</span>`;
      } else if (variantIndex === maxVarIdx) {
        outputHtml += `<span style="color: #16a34a;">Action: Perfect! Current variant (${selectedVariant}) matches max needed (${maxVariant}). Do not upgrade higher.</span>`;
      } else {
        outputHtml += `<span style="color: #dc2626;">Notice: Current variant (${selectedVariant}) is higher than required (${maxVariant}).</span>`;
      }
    } else {
      outputHtml += `<strong>Path ${path['Path number']}:</strong> <span style="color: #16a34a;">${canonicalName} is NOT needed for this path. Safe to sell!</span>`;
    }
  }

  // Cross-path summary
  const otherPathsNeeded = data.Paths.filter(p => {
    return (p.max_bot_variant_needed || []).some(b => b.type.toLowerCase() === targetBot);
  }).map(p => p['Path number']);

  if (otherPathsNeeded.length > 0) {
    outputHtml += `<br><small style="color: #666;">(Needed in Paths: ${otherPathsNeeded.join(', ')})</small>`;
  } else {
    outputHtml += `<br><small style="color: #666;">(Not needed in any path)</small>`;
  }

  if (resultDiv) {
    resultDiv.innerHTML = outputHtml;
  } else {
    alert(outputHtml.replace(/<[^>]*>/g, ' '));
  }
}

// Predict Path
function predictPath() {
  const currentRebirthRaw = document.getElementById('current-rebirth').value.trim();
  const bot1 = document.getElementById('bot1').value.trim();
  const bot2 = document.getElementById('bot2').value.trim();
  const bot3 = document.getElementById('bot3').value.trim();
  const resultDiv = document.getElementById('prediction-result');

  const normRebirth = normalizeRebirth(currentRebirthRaw);
  const inputBots = [bot1, bot2, bot3]
    .map(b => (b || '').trim().toLowerCase())
    .filter(Boolean);

  if (inputBots.length === 0) {
    const msg = 'Please enter at least one bot name to predict your path.';
    if (resultDiv) resultDiv.innerHTML = `<span style="color: #dc2626;">${msg}</span>`;
    else alert(msg);
    return;
  }

  const matchingPaths = [];

  data.Paths.forEach(path => {
    if (normRebirth) {
      const stage = path.bots_per_rebirth.find(r => r.Rebirth === normRebirth);
      if (stage) {
        const stageBotNames = stage.bots.map(b => b.type.toLowerCase());
        const allMatch = inputBots.every(inBot => stageBotNames.includes(inBot));
        if (allMatch) {
          matchingPaths.push({
            pathNumber: path['Path number'],
            stage: stage.Rebirth,
            bots: stage.bots
          });
        }
      }
    } else {
      // No rebirth specified: search any rebirth matching all provided bots
      const matchedStage = path.bots_per_rebirth.find(stage => {
        const stageBotNames = stage.bots.map(b => b.type.toLowerCase());
        return inputBots.every(inBot => stageBotNames.includes(inBot));
      });
      if (matchedStage) {
        matchingPaths.push({
          pathNumber: path['Path number'],
          stage: matchedStage.Rebirth,
          bots: matchedStage.bots
        });
      }
    }
  });

  if (matchingPaths.length === 1) {
    const match = matchingPaths[0];
    activePath = match.pathNumber;
    saveState();
    const pathSelect = document.getElementById('active-path-select');
    if (pathSelect) pathSelect.value = activePath;

    const msg = `Match found! You are on <strong>Path ${activePath}</strong> (at Rebirth ${match.stage}).`;
    if (resultDiv) resultDiv.innerHTML = `<span style="color: #16a34a;">${msg}</span>`;
    else alert(`You are on Path ${activePath}!`);
    generateAdvice();
  } else if (matchingPaths.length > 1) {
    const pathList = matchingPaths.map(m => `Path ${m.pathNumber}`).join(', ');
    const msg = `Possible matches: <strong>${pathList}</strong>.<br><small>These paths share the same bots at this stage. Check the next rebirth to differentiate!</small>`;
    if (resultDiv) resultDiv.innerHTML = `<span style="color: #d97706;">${msg}</span>`;
    else alert(`Matches ${pathList}`);
  } else {
    const msg = normRebirth 
      ? `No path found matching entered bots at Rebirth ${normRebirth}. Please verify bot names or rebirth stage.`
      : `No path found matching all entered bots. Please check spelling or enter a specific Rebirth.`;
    if (resultDiv) resultDiv.innerHTML = `<span style="color: #dc2626;">${msg}</span>`;
    else alert(msg);
  }
}

// Generate Advice
function generateAdvice() {
  const adviceList = document.getElementById('advice-list');
  if (!adviceList) return;
  adviceList.innerHTML = '';

  const path = data.Paths.find(p => p['Path number'] === activePath.toString());
  if (!path) return;

  const currentRebirthRaw = document.getElementById('current-rebirth')?.value.trim();
  const normRebirth = normalizeRebirth(currentRebirthRaw) || '0 > 1';
  const currentRebirthNum = getRebirthStartNumber(normRebirth);
  const currentStage = path.bots_per_rebirth.find(r => r.Rebirth === normRebirth);

  // 1. Current Rebirth Requirements
  if (currentStage) {
    const headerLi = document.createElement('li');
    headerLi.innerHTML = `<strong>Current Rebirth (${normRebirth}) Requirements for Path ${activePath}:</strong>`;
    adviceList.appendChild(headerLi);

    currentStage.bots.forEach(req => {
      const owned = ownedBots.find(b => !b.sold && b.name.toLowerCase() === req.type.toLowerCase());
      const li = document.createElement('li');
      li.style.marginLeft = '20px';

      if (!owned) {
        li.innerHTML = `❌ Missing: <strong>${req.type}</strong> (${req.variant})`;
        li.style.color = '#dc2626';
      } else {
        const ownedVarIdx = data.Variants.findIndex(v => v.name.toLowerCase() === owned.variant.toLowerCase());
        const reqVarIdx = data.Variants.findIndex(v => v.name.toLowerCase() === req.variant.toLowerCase());
        if (ownedVarIdx >= reqVarIdx) {
          li.innerHTML = `✅ Ready: <strong>${req.type}</strong> (${owned.variant}) meets requirement (${req.variant})`;
          li.style.color = '#16a34a';
        } else {
          li.innerHTML = `⚠️ Upgrade Needed: <strong>${req.type}</strong> is ${owned.variant}, needs <strong>${req.variant}</strong>`;
          li.style.color = '#d97706';
        }
      }
      adviceList.appendChild(li);
    });
  }

  // 2. Owned Bots Retention / Sell Advice
  const activeOwned = ownedBots.filter(b => !b.sold);
  if (activeOwned.length > 0) {
    const adviceHeader = document.createElement('li');
    adviceHeader.style.marginTop = '10px';
    adviceHeader.innerHTML = `<strong>Owned Bots Strategy (Path ${activePath}):</strong>`;
    adviceList.appendChild(adviceHeader);

    activeOwned.forEach(owned => {
      const botName = owned.name.toLowerCase();
      const futureRebirths = path.bots_per_rebirth.filter(r => {
        return getRebirthStartNumber(r.Rebirth) >= currentRebirthNum;
      });

      const futureReqs = [];
      futureRebirths.forEach(r => {
        const m = r.bots.find(b => b.type.toLowerCase() === botName);
        if (m) futureReqs.push({ rebirth: r.Rebirth, variant: m.variant });
      });

      const maxNeededObj = (path.max_bot_variant_needed || []).find(b => b.type.toLowerCase() === botName);
      const li = document.createElement('li');
      li.style.marginLeft = '20px';

      if (futureReqs.length === 0) {
        li.innerHTML = `💰 <strong>${owned.name}</strong> (${owned.variant}): Safe to sell! Not needed for any remaining rebirth in Path ${activePath}.`;
        li.style.color = '#16a34a';
      } else {
        const maxVariant = maxNeededObj ? maxNeededObj.variant : futureReqs[futureReqs.length - 1].variant;
        const ownedVarIdx = data.Variants.findIndex(v => v.name.toLowerCase() === owned.variant.toLowerCase());
        const maxVarIdx = data.Variants.findIndex(v => v.name.toLowerCase() === maxVariant.toLowerCase());

        if (ownedVarIdx < maxVarIdx) {
          li.innerHTML = `⬆️ Keep & Upgrade <strong>${owned.name}</strong>: Currently ${owned.variant}, max needed is <strong>${maxVariant}</strong> (next in ${futureReqs[0].rebirth} as ${futureReqs[0].variant}).`;
          li.style.color = '#d97706';
        } else {
          li.innerHTML = `🛡️ Keep <strong>${owned.name}</strong> (${owned.variant}): Ready for future rebirth (next in ${futureReqs[0].rebirth}).`;
          li.style.color = '#2563eb';
        }
      }
      adviceList.appendChild(li);
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  const variants = data.Variants || [];
  const variantSelect = document.getElementById('variant-select');
  if (variantSelect) {
    variantSelect.innerHTML = '';
    variants.forEach(variant => {
      const option = document.createElement('option');
      option.value = variant.name;
      option.textContent = variant.name;
      variantSelect.appendChild(option);
    });
  }

  // Populate datalist for bots autocomplete
  const datalist = document.getElementById('bots-datalist');
  if (datalist && data.AllBots) {
    datalist.innerHTML = '';
    data.AllBots.forEach(botName => {
      const opt = document.createElement('option');
      opt.value = botName;
      datalist.appendChild(opt);
    });
  }

  // Path select change listener
  const pathSelect = document.getElementById('active-path-select');
  if (pathSelect) {
    pathSelect.value = activePath;
    pathSelect.addEventListener('change', (e) => {
      activePath = e.target.value;
      saveState();
      generateAdvice();
    });
  }

  // Rebirth input change listener
  const rebirthInput = document.getElementById('current-rebirth');
  if (rebirthInput) {
    const savedRebirth = localStorage.getItem('fn_swdt_current_rebirth');
    if (savedRebirth) rebirthInput.value = savedRebirth;
    rebirthInput.addEventListener('input', () => {
      saveState();
      generateAdvice();
    });
  }

  // Add bot on Enter key
  const botInput = document.getElementById('bot-input');
  if (botInput) {
    botInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addBot();
    });
  }

  renderOwnedBots();
  generateAdvice();
});

// Explicitly bind to window for inline onclick handlers
window.addBot = addBot;
window.checkIfNeeded = checkIfNeeded;
window.predictPath = predictPath;
window.markSold = markSold;
window.upgradeBot = upgradeBot;
window.deleteBot = deleteBot;
window.generateAdvice = generateAdvice;
