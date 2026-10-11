// Star Wars Drone Tycoon Companion App

// State
// State
let ownedBots = [];
let activePath = 1;
let currentAdviceFilter = 'all';

// UI Cache
const UI = {
  ownedBotsList: document.getElementById('owned-bots-list'),
  ownedCount: document.getElementById('owned-count'),
  botInput: document.getElementById('bot-input'),
  variantSelect: document.getElementById('variant-select'),
  checkNeededResult: document.getElementById('check-needed-result'),
  currentRebirth: document.getElementById('current-rebirth'),
  activePathSelect: document.getElementById('active-path-select'),
  bot1: document.getElementById('bot1'),
  bot2: document.getElementById('bot2'),
  bot3: document.getElementById('bot3'),
  predictionResult: document.getElementById('prediction-result'),
  adviceSummary: document.getElementById('advice-summary'),
  adviceFilters: document.getElementById('advice-filters'),
  adviceList: document.getElementById('advice-list'),
  addSection: document.getElementById('add-bot-section')
};

// Helpers
function getVariantIndex(variantName) {
  if (!variantName || typeof data === 'undefined' || !data.Variants) return 0;
  const index = data.Variants.findIndex(item => item.toLowerCase() === variantName.toLowerCase());
  return index !== -1 ? index : 0;
}

function getVariantByIndex(idx) {
  if (typeof data === 'undefined' || !data.Variants) return 'Base';
  return data.Variants[idx] ? data.Variants[idx] : 'Base';
}

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

// Collapsible Section Toggle
function toggleSection(headerEl) {
  const section = headerEl.closest('.section');
  if (!section) return;
  const isCollapsed = section.classList.toggle('collapsed');
  headerEl.setAttribute('aria-expanded', !isCollapsed);
}

// Render owned bots list
function renderOwnedBots() {
  if (!UI.ownedBotsList) return;
  UI.ownedBotsList.innerHTML = '';

  const activeCount = ownedBots.filter(b => !b.sold).length;
  if (UI.ownedCount) UI.ownedCount.textContent = `${activeCount}`;

  if (ownedBots.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'empty-owned-bot';
    emptyLi.textContent = 'No bots added yet. Add a bot above or click "+ Add" on needed path bots below!';
    UI.ownedBotsList.appendChild(emptyLi);
    return;
  }

  // Pre-calculate redundancy
  const maxVariantIndices = {};
  ownedBots.forEach(bot => {
    const name = bot.name.toLowerCase();
    const idx = getVariantIndex(bot.variant);
    if (!maxVariantIndices[name] || idx > maxVariantIndices[name]) {
      maxVariantIndices[name] = idx;
    }
  });

  const countsAtMax = {}; // name -> count of how many we've seen at maxIdx
  const redundancyStatus = new Map(); // id -> boolean (true if redundant)

  ownedBots.forEach(bot => {
    const name = bot.name.toLowerCase();
    const idx = getVariantIndex(bot.variant);
    const maxIdx = maxVariantIndices[name];

    if (idx < maxIdx) {
      redundancyStatus.set(bot.id, true);
    } else if (idx === maxIdx) {
      countsAtMax[name] = (countsAtMax[name] || 0) + 1;
      redundancyStatus.set(bot.id, countsAtMax[name] > 1);
    } else {
      redundancyStatus.set(bot.id, false);
    }
  });

  ownedBots.forEach((bot) => {
    const li = document.createElement('li');
    li.className = 'owned-bot-item';

    // Calculate status for Owned Bots relative to active path
    let emoji = '';
    let statusText = '';
    
    const path = data.Paths.find(p => p['Path number'] === activePath.toString());
    if (path) {
      const highestInfo = getHighestVariantForBot(path, bot.name.toLowerCase());
      const ownedIdx = getVariantIndex(bot.variant);
      const highestIdx = highestInfo.index;

      // Get normalized current rebirth from the input field
      const currentRebirthRaw = document.getElementById('current-rebirth')?.value.trim();
      const normRebirthVal = normalizeRebirth(currentRebirthRaw);

      // Check if needed in current or future rebirths of this path
      let isNeededInFuture = true;
      if (normRebirthVal) {
        const currentStartNum = getRebirthStartNumber(normRebirthVal);
        if (currentStartNum !== -1) {
          isNeededInFuture = false;
          for (const r of path.bots_per_rebirth) {
            const rebirthStartNum = getRebirthStartNumber(r.Rebirth);
            if (rebirthStartNum !== -1 && rebirthStartNum >= currentStartNum) {
              if (r.bots.some(b => b.type.toLowerCase() === bot.name.toLowerCase())) {
                isNeededInFuture = true;
                break;
              }
            }
          }
        }
      }

      // Note: We ignore max_bot_variant_needed here because we want to mark bots as sellable 
      // if they are no longer required in the progression milestones of the current path.


      // Determine emoji based on redundancy or requirements
      if (redundancyStatus.get(bot.id)) {
        emoji = '💰'; // Redundant - can be sold
      } else if (!isNeededInFuture) {
        emoji = '💰'; // Not needed in this path anymore - can be sold
      } else if (ownedIdx >= highestIdx) {
        emoji = '✅'; // Needed and owned at sufficient variant
      } else if (ownedIdx !== undefined && ownedIdx < highestIdx) {
        emoji = '⬆️'; // Needed but lower variant than required
      }
    }

    li.innerHTML = `
      <span><strong class="bot-name">${emoji} ${bot.name}</strong> <span class="badge badge-variant">${bot.variant}</span></span>
      <div class="btn-group">
        <button class="btn-sold" data-id="${bot.id}">Sold</button>
        <button class="btn-upgrade" data-id="${bot.id}">Upgraded</button>
      </div>
    `;

    li.querySelector('.btn-sold').addEventListener('click', () => markSold(bot.id));
    li.querySelector('.btn-upgrade').addEventListener('click', () => upgradeBot(bot.id));
    
    UI.ownedBotsList.appendChild(li);
  });
}

