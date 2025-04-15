/**
 * Utility functions for Hearthstone deck info
 */

// Format set name from code to readable text
export function formatSetName(setName) {
	if (!setName) return 'Unknown Set';

	// Special cases
	const specialCases = {
		CORE: 'Core',
		EXPERT1: 'Classic',
		HOF: 'Hall of Fame',
		TGT: 'The Grand Tournament',
		GANGS: 'Mean Streets of Gadgetzan',
		UNGORO: "Journey to Un'Goro",
		ICECROWN: 'Knights of the Frozen Throne',
		LOOTAPALOOZA: 'Kobolds & Catacombs',
		GILNEAS: 'The Witchwood',
		BOOMSDAY: 'The Boomsday Project',
		TROLL: "Rastakhan's Rumble",
		DALARAN: 'Rise of Shadows',
		ULDUM: 'Saviors of Uldum',
		DRAGONS: 'Descent of Dragons',
		YEAR_OF_THE_DRAGON: "Galakrond's Awakening",
		BLACK_TEMPLE: 'Ashes of Outland',
		SCHOLOMANCE: 'Scholomance Academy',
		DARKMOON_FAIRE: 'Madness at the Darkmoon Faire',
		THE_BARRENS: 'Forged in the Barrens',
		STORMWIND: 'United in Stormwind',
		ALTERAC_VALLEY: 'Fractured in Alterac Valley',
		THE_SUNKEN_CITY: 'Voyage to the Sunken City',
		REVENDRETH: 'Murder at Castle Nathria',
		RETURN_OF_THE_LICH_KING: 'March of the Lich King',
		PATH_OF_ARTHAS: 'Path of Arthas',
		TITANS: 'Titans',
		BATTLE_OF_THE_BANDS: 'Battle of the Bands',
		WONDERS: 'Festival of Legends',
		HEIST: 'Rise of Shadows Adventure',
		TAVERNS_OF_TIME: 'Taverns of Time',
		BAD: 'Showdown in the Badlands',
		TOY: "Whizbang's Workshop",
		PPP: 'Perils in Paradise',
		DREAM: 'Into the Emerald Dream',
		LEGACY: 'Legacy',
	};

	if (specialCases[setName]) {
		return specialCases[setName];
	}

	// General case: replace underscores with spaces and capitalize each word
	return setName
		.toLowerCase()
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (l) => l.toUpperCase());
}

// Get CSS class for rarity color
export function getRarityColor(rarity) {
	switch (rarity) {
		case 'COMMON':
			return 'bg-gradient-to-r from-gray-600 to-gray-700';
		case 'RARE':
			return 'bg-gradient-to-r from-blue-600 to-blue-800';
		case 'EPIC':
			return 'bg-gradient-to-r from-purple-600 to-purple-900';
		case 'LEGENDARY':
			return 'bg-gradient-to-r from-orange-500 to-red-600';
		default:
			return 'bg-gradient-to-r from-gray-700 to-gray-900';
	}
}

// Get CSS class for rarity text color
export function getRarityTextColor(rarity) {
	switch (rarity) {
		case 'COMMON':
			return 'text-gray-300';
		case 'RARE':
			return 'text-blue-400';
		case 'EPIC':
			return 'text-purple-400';
		case 'LEGENDARY':
			return 'text-hearthstone-gold';
		default:
			return 'text-white';
	}
}

// Get dust cost based on rarity
export function getDustCost(rarity) {
	switch (rarity) {
		case 'COMMON':
			return 40;
		case 'RARE':
			return 100;
		case 'EPIC':
			return 400;
		case 'LEGENDARY':
			return 1600;
		default:
			return 0;
	}
}
