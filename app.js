const deckList = document.getElementById('deck-list');

function getDeckList(deckListString) {
	deckList.textContent = 'Loading...';
	const apiUrl = 'https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json';
	const deckCodeMatch = deckListString.match(/Class:\s*(\w+).*Format:\s*(\w+)/);
	if (!deckCodeMatch) {
		deckList.textContent = 'Error: Invalid deck list string.';
		return;
	}
	const deckClass = deckCodeMatch[1] || 'Unavailable'; // set to 'Unavailable' if not found
	const deckFormat = deckCodeMatch[2] || 'Unavailable'; // set to 'Unavailable' if not found
	const deckCode = deckListString.match(/AAECA[a-zA-Z0-9+/=]+/)[0];
	const cardCounts = deckstrings.decode(deckCode).cards.reduce((counts, card) => {
		const [dbfId, count] = card;
		counts[dbfId] = counts[dbfId] ? counts[dbfId] + count : count;
		return counts;
	}, {});

	fetch(apiUrl)
		.then((response) => response.json())
		.then((cardsData) => {
			const cardInfo = cardsData.reduce((info, card) => {
				const dustCost = card.set === 'CORE' ? 0 : getDustCost(card.rarity);
				info[card.dbfId] = { name: card.name, cost: card.cost, dustCost, rarity: card.rarity };
				return info;
			}, {});
			const cardList = Object.entries(cardCounts)
				.map(([dbfId, count]) => {
					const card = cardInfo[dbfId];
					return { name: card.name, cost: card.cost, dustCost: card.dustCost, rarity: card.rarity, count };
				})
				.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name))
				.map(({ name, cost, dustCost, rarity, count }) => {
					const totalDust = dustCost * count;
					return `${cost} - [${name} - x${count}] - ${rarity}`;
				})
				.join('\n');
			const totalCards = Object.values(cardCounts).reduce((total, count) => total + count, 0);
			const totalDust = Object.entries(cardCounts)
				.map(([dbfId, count]) => {
					const card = cardInfo[dbfId];
					return card.dustCost * count;
				})
				.reduce((total, dust) => total + dust, 0);
			const cardTypes = Object.entries(cardCounts).reduce((types, [dbfId, count]) => {
				const card = cardInfo[dbfId];
				types[card.rarity] = types[card.rarity] ? types[card.rarity] + count : count;
				types[`Mana ${card.cost}`] = types[`Mana ${card.cost}`] ? types[`Mana ${card.cost}`] + count : count;
				return types;
			}, {});
			const rarityTypes = Object.entries(cardTypes)
				.filter(([type]) => !type.startsWith('Mana '))
				.map(([rarity, count]) => `${rarity} Cards : ${count}`);
			const manaCostTypes = Object.entries(cardTypes)
				.filter(([type]) => type.startsWith('Mana '))
				.sort(([typeA], [typeB]) => parseInt(typeA.split(' ')[1]) - parseInt(typeB.split(' ')[1]))
				.map(([type, count]) => `${type} : ${count}`);
			const cardTypesList = `${rarityTypes.join('\n')}\n\nMana Curve:\n\n${manaCostTypes.join('\n')}`;
			deckList.textContent = `Deck Code:\n\n${deckCode}\n\nClass: ${deckClass}\nFormat: ${deckFormat}\n\nDeck List:\n\n${cardList}\n\nCard Rarities:\n\n${cardTypesList}\n\nTotal Number of Cards: ${totalCards}\nTotal Dust Cost: ${totalDust}`;
		})
		.catch((error) => {
			deckList.textContent = 'Error: Failed to fetch deck data.';
		});
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

document.querySelector('form').addEventListener('submit', (event) => {
	event.preventDefault();
	const deckCode = document.getElementById('deck-code').value;
	getDeckList(deckCode);
});