// Add a new bot
function addBot(customName, customVariant) {
  const botInput = document.getElementById('bot-input');
  const variantSelect = document.getElementById('variant-select');

  const botName = (customName || botInput.value).trim();
  const selectedVariant = customVariant || variantSelect.value;

  if (!botName) {
    alert('Please enter a bot name.');
    return;
  }

  // Canonical name if available in AllBots
  let canonicalName = botName;
  if (typeof data !== 'undefined' && data && data.AllBots) {
    const match = data.AllBots.find(b => b.toLowerCase() === botName.toLowerCase());
    if (match) canonicalName = match;
  }

  const newBot = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
    name: canonicalName,
    variant: selectedVariant,
  };

  ownedBots.push(newBot);
  saveState();
  renderOwnedBots();
  if (!customName) {
    botInput.value = '';
    botInput.focus();
  }

  // Refresh advice to update statuses
  generateAdvice();
}

// Pre-fill Add Bot form
function selectBotForAdd(botName, variant) {
  const botInput = document.getElementById('bot-input');
  const variantSelect = document.getElementById('variant-select');
  if (botInput) botInput.value = botName;
  if (variantSelect && variant) variantSelect.value = variant;

  // Open the Add Bot section if collapsed
  const addSection = document.getElementById('add-bot-section');
  if (addSection && addSection.classList.contains('collapsed')) {
    addSection.classList.remove('collapsed');
    const header = addSection.querySelector('.section-header');
    if (header) header.setAttribute('aria-expanded', 'true');
  }

  botInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  botInput.focus();
}

// Mark bot sold / unsold
function markSold(botId) {
    ownedBots = ownedBots.filter(b => b.id !== botId);
    saveState();
    renderOwnedBots();
    generateAdvice();
}

