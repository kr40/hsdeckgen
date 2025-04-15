/**
 * Rendering functionality for Hearthstone Deck Info
 */
import { getRarityColor, getRarityTextColor } from './utils.js';

/**
 * Renders a deck list with sorted cards and stats
 * @param {Object} params - Parameters for rendering
 * @param {Array} params.sortedCards - Array of sorted card objects
 * @param {string} params.deckName - Name of the deck
 * @param {string} params.deckClass - Class of the deck
 * @param {string} params.deckFormat - Format of the deck
 * @param {number} params.totalCards - Total number of cards
 * @param {number} params.totalDust - Total dust cost
 * @param {Object} params.rarityTypes - Count of each rarity type
 * @param {Object} params.manaCurve - Mana curve data
 * @param {number} params.maxCount - Maximum count for a single mana cost
 * @returns {string} HTML content for the deck list
 */
export function renderDeckList({
	sortedCards,
	deckName,
	deckClass,
	deckFormat,
	totalCards,
	totalDust,
	rarityTypes,
	manaCurve,
	maxCount,
}) {
	const html = `
        <div class="mb-5">
            <div id="deck-analysis" class="bg-hearthstone-dark bg-opacity-80 rounded-lg shadow-xl p-5 border-2 border-hearthstone-gold w-full">
                <h3 class="text-xl text-hearthstone-gold font-display mb-3 text-center">Deck Analysis</h3>
                <div class="animate-pulse flex flex-col space-y-2">
                    <div class="h-4 bg-gray-500 rounded w-3/4 mx-auto"></div>
                    <div class="h-4 bg-gray-500 rounded w-full"></div>
                    <div class="h-4 bg-gray-500 rounded w-5/6 mx-auto"></div>
                    <div class="h-4 bg-gray-500 rounded w-full"></div>
                    <div class="h-4 bg-gray-500 rounded w-4/5 mx-auto"></div>
                </div>
            </div>
        </div>

        <div class="flex flex-col md:flex-row gap-4 font-roboto">
            <div class="w-full md:w-2/3">
                <h3 class="text-xl text-hearthstone-gold font-display mb-4 pb-2 border-b-2 border-hearthstone-gold">Card List</h3>
                <ul class="space-y-2 mb-4">
                    ${sortedCards
											.map(
												(card, index) => `
                    <li class="flex items-center ${getRarityColor(
											card.rarity
										)} rounded-md overflow-hidden shadow-lg pl-1 border border-hearthstone-gold card-item hover:border-white cursor-pointer"
                        data-card-name="${card.name}"
                        data-card-id="${card.id}"
                        style="animation-delay: ${index * 0.05}s">
                        <div class="w-7 h-7 flex-shrink-0 bg-hearthstone-dark bg-opacity-80 rounded-full flex items-center justify-center text-hearthstone-gold font-bold text-sm mr-2 border border-hearthstone-gold shadow">
                            ${card.cost}
                        </div>
                        <div class="flex-grow flex flex-col justify-center py-1.5 px-2">
                            <span class="text-white font-semibold text-sm">${card.name}</span>
                            <span class="text-gray-300 text-xs">${card.set}</span>
                        </div>
                        <div class="text-right mr-2">
                            <span class="text-white text-xs font-medium bg-hearthstone-dark bg-opacity-60 px-1.5 py-0.5 rounded-full border border-hearthstone-gold">${
															card.rarity
														}</span>
                        </div>
                        <div class="w-7 h-7 flex-shrink-0 bg-hearthstone-dark bg-opacity-80 rounded-full flex items-center justify-center mr-2 border border-hearthstone-gold shadow">
                            <span class="text-hearthstone-gold font-bold text-sm">
                                x${card.count}
                            </span>
                        </div>
                    </li>
                    `
											)
											.join('')}
                </ul>
            </div>

            <div class="w-full md:w-1/3 space-y-4">
                <div class="bg-hearthstone-dark bg-opacity-80 rounded-lg shadow-xl p-4 border-2 border-hearthstone-gold">
                    <h3 class="text-xl text-hearthstone-gold font-display mb-3 text-center">Deck Information</h3>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div class="bg-black bg-opacity-60 p-2 rounded-lg border border-hearthstone-brown">
                            <p class="text-gray-400 text-xs mb-0.5">Deck Name</p>
                            <p class="font-semibold text-white text-sm">${deckName}</p>
                        </div>
                        <div class="bg-black bg-opacity-60 p-2 rounded-lg border border-hearthstone-brown">
                            <p class="text-gray-400 text-xs mb-0.5">Class</p>
                            <p class="font-semibold text-white text-sm">${deckClass}</p>
                        </div>
                        <div class="bg-black bg-opacity-60 p-2 rounded-lg border border-hearthstone-brown">
                            <p class="text-gray-400 text-xs mb-0.5">Format</p>
                            <p class="font-semibold text-white text-sm">${deckFormat}</p>
                        </div>
                        <div class="bg-black bg-opacity-60 p-2 rounded-lg border border-hearthstone-brown">
                            <p class="text-gray-400 text-xs mb-0.5">Total Cards</p>
                            <p class="font-semibold text-white text-sm">${totalCards}</p>
                        </div>
                        <div class="col-span-2 bg-black bg-opacity-60 p-2 rounded-lg border border-hearthstone-brown">
                            <p class="text-gray-400 text-xs mb-0.5">Total Dust Cost</p>
                            <p class="font-semibold text-white text-sm">${totalDust}</p>
                        </div>
                    </div>
                    <button
                        class="copyDeckCode mt-4 w-full bg-gradient-to-r from-hearthstone-gold to-yellow-600 text-hearthstone-brown py-2 px-4 rounded-md transition duration-300 font-bold shadow-lg transform hover:scale-105 text-sm"
                        onclick="copyDeckCode()">
                        Copy Deck Code
                    </button>
                </div>

                <div class="bg-hearthstone-dark bg-opacity-80 rounded-lg shadow-xl p-4 border-2 border-hearthstone-gold">
                    <h3 class="text-xl text-hearthstone-gold font-display mb-3 text-center">Card Rarities</h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${Object.entries(rarityTypes)
													.map(
														([rarity, count]) => `
                        <div class="flex justify-between items-center bg-black bg-opacity-50 p-2 rounded-md border border-hearthstone-brown">
                            <span class="${getRarityTextColor(rarity)} text-sm font-medium">${rarity}</span>
                            <span class="bg-hearthstone-brown text-white px-2 py-0.5 rounded-full text-xs font-bold">${count}</span>
                        </div>
                        `
													)
													.join('')}
                    </div>
                </div>

                <div class="bg-hearthstone-dark bg-opacity-80 rounded-lg shadow-xl p-4 border-2 border-hearthstone-gold">
                    <h3 class="text-xl text-hearthstone-gold font-display mb-3 text-center">Mana Curve</h3>
                    <div class="flex flex-col space-y-1.5">
                        ${Array.from({ length: 11 }, (_, i) => i)
													.map(
														(cost) => `
                        <div class="flex items-center text-xs">
                            <div class="w-6 text-right mr-2 text-hearthstone-gold font-bold">${
															cost === 10 ? '10+' : cost
														}</div>
                            <div class="flex-grow h-4 bg-black bg-opacity-60 relative rounded-full overflow-hidden border border-hearthstone-brown">
                                <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
                                    style="width: ${((manaCurve[cost] || 0) / maxCount) * 100}%"></div>
                            </div>
                            <div class="w-6 text-left ml-2 text-white font-bold">${manaCurve[cost] || 0}</div>
                        </div>
                        `
													)
													.join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

	return html;
}
