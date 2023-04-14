const deckList = document.getElementById('deck-list');
function showCopyDeckCodeButton() {
	copyDeckCodeButton.style.display = 'block';
}

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
			deckList.textContent = `Deck Name: ${deckName}\n\nClass: ${deckClass}\nFormat: ${deckFormat}\n\nDeck List:\n\n${cardList}\n\nCard Rarities:\n\n${cardTypesList}\n\nTotal Number of Cards: ${totalCards}\nTotal Dust Cost: ${totalDust}\n\nPS: If you want to copy the mini version of deck code you copied from HSReplay click the button below!`;
		})
		.catch((error) => {
			deckList.textContent = 'Error: Failed to fetch deck data.';
		});
	showCopyDeckCodeButton();
	deckList.style.display = 'flex';
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

// Get the modal
const modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// Get the message element
const messageElement = document.getElementById('modal-message');

// When the user clicks the button, open the modal
const copyDeckCodeButton = document.querySelector('.copyDeckCode');
copyDeckCodeButton.addEventListener('click', () => {
	const deckCode = document.querySelector('#deck-code').value;
	const deckCodeToCopy = deckCode.match(/AAECA[a-zA-Z0-9+/=]+/)[0];
	navigator.clipboard
		.writeText(deckCodeToCopy)
		.then(() => {
			messageElement.textContent = `Deck Code Copied to the Clipboard!`;
			modal.style.display = 'block';
			setTimeout(() => {
				modal.style.display = 'none';
			}, 800);
		})
		.catch((error) => {
			messageElement.textContent = `Error copying deck code to clipboard: ${error}`;
			modal.style.display = 'block';
			setTimeout(() => {
				modal.style.display = 'none';
			}, 800);
		});

	document.getElementById('deck-code').value = '';
});

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
	modal.style.display = 'none';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
	if (event.target == modal) {
		modal.style.display = 'none';
	}
};