// Upgrade bot to next variant
function upgradeBot(botId) {
  const bot = ownedBots.find(b => b.id === botId);
  if (!bot || !bot.variant) {
    console.error('Bot or variant not found for ID:', botId);
    return;
  }

  const variants = data.Variants;
  if (!variants || !Array.isArray(variants)) {
    console.error('No variants defined in data.');
    return;
  }

  // Helper to extract name from variant (handles string or object with .name)
  const getVName = (v) => (typeof v === 'string' ? v : (v && v.name ? v.name : null));

  let currentVariantIndex = -1;
  for (let i = 0; i < variants.length; i++) {
    if (getVName(variants[i]) && getVName(variants[i]).toLowerCase() === bot.variant.toLowerCase()) {
      currentVariantIndex = i;
      break;
    }
  }

  if (currentVariantIndex >= 0 && currentVariantIndex < variants.length - 1) {
    bot.variant = getVName(variants[currentVariantIndex + 1]);
    saveState();
    renderOwnedBots();
    generateAdvice();
  } else {
    alert(`${bot.name} is already at max variant (${bot.variant})!`);
  }
}


// Check if a bot is needed
function checkIfNeeded() {
  const botInput = document.getElementById('bot-input').value.trim();
  const selectedVariant = document.getElementById('variant-select').value;
  const resultDiv = document.getElementById('check-needed-result');
  const currentRebirth = document.getElementById('current-rebirth').value;

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
  const variantIndex = getVariantIndex(selectedVariant);
  const path = data.Paths[activePath - 1];

  let outputHtml = '';

  if (path) {
    const highestInfo = getHighestVariantForBot(path, targetBot);
    const neededRebirths = [];
    path.bots_per_rebirth.forEach(r => {
      const m = r.bots.find(b => b.type.toLowerCase() === targetBot);
      //TODO: Make sure it's only added for rebirths after or exactly the current one
      if (m) {
        const botRebirth = r.Rebirth.split('>')[0];
        if (+botRebirth > +currentRebirth) { neededRebirths.push({ rebirth: r.Rebirth, variant: m.variant }); }
      }
    });

    if (neededRebirths.length > 0) {
      const maxVariant = highestInfo.variant;
      const maxVarIdx = highestInfo.index;

      outputHtml += `<strong>Path ${path['Path number']}:</strong> ${canonicalName} <em>is needed</em>.<br>`;
      outputHtml += `Highest variety needed: <strong>${maxVariant} (Index ${maxVarIdx})</strong>.<br>`;
      if (neededRebirths.length > 0) {
        outputHtml += `Rebirths required in: ${neededRebirths.map(nr => `${nr.rebirth} (${nr.variant})`).join(', ')}.<br>`;
      }

      const ownedBot = ownedBots.find(b => b.name === canonicalName);
      if (ownedBot) {
        outputHtml += `<span class="status-warning">Warning: You already own this bot.</span><br>`;

        const ownedVariantName = ownedBot.variant || "Unknown Variant";
        const ownedVariantIdx = getVariantIndex(ownedBot.variant);

        if (ownedVariantIdx !== undefined && ownedVariantIdx < variantIndex)
        {
        }
        else
        {
          outputHtml += `<span class="status-error">Action: Do <strong>NOT</strong> buy! This bot is ${selectedVariant} with is lower or equal than ${ownedBot.variant} of your owned bot.</span>`;
        }
      }
      else if (variantIndex < maxVarIdx) {
        outputHtml += `<span class="status-warning">Action: Buy it and upgrade from ${selectedVariant} (Index ${variantIndex}) to ${maxVariant} (Index ${maxVarIdx}).</span>`;
      } else if (variantIndex === maxVarIdx) {
        outputHtml += `<span class="status-success">Action: Buy it! Current variant (${selectedVariant}) matches highest required (${maxVariant}). No need to upgrade higher.</span>`;
      } else {
        outputHtml += `<span class="status-success">Action: Buy it! Current variant (${selectedVariant}) is higher than highest required (${maxVariant}).</span>`;
      }
    } else {
      outputHtml += `<span class="status-critical">Action: Do <strong>NOT</strong> buy! ${canonicalName} is NOT needed forward for this path!</span>`;
    }
  }

  // Cross-path check
  const otherPathsNeeded = data.Paths.filter(p => {
    return (p.max_bot_variant_needed || []).some(b => b.type.toLowerCase() === targetBot) ||
           p.bots_per_rebirth.some(r => r.bots.some(b => b.type.toLowerCase() === targetBot));
  }).map(p => p['Path number']);

  if (otherPathsNeeded.length > 0) {
    outputHtml += `<br><small class="text-muted">(Needed in Paths: ${otherPathsNeeded.join(', ')} you could gift it to someone.)</small>`;
  } else {
    outputHtml += `<br><small class="text-muted">(Not needed in any path)</small>`;
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

// Find highest variant for bot in path
function getHighestVariantForBot(path, botType) {
  let highestIdx = -1;
  let highestVariantName = 'Base';

  // Check max_bot_variant_needed from json
  if (path.max_bot_variant_needed) {
    const maxEntry = path.max_bot_variant_needed.find(b => b.type.toLowerCase() === botType.toLowerCase());
    if (maxEntry) {
      highestIdx = getVariantIndex(maxEntry.variant);
    }
    else
    {
      // Check all rebirths in path
      path.bots_per_rebirth.forEach(r => {
        r.bots.forEach(b => {
          if (b.type.toLowerCase() === botType.toLowerCase()) {
            const idx = getVariantIndex(b.variant);
            if (idx > highestIdx) {
              highestIdx = idx;
            }
          }
        });
      });
    }
  }

  highestVariantName = getVariantByIndex(highestIdx);
  
  return { variant: highestVariantName, index: highestIdx };
}

// Extract bots from whole path in order
function getPathBotsInOrder(pathNumber) {
  const path = data.Paths.find(p => p['Path number'] === pathNumber.toString());
  if (!path) return [];

  const orderedBots = [];
  const seen = new Set();

  path.bots_per_rebirth.forEach(r => {
    r.bots.forEach(b => {
      const key = b.type.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);

        const occurrences = [];
        path.bots_per_rebirth.forEach(r2 => {
          const match = r2.bots.find(b2 => b2.type.toLowerCase() === key);
          if (match) {
            occurrences.push({ rebirth: r2.Rebirth, variant: match.variant, index: getVariantIndex(match.variant) });
          }
        });

        const highest = getHighestVariantForBot(path, b.type);

        orderedBots.push({
          botType: b.type,
          firstRebirth: r.Rebirth,
          highestVariant: highest.variant,
          highestIndex: highest.index,
          totalOccurrences: occurrences.length,
          occurrences: occurrences
        });
      }
    });
  });

  return orderedBots;
}

