/**
 * Deck analysis functionality for Hearthstone Deck Info
 */

/**
 * Analyze deck and provide AI-generated summary
 * @param {Array} cards - Array of card objects
 * @param {string} deckClass - Class of the deck
 * @param {string} deckFormat - Format of the deck
 */
export async function analyzeDeck(cards, deckClass, deckFormat) {
	const deckAnalysisSection = document.getElementById('deck-analysis');
	if (!deckAnalysisSection) return;

	deckAnalysisSection.innerHTML =
		'<div class="animate-pulse flex flex-col space-y-2"><div class="h-4 bg-gray-500 rounded w-3/4"></div><div class="h-4 bg-gray-500 rounded w-full"></div><div class="h-4 bg-gray-500 rounded w-5/6"></div><div class="h-4 bg-gray-500 rounded w-full"></div><div class="h-4 bg-gray-500 rounded w-4/5"></div></div>';

	// Extract key information about the deck
	const cardNames = cards.map((card) => `${card.name} (x${card.count})`);
	const legendaries = cards.filter((card) => card.rarity === 'LEGENDARY').map((card) => card.name);
	const manaDistribution = {};
	cards.forEach((card) => {
		manaDistribution[card.cost] = (manaDistribution[card.cost] || 0) + card.count;
	});

	// Calculate average mana cost
	const totalMana = cards.reduce((sum, card) => sum + card.cost * card.count, 0);
	const totalCards = cards.reduce((sum, card) => sum + card.count, 0);
	const averageMana = (totalMana / totalCards).toFixed(2);

	// Find mechanic tags
	const mechanics = new Set();
	cards.forEach((card) => {
		if (card.mechanics && Array.isArray(card.mechanics)) {
			card.mechanics.forEach((mechanic) => mechanics.add(mechanic));
		}
	});

	// Generate analysis based on gathered information
	setTimeout(() => {
		const analysis = generateDeckAnalysis(cards, deckClass, deckFormat, {
			legendaries,
			averageMana,
			mechanics: Array.from(mechanics),
		});

		deckAnalysisSection.innerHTML = `
			<h3 class="text-xl text-hearthstone-gold font-display mb-3 text-center">Deck Analysis</h3>
			<div class="bg-black bg-opacity-60 p-4 rounded-lg border border-hearthstone-brown">
				<p class="text-gray-300 whitespace-pre-line">${analysis}</p>
				<div class="text-right mt-3">
					<span class="text-xs text-gray-400">Analysis generated using deck statistics</span>
				</div>
			</div>
		`;
	}, 1500); // Simulate AI processing time
}

/**
 * AI deck analysis generator based on deck composition
 * @param {Array} cards - Array of card objects
 * @param {string} deckClass - Class of the deck
 * @param {string} deckFormat - Format of the deck
 * @param {Object} stats - Deck statistics
 * @returns {string} Analysis text
 */
function generateDeckAnalysis(cards, deckClass, deckFormat, stats) {
	// Check for common deck archetypes based on cards and class
	let deckType = determineArchetype(cards, deckClass);

	// Generate analysis text
	let analysis = `This appears to be a ${deckType} ${deckClass} deck for ${deckFormat} format. `;

	// Add mana curve analysis
	if (stats.averageMana < 3.0) {
		analysis += `With a low average mana cost of ${stats.averageMana}, this is an aggressive deck designed to put pressure on the opponent early. `;
	} else if (stats.averageMana < 4.5) {
		analysis += `With an average mana cost of ${stats.averageMana}, this is a midrange deck that can adapt to different matchups. `;
	} else {
		analysis += `With a high average mana cost of ${stats.averageMana}, this is a control or combo deck that aims to outlast the opponent. `;
	}

	// Mention legendary cards if present
	if (stats.legendaries.length > 0) {
		analysis += `The deck features key legendary cards like ${stats.legendaries.slice(0, 3).join(', ')}${
			stats.legendaries.length > 3 ? ' and others' : ''
		}, which ${stats.legendaries.length > 1 ? 'are' : 'is'} central to the deck's strategy. `;
	}

	// Add mechanic-specific analysis
	if (stats.mechanics.includes('TAUNT')) {
		analysis += `The inclusion of multiple Taunt minions suggests this deck aims to protect key assets or stall for time. `;
	}

	if (stats.mechanics.includes('BATTLECRY')) {
		analysis += `The deck utilizes numerous Battlecry effects to generate value and maintain board presence. `;
	}

	if (stats.mechanics.includes('DEATHRATTLE')) {
		analysis += `The Deathrattle synergies in this deck create persistent value and potentially sticky board states. `;
	}

	if (stats.mechanics.includes('DISCOVER')) {
		analysis += `The Discover mechanics provide flexibility and resource generation throughout the game. `;
	}

	// Class-specific analysis
	switch (deckClass) {
		case 'Warrior':
			analysis += `As a Warrior deck, it likely uses armor gain and weapons to control the pace of the game. `;
			break;
		case 'Paladin':
			analysis += `This Paladin build appears to leverage minion buffs and board development for consistent pressure. `;
			break;
		case 'Hunter':
			analysis += `This Hunter deck aims to apply constant pressure and finish with direct damage to the opponent's hero. `;
			break;
		case 'Mage':
			analysis += `The Mage's spell synergy and potential for direct damage make this a versatile threat. `;
			break;
		case 'Priest':
			analysis += `This Priest deck utilizes healing and value generation to outlast opponents. `;
			break;
		case 'Rogue':
			analysis += `As a Rogue deck, it likely employs combo mechanics and tempo plays to overwhelm the opponent. `;
			break;
		case 'Shaman':
			analysis += `This Shaman build leverages the class's versatile toolkit to adapt to different board states. `;
			break;
		case 'Warlock':
			analysis += `The Warlock's life tap ability gives this deck sustained card advantage at the cost of health. `;
			break;
		case 'Druid':
			analysis += `This Druid deck uses mana acceleration to deploy threats ahead of curve. `;
			break;
		case 'Demon Hunter':
			analysis += `The Demon Hunter's aggressive tools and mobility make this deck a persistent threat. `;
			break;
		case 'Death Knight':
			analysis += `As a Death Knight deck, it harnesses the power of Undead minions and Runes to control the battlefield. `;
			break;
	}

	// Strategy tips
	analysis += `\n\nWhen playing this deck, focus on ${getStrategyTips(
		deckType,
		deckClass
	)}. Against aggressive decks, ${getMatchupTips(deckType, 'aggro')}, while against control decks, ${getMatchupTips(
		deckType,
		'control'
	)}.`;

	return analysis;
}

