const deckList = document.getElementById('deck-list');

function getDeckList(deckListString) {
	deckList.textContent = 'Loading...';
	const apiUrl = 'https://api.hearthstonejson.com/v1/latest/enUS/cards.collectible.json';
	// Check if the argument matches the expected deck list format
	const deckListMatch = deckListString.match(/^###\s*(.*?)#\s*Class:\s*(\w+).*#\s*Format:\s*(\w+).*#([\s\S]+)$/);

	let deckCode;
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
			deckList.textContent = `Deck Name: ${deckName}\n\nClass: ${deckClass}\nFormat: ${deckFormat}\n\nDeck List:\n\n${cardList}\n\nCard Rarities:\n\n${cardTypesList}\n\nTotal Number of Cards: ${totalCards}\nTotal Dust Cost: ${totalDust}\n\nDeck Code:\n\n${deckCode}\n\n`;
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
