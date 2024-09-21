const deckList = document.getElementById('deck-list');
let deckCode; // Declare this at the top of your file, outside any function

function formatSetName(setName) {
	if (!setName) return 'Unknown Set'; // Handle undefined or null setName

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

function getRarityColor(rarity) {
	switch (rarity) {
		case 'COMMON':
			return 'text-gray-700 dark:text-gray-300'; // Darker in light mode, lighter in dark mode
		case 'RARE':
			return 'text-blue-600 dark:text-blue-400';
		case 'EPIC':
			return 'text-purple-600 dark:text-purple-400';
		case 'LEGENDARY':
			return 'text-orange-500 dark:text-orange-400';
		default:
			return 'text-gray-900 dark:text-white';
	}
}

function getDustCost(rarity) {
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

function getDeckList(deckListString) {
	deckList.innerHTML = '<p class="text-center">Loading...</p>';
	deckList.classList.remove('hidden');
	const apiUrl = 'https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json';

	// Check if the argument matches the expected deck list format
	const deckListMatch = deckListString.match(
		/^###\s*(.*?)#\s*Class:\s*(\w+(?: \w+)?).*#\s*Format:\s*(\w+(?: \w+)?).*#([\s\S]+)$/
	);

	let deckName = '(Only Available if Copied From HSReplay)';
	let deckClass = '(Only Available if Copied From HSReplay)';
	let deckFormat = '(Only Available if Copied From HSReplay)';

	if (deckListMatch) {
		// Extract the deck code from the deck list
		deckCode = deckListString.match(/AAECA[a-zA-Z0-9+/=]+/)[0];

		// Extract the deck name, class, and format from the deck list
		deckName = deckListMatch[1] || deckName;
		deckClass = deckListMatch[2] || deckClass;
		deckFormat = deckListMatch[3] || deckFormat;
	} else {
		// Assume the argument is a deck code and use it directly
		deckCode = deckListString;
	}

	console.log('Deck Code:', deckCode); // Log the deck code for debugging

	try {
		const decodedDeck = deckstrings.decode(deckCode);
		console.log('Decoded Deck:', decodedDeck); // Log the decoded deck for debugging

		const cardCounts = decodedDeck.cards.reduce((counts, card) => {
			const [dbfId, count] = card;
			counts[dbfId] = counts[dbfId] ? counts[dbfId] + count : count;
			return counts;
		}, {});

		fetch(apiUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((cardsData) => {
				console.log('API Response:', cardsData); // Log the API response for debugging
				if (!Array.isArray(cardsData)) {
					throw new Error('API response is not an array');
				}

				const cardInfo = cardsData.reduce((info, card) => {
					const dustCost = card.set === 'CORE' ? 0 : getDustCost(card.rarity || 'COMMON');
					info[card.dbfId] = {
						name: card.name || 'Unknown Card',
						cost: card.cost || 0,
						dustCost,
						rarity: card.rarity || 'COMMON',
						set: formatSetName(card.set),
					};
					return info;
				}, {});

				const sortedCards = Object.entries(cardCounts)
					.map(([dbfId, count]) => {
						const card = cardInfo[dbfId];
						return { ...card, count, dbfId };
					})
					.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

				// Calculate totalCards and totalDust
				const totalCards = sortedCards.reduce((total, card) => total + card.count, 0);
				const totalDust = sortedCards.reduce((total, card) => total + card.dustCost * card.count, 0);

				// Calculate rarity types and mana curve
				const rarityTypes = {};
				const manaCurve = {};
				sortedCards.forEach((card) => {
					rarityTypes[card.rarity] = (rarityTypes[card.rarity] || 0) + card.count;
					manaCurve[card.cost] = (manaCurve[card.cost] || 0) + card.count;
				});

				const maxManaCost = Math.max(...Object.keys(manaCurve).map(Number));
				const maxCount = Math.max(...Object.values(manaCurve));

				let html = `
                    <div class="flex flex-col md:flex-row gap-6 font-roboto">
                        <div class="w-full md:w-2/3">
                            <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Card List</h3>
                            <ul class="space-y-2 mb-4">
                                ${sortedCards
																	.map(
																		(card) => `
                                <li class="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm p-2">
                                    <div class="w-8 h-8 flex-shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                        ${card.cost}
                                    </div>
                                    <div class="flex-grow flex flex-col justify-center">
                                        <span class="${getRarityColor(card.rarity)} text-sm font-medium">${
																			card.name
																		}</span>
                                        <span class="text-gray-600 dark:text-gray-400 text-xs">${card.set}</span>
                                    </div>
                                    <div class="text-right mr-3">
                                        <span class="${getRarityColor(card.rarity)} text-xs font-medium">${
																			card.rarity
																		}</span>
                                    </div>
                                    <div class="w-8 h-8 flex-shrink-0 bg-gray-300 dark:bg-gray-500 rounded-full flex items-center justify-center">
                                        <span class="text-gray-800 dark:text-white font-bold text-sm">
                                            x${card.count}
                                        </span>
                                    </div>
                                </li>
                            `
																	)
																	.join('')}
                            </ul>
                        </div>

                        <div class="w-full md:w-1/3 space-y-6">
                            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg p-4">
                                <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Deck Information</h3>
                                <div class="grid grid-cols-1 gap-3 text-sm">
                                    <div class="bg-white dark:bg-gray-600 p-3 rounded-lg">
                                        <p class="text-gray-600 dark:text-gray-400">Deck Name</p>
                                        <p class="font-semibold text-gray-800 dark:text-white">${deckName}</p>
                                    </div>
                                    <div class="bg-white dark:bg-gray-600 p-3 rounded-lg">
                                        <p class="text-gray-600 dark:text-gray-400">Class</p>
                                        <p class="font-semibold text-gray-800 dark:text-white">${deckClass}</p>
                                    </div>
                                    <div class="bg-white dark:bg-gray-600 p-3 rounded-lg">
                                        <p class="text-gray-600 dark:text-gray-400">Format</p>
                                        <p class="font-semibold text-gray-800 dark:text-white">${deckFormat}</p>
                                    </div>
                                    <div class="bg-white dark:bg-gray-600 p-3 rounded-lg">
                                        <p class="text-gray-600 dark:text-gray-400">Total Cards</p>
                                        <p class="font-semibold text-gray-800 dark:text-white">${totalCards}</p>
                                    </div>
                                    <div class="bg-white dark:bg-gray-600 p-3 rounded-lg">
                                        <p class="text-gray-600 dark:text-gray-400">Total Dust Cost</p>
                                        <p class="font-semibold text-gray-800 dark:text-white">${totalDust}</p>
                                    </div>
                                </div>
                                <button
                                    class="copyDeckCode mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition duration-300 font-medium"
                                    onclick="copyDeckCode()">
                                    Copy Deck Code
                                </button>
                            </div>

                            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg p-4">
                                <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Card Rarities</h3>
                                <ul class="space-y-2">
                                    ${Object.entries(rarityTypes)
																			.map(
																				([rarity, count]) => `
                                        <li class="flex justify-between items-center">
                                            <span class="${getRarityColor(rarity)} text-sm">${rarity}</span>
                                            <span class="bg-white dark:bg-gray-600 px-2 py-1 rounded-full text-xs text-gray-800 dark:text-white">${count}</span>
                                        </li>
                                    `
																			)
																			.join('')}
                                </ul>
                            </div>

                            <div class="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg p-4">
                                <h3 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Mana Curve</h3>
                                <div class="flex flex-col space-y-2">
                                    ${Array.from({ length: 11 }, (_, i) => i)
																			.map(
																				(cost) => `
                                    <div class="flex items-center text-sm">
                                        <div class="w-6 text-right mr-2 text-gray-600 dark:text-gray-400">${
																					cost === 10 ? '10+' : cost
																				}</div>
                                        <div class="flex-grow h-4 bg-gray-200 dark:bg-gray-600 relative rounded-full overflow-hidden">
                                            <div class="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                                                style="width: ${((manaCurve[cost] || 0) / maxCount) * 100}%"></div>
                                        </div>
                                        <div class="w-6 text-left ml-2 text-gray-800 dark:text-white">${
																					manaCurve[cost] || 0
																				}</div>
                                    </div>
                                `
																			)
																			.join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

				deckList.innerHTML = html;
			})
			.catch((error) => {
				console.error('Fetch error:', error);
				deckList.innerHTML = `<p class="text-red-600">Error: Failed to fetch deck data. ${error.message}</p>`;
			});
	} catch (error) {
		console.error('Decoding error:', error);
		deckList.innerHTML = `<p class="text-red-600">Error: Failed to decode deck string. ${error.message}</p>`;
	}

	deckList.classList.remove('hidden');
}

document.querySelector('form').addEventListener('submit', (event) => {
	event.preventDefault();
	const deckCode = document.getElementById('deck-code').value;
	getDeckList(deckCode);
});

// Get the modal
const modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// Get the message element
const messageElement = document.getElementById('modal-message');

// Update the modal display logic
function showModal(message) {
	messageElement.textContent = message;
	modal.classList.remove('hidden');
	setTimeout(() => {
		modal.classList.add('hidden');
	}, 800);
}

// Update modal close logic
span.onclick = function () {
	modal.classList.add('hidden');
};

// Update modal close logic
window.onclick = function (event) {
	if (event.target == modal) {
		modal.classList.add('hidden');
	}
};

function copyDeckCode() {
	navigator.clipboard
		.writeText(deckCode)
		.then(() => {
			showModal('Deck Code Copied to the Clipboard!');
		})
		.catch((error) => {
			showModal(`Error copying deck code to clipboard: ${error}`);
		});
}

// Add dark mode toggle functionality
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
	document.documentElement.classList.toggle('dark');
});

// Initialize dark mode based on user preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	document.documentElement.classList.add('dark');
}