// Set advice filter
function setAdviceFilter(filterName) {
  currentAdviceFilter = filterName;
  const filterBtns = document.querySelectorAll('#advice-filters .filter-btn');
  filterBtns.forEach(btn => {
    const match = btn.getAttribute('onclick')?.includes(`'${filterName}'`);
    if (match) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  renderAdviceList();
}

// Whole Path Advice Cache
let cachedPathAdviceItems = [];

// Generate Advice
function generateAdvice() {
  const path = data.Paths.find(p => p['Path number'] === activePath.toString());
  if (!path) return;

  const orderedBots = getPathBotsInOrder(activePath);
  const currentRebirthRaw = document.getElementById('current-rebirth')?.value.trim();
  const normRebirth = normalizeRebirth(currentRebirthRaw);

  let filteredBots = orderedBots;
  if (normRebirth) {
    const currentStartNum = getRebirthStartNumber(normRebirth);
    if (currentStartNum !== -1) {
      filteredBots = orderedBots.filter(bot => 
        bot.occurrences.some(occ => {
          const startNum = getRebirthStartNumber(occ.rebirth);
          return startNum !== -1 && startNum >= currentStartNum;
        })
      );
    }
  }

  let readyCount = 0;
  let upgradeCount = 0;
  let missingCount = 0;

  cachedPathAdviceItems = filteredBots.map((item, index) => {
    const owned = ownedBots.find(o => !o.sold && o.name.toLowerCase() === item.botType.toLowerCase());
    let statusType = 'missing';
    let statusText = '';
    let ownedVariant = '';

    if (!owned) {
      statusType = 'missing';
      statusText = `Missing: Need ${item.highestVariant}`;
      missingCount++;
    } else {
      ownedVariant = owned.variant;
      const ownedIdx = getVariantIndex(owned.variant);
      if (ownedIdx >= item.highestIndex) {
        statusType = 'ready';
        statusText = `Ready (${owned.variant})`;
        readyCount++;
      } else {
        statusType = 'upgrade';
        statusText = `Upgrade needed: Own ${owned.variant} -> Need ${item.highestVariant}`;
        upgradeCount++;
      }
    }

    const isCurrentRebirth = normRebirth && item.occurrences.some(o => o.rebirth === normRebirth);

    return {
      order: index + 1,
      botType: item.botType,
      firstRebirth: item.firstRebirth,
      highestVariant: item.highestVariant,
      highestIndex: item.highestIndex,
      occurrences: item.occurrences,
      statusType,
      statusText,
      ownedVariant,
      isCurrentRebirth
    };
  });

  // Render Summary Box
  const summaryBox = document.getElementById('advice-summary');
  if (summaryBox) {
    summaryBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; align-items: center;">
        <div>
          <strong>Path ${activePath} Progression:</strong> 
          <span>${orderedBots.length} bots needed in total across all 40 rebirths</span>
          ${normRebirth ? `<br><small style="color: #d97706;">Highlighted bots are required for Current Rebirth (${normRebirth})</small>` : ''}
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <span class="badge" style="background-color: #dcfce7; color: #166534;">✅ ${readyCount} Ready</span>
          <span class="badge" style="background-color: #fef3c7; color: #92400e;">⬆️ ${upgradeCount} Upgrade</span>
          <span class="badge" style="background-color: #fee2e2; color: #991b1b;">❌ ${missingCount} Missing</span>
        </div>
      </div>
      <div style="margin-top: 6px; font-size: 12px; color: #64748b;">
        * For bots required in multiple rebirths, the variety recommended below is the <strong>highest index variant in the JSON</strong> (e.g. up to Kyber [index 7]).
      </div>
    `;
  }

  // Update Filter buttons text with counts
  const filterBtns = document.querySelectorAll('#advice-filters .filter-btn');
  if (filterBtns.length >= 4) {
    filterBtns[0].textContent = `All Bots (${orderedBots.length})`;
    filterBtns[1].textContent = `Missing (${missingCount})`;
    filterBtns[2].textContent = `Needs Upgrade (${upgradeCount})`;
    filterBtns[3].textContent = `Ready (${readyCount})`;
  }

  renderAdviceList();
}

function getEmoji(status) {
  switch (status) {
    case 'ready': return '✅';
    case 'upgrade': return '⬆️';
    case 'missing': return '❌';
    default: return '';
  }
}

function renderAdviceList() {
  const adviceList = document.getElementById('advice-list');
  if (!adviceList) return;
  adviceList.innerHTML = '';

  const filteredItems = cachedPathAdviceItems.filter(item => {
    if (currentAdviceFilter === 'all') return true;
    return item.statusType === currentAdviceFilter;
  });

  if (filteredItems.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.style.padding = '12px';
    emptyLi.style.textAlign = 'center';
    emptyLi.style.color = '#64748b';
    emptyLi.textContent = `No bots match the "${currentAdviceFilter}" filter for Path ${activePath}.`;
    adviceList.appendChild(emptyLi);
    return;
  }

  filteredItems.forEach(item => {
    const li = document.createElement('li');
    li.className = `advice-card ${item.isCurrentRebirth ? 'highlight-rebirth' : ''}`;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'advice-info';

    // Title line
    const titleDiv = document.createElement('div');
    titleDiv.className = 'advice-title';
    titleDiv.innerHTML = `
      <span style="color: #64748b; font-size: 13px;">#${item.order}</span>
      <span>${getEmoji(item.statusType)} ${item.botType}</span>
      <span class="badge badge-variant">${item.highestVariant} (Index ${item.highestIndex})</span>
      <span class="badge badge-rebirth">First: ${item.firstRebirth}</span>
      ${item.isCurrentRebirth ? '<span class="badge badge-current-rebirth">Current Rebirth</span>' : ''}
    `;
    infoDiv.appendChild(titleDiv);

    // Details line
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'advice-details';
    const occStr = item.occurrences.map(o => `${o.rebirth} (${o.variant})`).join(', ');
    detailsDiv.textContent = item.occurrences.length > 1 
      ? `Required in ${item.occurrences.length} rebirths: ${occStr}` 
      : `Required in: ${occStr}`;
    infoDiv.appendChild(detailsDiv);

    // Status line
    const statusDiv = document.createElement('div');
    statusDiv.style.marginTop = '4px';
    const statusClass = item.statusType === 'ready' ? 'status-ready' : (item.statusType === 'upgrade' ? 'status-upgrade' : 'status-missing');
    statusDiv.className = `advice-status ${statusClass}`;
    statusDiv.textContent = item.statusText;
    infoDiv.appendChild(statusDiv);

    li.appendChild(infoDiv);

    // Actions
    const actionDiv = document.createElement('div');
    actionDiv.style.display = 'flex';
    actionDiv.style.gap = '6px';

    if (item.statusType === 'missing') {
      const addBtn = document.createElement('button');
      addBtn.textContent = '+ Add to Owned';
      addBtn.style.fontSize = '12px';
      addBtn.style.padding = '4px 8px';
      addBtn.addEventListener('click', () => {
        addBot(item.botType, item.highestVariant);
      });
      actionDiv.appendChild(addBtn);

      const fillBtn = document.createElement('button');
      fillBtn.textContent = 'Select in Form';
      fillBtn.style.fontSize = '12px';
      fillBtn.style.padding = '4px 8px';
      fillBtn.style.backgroundColor = '#64748b';
      fillBtn.addEventListener('click', () => {
        selectBotForAdd(item.botType, item.highestVariant);
      });
      actionDiv.appendChild(fillBtn);
    } else if (item.statusType === 'upgrade') {
      const upgradeActionBtn = document.createElement('button');
      upgradeActionBtn.textContent = 'Upgrade Owned';
      upgradeActionBtn.style.fontSize = '12px';
      upgradeActionBtn.style.padding = '4px 8px';
      upgradeActionBtn.style.backgroundColor = '#d97706';
      upgradeActionBtn.addEventListener('click', () => {
        const owned = ownedBots.find(o => !o.sold && o.name.toLowerCase() === item.botType.toLowerCase());
        if (owned) upgradeBot(owned.id);
      });
      actionDiv.appendChild(upgradeActionBtn);
    }

    li.appendChild(actionDiv);
    adviceList.appendChild(li);
  });
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Populate the variants dropdown
  const variants = data.Variants || [];
  const variantSelect = document.getElementById('variant-select');
  if (variantSelect) {
    variantSelect.innerHTML = '';
    variants.forEach(variant => {
      const option = document.createElement('option');
      option.value = variant;
      option.textContent = `${variant}`;
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

  // Delegated event listener for collapsible sections
  document.addEventListener('click', (e) => {
    const header = e.target.closest('.section-header');
    if (!header) return;
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    toggleSection(header);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const header = e.target.closest('.section-header');
      if (header && document.activeElement === header) {
        e.preventDefault();
        toggleSection(header);
      }
    }
  });

  renderOwnedBots();
  generateAdvice();
});

// Explicitly bind to window for inline HTML onclick handlers
window.addBot = addBot;
window.checkIfNeeded = checkIfNeeded;
window.predictPath = predictPath;
window.markSold = markSold;
window.upgradeBot = upgradeBot;
window.generateAdvice = generateAdvice;
window.setAdviceFilter = setAdviceFilter;
window.selectBotForAdd = selectBotForAdd;
