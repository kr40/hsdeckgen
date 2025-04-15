/**
 * Card preview functionality for Hearthstone Deck Info
 */

// Image cache to prevent reloading the same card image
let cardImageCache = {};

// Card preview element reference
let cardPreview;

/**
 * Initialize card hover previews
 */
export function initializeCardPreviews() {
	// Create card preview element if it doesn't exist
	if (!cardPreview) {
		cardPreview = document.createElement('div');
		cardPreview.id = 'card-preview';
		cardPreview.className =
			'fixed hidden z-50 transform scale-100 transition-all duration-200 pointer-events-none rounded-lg overflow-hidden';
		cardPreview.style.width = '286px'; // Standard Hearthstone card width
		cardPreview.style.height = '395px'; // Standard Hearthstone card height
		cardPreview.style.boxShadow = '0 5px 25px rgba(0, 0, 0, 0.8)';

		// Add loading indicator
		const loadingIndicator = document.createElement('div');
		loadingIndicator.className = 'absolute inset-0 flex items-center justify-center bg-hearthstone-dark bg-opacity-80';
		loadingIndicator.innerHTML =
			'<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hearthstone-gold"></div>';
		loadingIndicator.id = 'card-preview-loading';
		cardPreview.appendChild(loadingIndicator);

		document.body.appendChild(cardPreview);
	}

	// Add event listeners to all card items
	const cardItems = document.querySelectorAll('.card-item');
	cardItems.forEach((card) => {
		// Get card ID from data attribute
		const cardName = card.getAttribute('data-card-name');
		const cardId = card.getAttribute('data-card-id');

		if (cardId) {
			// Mouse enter - show preview
			card.addEventListener('mouseenter', (e) => showCardPreview(e, cardId, cardName));
			// Mouse move - update position
			card.addEventListener('mousemove', (e) => updatePreviewPosition(e));
			// Mouse leave - hide preview
			card.addEventListener('mouseleave', () => hideCardPreview());

			// Add card glow effect on hover
			card.addEventListener('mouseenter', () => {
				card.classList.add('ring-2', 'ring-hearthstone-gold', 'transform', 'scale-102');
			});

			card.addEventListener('mouseleave', () => {
				card.classList.remove('ring-2', 'ring-hearthstone-gold', 'transform', 'scale-102');
			});
		}
	});
}

/**
 * Show card preview
 * @param {MouseEvent} event - Mouse event
 * @param {string} cardId - Card ID for image lookup
 * @param {string} cardName - Card name for fallback display
 */
function showCardPreview(event, cardId, cardName) {
	const cardPreview = document.getElementById('card-preview');
	const loadingIndicator = document.getElementById('card-preview-loading');
	if (!cardPreview || !cardId) return;

	// Show loading indicator
	cardPreview.classList.remove('hidden');
	if (loadingIndicator) loadingIndicator.style.display = 'flex';

	// Update position immediately so loading spinner appears in the right place
	updatePreviewPosition(event);

	// Use card cache if available
	if (cardImageCache[cardId]) {
		cardPreview.style.backgroundImage = `url(${cardImageCache[cardId]})`;
		if (loadingIndicator) loadingIndicator.style.display = 'none';
		cardPreview.classList.add('scale-100');
		return;
	}

	// Construct image URL
	const imageUrl = `https://art.hearthstonejson.com/v1/render/latest/enUS/256x/${cardId}.png`;

	// Load image and show preview when loaded
	const img = new Image();
	img.onload = function () {
		cardPreview.style.backgroundImage = `url(${imageUrl})`;
		cardImageCache[cardId] = imageUrl; // Cache the image
		if (loadingIndicator) loadingIndicator.style.display = 'none';
		cardPreview.classList.add('scale-100');
	};
	img.onerror = function () {
		// If image can't be found, try alternative source
		const alternativeUrl = `https://art.hearthstonejson.com/v1/cards/latest/enUS/256x/${cardId}.png`;
		const alternativeImg = new Image();
		alternativeImg.onload = function () {
			cardPreview.style.backgroundImage = `url(${alternativeUrl})`;
			cardImageCache[cardId] = alternativeUrl; // Cache the image
			if (loadingIndicator) loadingIndicator.style.display = 'none';
			cardPreview.classList.add('scale-100');
		};
		alternativeImg.onerror = function () {
			// If still no image, show a placeholder with card name
			if (loadingIndicator) loadingIndicator.style.display = 'none';

			// Create a fallback card display
			cardPreview.style.backgroundImage = 'none';
			cardPreview.style.backgroundColor = '#2e1f1e';
			cardPreview.innerHTML = `
				<div class="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
					<div class="w-16 h-16 mb-4 bg-hearthstone-gold mask mask-squircle flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 text-hearthstone-brown">
							<path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 01.878.645 49.17 49.17 0 01.376 5.452.657.657 0 01-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 00-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 01-.595 4.845.75.75 0 01-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 01-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 01-.658.643 49.118 49.118 0 01-4.708-.36.75.75 0 01-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 005.337 15c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.656.656 0 00.659-.663 47.703 47.703 0 00-.31-4.82.75.75 0 01.83-.832c1.343.155 2.703.254 4.077.294a.64.64 0 00.657-.642z" />
						</svg>
					</div>
					<h3 class="text-hearthstone-gold text-lg font-bold">${cardName || 'Unknown Card'}</h3>
					<p class="text-gray-300 text-sm">Card image not available</p>
				</div>
			`;
			cardPreview.classList.add('scale-100');
		};
		alternativeImg.src = alternativeUrl;
	};
	img.src = imageUrl;
}

/**
 * Update preview position
 * @param {MouseEvent} event - Mouse event
 */
function updatePreviewPosition(event) {
	const cardPreview = document.getElementById('card-preview');
	if (!cardPreview) return;

	const padding = 20; // Distance from cursor
	const safetyMargin = 10; // Margin from edge of screen

	// Calculate position
	let x = event.clientX + padding;
	let y = event.clientY - cardPreview.offsetHeight / 2;

	// Ensure the card stays within viewport
	const viewportWidth = window.innerWidth;
	const viewportHeight = window.innerHeight;

	// Adjust horizontal position if it would go off-screen
	if (x + cardPreview.offsetWidth > viewportWidth - safetyMargin) {
		x = event.clientX - cardPreview.offsetWidth - padding;
	}

	// Adjust vertical position if it would go off-screen
	if (y < safetyMargin) {
		y = safetyMargin;
	} else if (y + cardPreview.offsetHeight > viewportHeight - safetyMargin) {
		y = viewportHeight - cardPreview.offsetHeight - safetyMargin;
	}

	// Apply position with smooth animation
	cardPreview.style.left = `${x}px`;
	cardPreview.style.top = `${y}px`;
}

/**
 * Hide card preview
 */
function hideCardPreview() {
	const cardPreview = document.getElementById('card-preview');
	if (cardPreview) {
		cardPreview.classList.add('hidden');
		cardPreview.classList.remove('scale-100');
		// Reset any custom fallback styling
		cardPreview.style.backgroundColor = '';

		// Keep only the loading indicator in the preview div
		const loadingIndicator = document.getElementById('card-preview-loading');
		if (cardPreview.innerHTML && loadingIndicator) {
			cardPreview.innerHTML = '';
			cardPreview.appendChild(loadingIndicator);
		}
	}
}

/**
 * Setup card hover functionality
 * This is called when the DOM is loaded and when new cards are added
 */
export function setupCardHover() {
	// Find all card items already in the DOM
	const cardItems = document.querySelectorAll('.card-item');
	if (cardItems.length > 0) {
		initializeCardPreviews();
	}
}
