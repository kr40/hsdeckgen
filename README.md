# Hearthstone Deck Info

A web application that decodes and displays detailed information about Hearthstone decks.

## Features

- **Deck Decoding**: Paste your Hearthstone deck code to view detailed information
- **Card List**: View all cards in the deck with their mana cost, name, set, and rarity
- **Deck Statistics**: See total cards, dust cost, rarity breakdown, and mana curve
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- HTML/CSS/JavaScript
- Tailwind CSS for styling
- Deckstrings library for deck code parsing
- HearthstoneJSON API for card data

## Project Structure

```
├── css/
│   └── styles.css        # Custom styles
├── js/
│   ├── app.js            # Main application logic
│   └── utils.js          # Utility functions
├── index.html            # Main HTML file
└── README.md             # Project documentation
```

## How to Use

1. Open the application in your browser
2. Paste a Hearthstone deck code in the input field
3. Click "Generate Deck Info" to view the deck details

## Deck Code Format

The application accepts:
- Raw deck codes (e.g., `AAECAZIRAA==`)
- Full deck lists copied from HSReplay

## Development

To run this project locally:

1. Clone the repository
2. Start a local server (e.g., `http-server`)
3. Open `http://localhost:8080` in your browser

## License

MIT
