document.addEventListener('DOMContentLoaded', () => {
  const variants = data.Variants;
  const paths = data.Paths;

  // Populate variant dropdown
  const variantSelect = document.getElementById('variant-select');
  variants.forEach(variant => {
    const option = document.createElement('option');
    option.value = variant.name;
    option.textContent = variant.name;
    variantSelect.appendChild(option);
  });

  // Function to add bot
  function addBot() {
    console.log("addBot function called");
    const botInput = document.getElementById('bot-input').value.trim();
    const selectedVariant = variantSelect.value;
    if (botInput && selectedVariant) {
      const ownedBotsList = document.getElementById('owned-bots-list');
      const li = document.createElement('li');
      li.textContent = `${botInput} (${selectedVariant})`;
      li.innerHTML += ` <button onclick="markSold('${botInput}', '${selectedVariant}')">Sold</button>`;
      li.innerHTML += ` <button onclick="upgradeBot('${botInput}', '${selectedVariant}')">Upgrade</button>`;
      ownedBotsList.appendChild(li);
    }
  }

  // Function to mark bot as sold
  function markSold(botName, variant) {
    console.log("markSold function called with", botName, variant);
    const ownedBotsList = document.getElementById('owned-bots-list');
    const li = Array.from(ownedBotsList.children).find(li => li.textContent.includes(`${botName} (${variant})`));
    if (li) {
      li.style.textDecoration = 'line-through';
    }
  }

  // Function to upgrade bot
  function upgradeBot(botName, variant) {
    console.log("upgradeBot function called with", botName, variant);
    const ownedBotsList = document.getElementById('owned-bots-list');
    const li = Array.from(ownedBotsList.children).find(li => li.textContent.includes(`${botName} (${variant})`));
    if (li) {
      // Find the next variant
      const currentVariantIndex = variants.findIndex(v => v.name === variant);
      if (currentVariantIndex < variants.length - 1) {
        const newVariant = variants[currentVariantIndex + 1].name;
        li.textContent = `${botName} (${newVariant})`;
        li.innerHTML += ` <button onclick="markSold('${botName}', '${newVariant}')">Sold</button>`;
        li.innerHTML += ` <button onclick="upgradeBot('${botName}', '${newVariant}')">Upgrade</button>`;
      }
    }
  }

  // Function to predict path
  function predictPath() {
    console.log("predictPath function called");
    const currentRebirth = document.getElementById('current-rebirth').value.trim();
    const bot1 = document.getElementById('bot1').value.trim();
    const bot2 = document.getElementById('bot2').value.trim();
    const bot3 = document.getElementById('bot3').value.trim();

    if (currentRebirth && bot1 && bot2 && bot3) {
      paths.forEach(path => {
        path.bots_per_rebirth.forEach(rebirth => {
          const botsMatch = rebirth.bots.some(bot => bot.type === bot1 || bot.type === bot2 || bot.type === bot3);
          if (botsMatch) {
            alert(`You are on Path number ${path['Path number']}`);
            return;
          }
        });
      });
    }
  }

  // Function to generate advice
  function generateAdvice() {
    console.log("generateAdvice function called");
    const ownedBots = Array.from(document.getElementById('owned-bots-list').children).map(li => li.textContent.split('(')[0].trim());
    const adviceList = document.getElementById('advice-list');
    adviceList.innerHTML = ''; // Clear existing advice

    paths.forEach(path => {
      path.bots_per_rebirth.forEach(rebirth => {
        rebirth.bots.forEach(bot => {
          if (!ownedBots.includes(bot.type)) {
            const li = document.createElement('li');
            li.textContent = `You need to buy ${bot.type} (${bot.variant})`;
            adviceList.appendChild(li);
          }
        });
      });
    });
  }

  // Add event listener for checking if bot is needed
  function checkIfNeeded() {
    console.log("checkIfNeeded function called");
    generateAdvice();
  }
});