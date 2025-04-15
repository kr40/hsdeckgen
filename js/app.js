/**
 * Main application code for Hearthstone Deck Info
 */
import { initializeCardPreviews, setupCardHover } from './card-preview.js';
import { analyzeDeck } from './deck-analysis.js';
import { getClassName } from './hero-classes.js';
import { renderDeckList } from './render.js';
import { formatSetName, getDustCost } from './utils.js';

// DOM Elements
const deckList = document.getElementById('deck-list');
const form = document.querySelector('.deck-form');
const deckCodeInput = document.getElementById('deck-code');
const modal = document.getElementById('myModal');
const modalClose = document.getElementsByClassName('close')[0];
const messageElement = document.getElementById('modal-message');

// State
let deckCode;
let currentDeckCards = [];
let currentDeckClass = '';
let cardDatabase = null;

/**
 * Get deck list data from a deck code or deck list string
 * @param {string} deckListString - The deck code or deck list string
 */
async function getDeckList(deckListString) {
	deckList.innerHTML =
		'<div class="flex justify-center items-center p-10"><div class="animate-spin rounded-full h-16 w-16 border-b-4 border-hearthstone-gold"></div><p class="ml-4 text-hearthstone-gold font-display text-xl">Loading...</p></div>';
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

	console.log('Deck Code:', deckCode);

	try {
		const decodedDeck = deckstrings.decode(deckCode);
		console.log('Decoded Deck:', decodedDeck);

		// Store the class for AI analysis
		currentDeckClass = decodedDeck.heroes[0] ? getClassName(decodedDeck.heroes[0]) : deckClass;

		const cardCounts = decodedDeck.cards.reduce((counts, card) => {
			const [dbfId, count] = card;
			counts[dbfId] = counts[dbfId] ? counts[dbfId] + count : count;
			return counts;
		}, {});

		const response = await fetch(apiUrl);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const cardsData = await response.json();
		if (!Array.isArray(cardsData)) {
			throw new Error('API response is not an array');
		}

		// Store card database for image lookup
		cardDatabase = cardsData;

		// Build card info
		const cardInfo = cardsData.reduce((info, card) => {
			const dustCost = card.set === 'CORE' ? 0 : getDustCost(card.rarity || 'COMMON');
			info[card.dbfId] = {
				name: card.name || 'Unknown Card',
				cost: card.cost || 0,
				dustCost,
				rarity: card.rarity || 'COMMON',
				set: formatSetName(card.set),
				cardClass: card.cardClass,
				dbfId: card.dbfId,
				mechanics: card.mechanics || [],
				text: card.text || '',
				type: card.type || '',
				id: card.id || '', // Card ID for image lookup
			};
			return info;
		}, {});

		// Sort cards by mana cost and name
		const sortedCards = Object.entries(cardCounts)
			.map(([dbfId, count]) => {
				const card = cardInfo[dbfId];
				return { ...card, count, dbfId };
			})
			.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

		// Store current deck cards for AI analysis
		currentDeckCards = sortedCards;

		// Calculate totals and stats
		const totalCards = sortedCards.reduce((total, card) => total + card.count, 0);
		const totalDust = sortedCards.reduce((total, card) => total + card.dustCost * card.count, 0);

		// Calculate rarity types and mana curve
		const rarityTypes = {};
		const manaCurve = {};
		sortedCards.forEach((card) => {
			rarityTypes[card.rarity] = (rarityTypes[card.rarity] || 0) + card.count;
			manaCurve[card.cost] = (manaCurve[card.cost] || 0) + card.count;
		});

		const maxCount = Math.max(...Object.values(manaCurve));

		// Generate HTML for the deck list
		const html = renderDeckList({
			sortedCards,
			deckName,
			deckClass,
			deckFormat,
			totalCards,
			totalDust,
			rarityTypes,
			manaCurve,
			maxCount,
		});

		deckList.innerHTML = html;

		// Generate deck analysis
		analyzeDeck(sortedCards, deckClass, deckFormat);

		// Initialize card hover previews
		initializeCardPreviews();
	} catch (error) {
		console.error('Error:', error);
		deckList.innerHTML = `<div class="p-10 text-center">
			<p class="text-red-500 text-xl font-bold mb-4">Error: ${error.message}</p>
			<p class="text-gray-300">Please check your deck code and try again.</p>
		</div>`;
	}
}

/**
 * Show a modal message
 * @param {string} message - The message to display
 */
function showModal(message) {
	messageElement.textContent = message;
	modal.classList.remove('hidden');
	setTimeout(() => {
		modal.classList.add('hidden');
	}, 800);
}

/**
 * Copy the deck code to clipboard
 */
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

// Expose functions to window for event handlers
window.getDeckList = getDeckList;
window.copyDeckCode = copyDeckCode;
window.loadDeck = getDeckList; // Alias for getDeckList for saved deck buttons

// Event Listeners
form.addEventListener('submit', (event) => {
	event.preventDefault();
	getDeckList(deckCodeInput.value);
});

modalClose.onclick = () => modal.classList.add('hidden');

window.onclick = (event) => {
	if (event.target == modal) {
		modal.classList.add('hidden');
	}
};

// Setup card hover when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	setupCardHover();
});

// Add a mutation observer to handle dynamically added card items
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (mutation.type === 'childList' && mutation.addedNodes.length) {
			setupCardHover();
		}
	});
});

// Start observing the deck list element for changes
if (deckList) {
	observer.observe(deckList, { childList: true, subtree: true });
}
