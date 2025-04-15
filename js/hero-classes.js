/**
 * Hero classes functionality for Hearthstone Deck Info
 */

/**
 * Get class name from hero ID
 * @param {number} heroId - The hero ID from the deck data
 * @returns {string} The class name
 */
export function getClassName(heroId) {
	const heroClasses = {
		// Warrior
		7: 'Warrior',
		31: 'Warrior',
		893: 'Warrior',
		1066: 'Warrior',
		2826: 'Warrior',
		2827: 'Warrior',
		7169: 'Warrior',
		56550: 'Warrior',

		// Paladin
		930: 'Paladin',
		1066: 'Paladin',
		2828: 'Paladin',
		2829: 'Paladin',
		53187: 'Paladin',

		// Hunter
		671: 'Hunter',
		694: 'Hunter',
		1205: 'Hunter',
		2825: 'Hunter',
		2824: 'Hunter',
		4269: 'Hunter',
		14178: 'Hunter',
		60224: 'Hunter',

		// Mage
		637: 'Mage',
		274: 'Mage',
		1706: 'Mage',
		2829: 'Mage',
		2830: 'Mage',
		39117: 'Mage',
		42064: 'Mage',

		// Priest
		1091: 'Priest',
		813: 'Priest',
		41887: 'Priest',
		54816: 'Priest',

		// Rogue
		7: 'Rogue',
		930: 'Rogue',
		40195: 'Rogue',
		47631: 'Rogue',

		// Shaman
		893: 'Shaman',
		1066: 'Shaman',
		40523: 'Shaman',
		55963: 'Shaman',

		// Warlock
		274: 'Warlock',
		31: 'Warlock',
		41887: 'Warlock',
		51834: 'Warlock',

		// Druid
		274: 'Druid',
		274: 'Druid',
		40323: 'Druid',
		56358: 'Druid',

		// Death Knight
		56550: 'Death Knight',

		// Demon Hunter
		60224: 'Demon Hunter',
	};

	return heroClasses[heroId] || 'Unknown';
}