/**
 * Determine deck archetype based on card composition
 * @param {Array} cards - Array of card objects
 * @param {string} deckClass - Class of the deck
 * @returns {string} Deck archetype
 */
function determineArchetype(cards, deckClass) {
	// Count card types and mechanics
	let spellCount = 0;
	let minionCount = 0;
	let weaponCount = 0;
	let lowCostCards = 0;
	let highCostCards = 0;

	const mechanics = new Set();

	cards.forEach((card) => {
		if (card.type === 'SPELL') spellCount += card.count;
		if (card.type === 'MINION') minionCount += card.count;
		if (card.type === 'WEAPON') weaponCount += card.count;

		if (card.cost <= 3) lowCostCards += card.count;
		if (card.cost >= 7) highCostCards += card.count;

		if (card.mechanics && Array.isArray(card.mechanics)) {
			card.mechanics.forEach((mechanic) => mechanics.add(mechanic));
		}
	});

	// Basic archetype determination
	if (lowCostCards > 15) {
		return 'Aggro';
	} else if (highCostCards > 5) {
		return 'Control';
	} else if (spellCount > 12) {
		return 'Spell-heavy';
	} else if (mechanics.has('COMBO')) {
		return 'Combo';
	} else {
		return 'Midrange';
	}
}

/**
 * Get strategy tips based on deck type
 * @param {string} deckType - Type of deck
 * @param {string} deckClass - Class of the deck
 * @returns {string} Strategy tips
 */
function getStrategyTips(deckType, deckClass) {
	switch (deckType) {
		case 'Aggro':
			return 'maintaining early board control and pushing face damage when possible';
		case 'Control':
			return 'efficiently answering threats and preserving your resources for the late game';
		case 'Combo':
			return 'gathering your combo pieces while staying alive with your defensive tools';
		case 'Spell-heavy':
			return 'using your spells efficiently to control the board and set up for your win condition';
		case 'Midrange':
			return 'being the aggressor against control decks and controlling the board against aggro decks';
		default:
			return 'understanding your role in each matchup and adjusting your strategy accordingly';
	}
}

/**
 * Get matchup-specific tips
 * @param {string} deckType - Type of deck
 * @param {string} opponentType - Type of opponent deck
 * @returns {string} Matchup tips
 */
function getMatchupTips(deckType, opponentType) {
	if (opponentType === 'aggro') {
		switch (deckType) {
			case 'Aggro':
				return 'focus on fighting for board control before switching to face damage';
			case 'Control':
				return 'prioritize clearing their board and stabilizing your health total';
			case 'Combo':
				return 'use your defensive tools aggressively to stay alive until you can execute your combo';
			case 'Spell-heavy':
				return 'use removal efficiently and save AOE effects for maximum impact';
			case 'Midrange':
				return 'focus on efficient trades to deny their momentum';
			default:
				return 'prioritize survival and board control in the early game';
		}
	} else {
		// control
		switch (deckType) {
			case 'Aggro':
				return 'apply constant pressure to force inefficient answers';
			case 'Control':
				return 'be patient and manage your resources to outlast their removal';
			case 'Combo':
				return 'bait out their counterplay before committing to your full combo';
			case 'Spell-heavy':
				return "save key spells for when they'll have maximum impact";
			case 'Midrange':
				return 'play aggressively and force them to have answers for each of your threats';
			default:
				return 'try to play around their removal and build incremental advantages';
		}
	}
}
