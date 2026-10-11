# Fortnite Drone Tycoon Companion: Project Summary

## Overview
This is a web-based companion application for Fortnite's Star Wars Drone Tycoon mode. The tool helps players track their drone ownership across progression paths and rebirth levels, providing dynamic advice based on current progress.

## Core Functionality
- **Data Model**: Centralized game data stored in `data.json`, structured hierarchically with:
  - Variants (Base through Kyber)
  - Paths with Rebirth level tiers
  - Bots associated with variant/type keys at specific rebirth levels

- **Client-Side Logic**: Implemented in `app.js` to handle:
  - User path selection and rebirth level state tracking
  - Dynamic advice generation based on owned bots (true/false), including recommendations to sell lower variants if a higher variant is already owned
  - Real-time mapping of user input to bot variants using helper functions

## Key Components
1. `data.json`
   - Hierarchical structure: Variants → Paths → Rebirth levels → Bots with variant/type associations
   - Each bot has a unique identifier and is tied to progression path tiers

2. `app.js`
   - Tracks owned bots in the state object (`ownedBots`)
   - Normalizes birth states via `normalizeBirth()` function (handles "0", "1", or "Reborn")
   - Uses helper functions:
     - `getVariantIndex(variantName)`: Maps variant name to index for lookup
     - `getVariantByIndex(index)`: Returns variant object from index
   - Generates personalized advice by checking ownership state against path data

## Client-Side Flow
1. User selects a progression Path.
2. Rebirth level is checked via `ownedBots` state.
3. Helper functions (`getVariantIndex`, `getVariantByIndex`) map user input to specific bot variants dynamically.
4. Advice is generated based on ownership state; it provides recommendations for missing bots and suggests selling lower variants if a higher variant of the same bot is already owned.

## Usage Scenario
A player selects the "Galactic War" path and checks rebirth level 3. The app uses `ownedBots` state to determine if key drones like "Kyber Pulse" are owned, then generates advice such as 'You're missing Kyber Pulse at Rebirth 3 – complete tasks to unlock it.'

## Development References

### JavaScript Functions (`app.js`)
- `normalizeRebirth(input)`: Standardizes rebirth input strings (e.g., "0", "1", or "0 > 1").
- `getRebirthStartNumber(rebirthStr)`: Extracts the starting number from a "X > Y" rebirth string.
- `saveState()`: Persists `ownedBots`, `activePath`, and current rebirth to `localStorage`.
- `loadState()`: Loads user ownership and path state from `localStorage` on startup.
- `toggleSection(headerEl)`: Toggles the "collapsed" UI class for sections.
- `renderOwnedBots()`: Updates the DOM list of owned bots, including sold/upgrade button states.
- `addBot(customName, customVariant)`: Adds a new bot to the state and refreshes advice.
- `selectBotForAdd(botName, variant)`: Pre-fills the "Add Bot" form fields for better UX.
- `markSold(botId)`: Removes a bot from ownership and updates summary UI.
- `upgradeBot(botId)`: Increments a bot's variant to the next level in progression.
- `checkIfNeeded()`: Analyzes if a specific bot is required for the active path/rebirth, providing "Buy/Don't Buy" advice.
- `predictPath()`: Compares entered bots against known rebirth stages to automatically identify the user's Path and Rebirth level.
- `getHighestVariantForBot(path, botType)`: Helper to find the max required variant index in a path.
- `getPathBotsInOrder(pathNumber)`: Builds an ordered list of bots for advice calculation based on a specific Path number.
- `setAdviceFilter(filterName)`: Filters the "Whole Path Advice" view (All, Missing, Upgrade, Ready).
- `generateAdvice()`: Recalculates the progression summary and advice cards for the current active path.
- `getVariantIndex(variantName)`: Returns the index of a variant name within the data variants list.
- `getVariantByIndex(idx)`: Returns the variant name at a specific index (defaults to 'Base').

### Important HTML Elements (`index.html`)
- `bots-datalist`: Autocomplete options for bot names in input fields.
- `current-rebirth`: Input field where users enter their rebirth stage (e.g., "0 > 1").
- `active-path-select`: Dropdown to select the active progression Path (1 through 5).
- `bot1`, `bot2`, `bot3`: Inputs used by the path predictor to identify game stages.
- `prediction-result`: Output area for predicted path results.
- `bot-input`: Text field for naming a new bot being added to owned list.
- `variant-select`: Dropdown to select variant when adding a new bot.
- `check-needed-result`: Display area for the "Check if Needed" analysis.
- `owned-count`: Badge showing total count of active (non-sold) bots.
- `owned-bots-list`: The unordered list (`<ul>`) where owned items are dynamically injected.
- `advice-summary`: Summary box displaying Ready, Upgrade, and Missing counts.
- `advice-filters`: Button group to filter the advice list categories.
- `advice-list`: Container for the individual bot advice cards.

## Future Development Suggestions
- Add visual indicators for owned vs. unowned bots in the UI
- Expand with a path progression tracker showing completion percentages

This summary ensures future agents can quickly understand the project's purpose, data structure, and logic flow.
