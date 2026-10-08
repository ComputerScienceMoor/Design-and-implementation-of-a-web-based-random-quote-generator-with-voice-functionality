// ===========================
// CONFIGURATION & CONSTANTS
// ===========================

// Quotes now come from our own PHP backend (backend/get_quote.php), which
// keeps the API-Ninjas key on the server and falls back to a local quote
// bank if the external API is unreachable.
const QUOTE_ENDPOINT = 'backend/get_quote.php';
const SESSION_ENDPOINT = 'backend/session_check.php';
const FAVORITES_ENDPOINT = 'backend/favorites.php';
const LOGOUT_ENDPOINT = 'backend/logout.php';

// ===========================
// STATE MANAGEMENT
// ===========================

const appState = {
    currentQuote: null,
    quotes: [],
    favorites: [],
    stats: {
        generated: 0,
        spoken: 0,
        copied: 0,
        favorites: 0
    },
    speech: {
        isSpeaking: false,
        isPaused: false,
        currentUtterance: null,
        rate: 1
    },
    theme: localStorage.getItem('theme') || 'light'
};

// ===========================
// DOM ELEMENTS
// ===========================

const elements = {
    // Navigation
    themeToggle: document.getElementById('themeToggle'),
    navbarMenu: document.getElementById('navbarMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    favoritesNavLink: document.getElementById('favoritesNavLink'),

    // Profile Dropdown
    profileBtn: document.getElementById('profileBtn'),
    dropdownMenu: document.getElementById('dropdownMenu'),
    logoutBtn: document.getElementById('logoutBtn'),

    // Quote Card
    quoteCard: document.getElementById('quoteCard'),
    quoteLoading: document.getElementById('quoteLoading'),
    quoteContent: document.getElementById('quoteContent'),
    quoteText: document.getElementById('quoteText'),
    quoteAuthor: document.getElementById('quoteAuthor'),
    quoteTime: document.getElementById('quoteTime'),
    categoryBadge: document.getElementById('categoryBadge'),
    favoriteBtn: document.getElementById('favoriteBtn'),

    // Buttons
    generateBtn: document.getElementById('generateBtn'),
    shareBtn: document.getElementById('shareBtn'),
    copyBtn: document.getElementById('copyBtn'),

    // Voice Controls
    readBtn: document.getElementById('readBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    stopBtn: document.getElementById('stopBtn'),
    voiceSelect: document.getElementById('voiceSelect'),
    speechRate: document.getElementById('speechRate'),
    rateValue: document.getElementById('rateValue'),
    voiceStatus: document.getElementById('voiceStatus'),

    // Favorites Panel
    favoritesPanel: document.getElementById('favoritesPanel'),
    closeFavoritesBtn: document.getElementById('closeFavoritesBtn'),
    overlay: document.getElementById('overlay'),
    panelContent: document.getElementById('panelContent'),
    favoriteSearchInput: document.getElementById('favoriteSearchInput'),

    // Search & Category
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    categorySelect: document.getElementById('categorySelect'),

    // Statistics
    statGenerated: document.getElementById('statGenerated'),
    statSpoken: document.getElementById('statSpoken'),
    statCopied: document.getElementById('statCopied'),
    statFavorites: document.getElementById('statFavorites'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ===========================
// VERIFY ALL ELEMENTS LOADED
// ===========================

console.log('✅ QuoteGen Dashboard Loaded');
console.log('Quote Endpoint:', QUOTE_ENDPOINT);

// ===========================
// AUTH GUARD / CURRENT USER
// ===========================

async function requireSession() {
    try {
        const response = await fetch(SESSION_ENDPOINT, { credentials: 'same-origin' });
        const data = await response.json();

        if (!data.loggedIn) {
            window.location.href = 'login.html';
            return null;
        }

        const heroTitle = document.getElementById('heroTitle');
        const avatar = document.getElementById('userAvatar');
        const name = data.user.fullname || data.user.username || 'there';

        if (heroTitle) {
            heroTitle.textContent = `Welcome Back, ${name}`;
        }
        if (avatar) {
            const initials = name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
            avatar.textContent = initials || '?';
        }

        return data.user;
    } catch (err) {
        console.error('Session check failed:', err);
        // If the backend itself is unreachable (e.g. MySQL not running in
        // XAMPP), send the person back to login rather than showing a
        // broken dashboard.
        window.location.href = 'login.html';
        return null;
    }
}

// ===========================
// THEME MANAGEMENT
// ===========================

function initTheme() {
    if (appState.theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

elements.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    appState.theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', appState.theme);
});

// ===========================
// TOAST NOTIFICATIONS
// ===========================

function showToast(message, duration = 3000) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, duration);
}

// ===========================
// PROFILE DROPDOWN & LOGOUT
// ===========================

// Toggle dropdown menu
elements.profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.dropdownMenu.classList.toggle('active');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown')) {
        elements.dropdownMenu.classList.remove('active');
    }
});

// Logout handler
if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Close dropdown
        elements.dropdownMenu.classList.remove('active');
        
        // Show logout message
        showToast('👋 Logging out...');

        (async () => {
            try {
                await fetch(LOGOUT_ENDPOINT, { method: 'POST', credentials: 'same-origin' });
            } catch (err) {
                console.error('Logout request failed:', err);
            }

            // Clear local UI state (the actual login state lives server-side now)
            localStorage.removeItem('theme');
            sessionStorage.clear();

            appState.favorites = [];
            appState.quotes = [];
            appState.stats = {
                generated: 0,
                spoken: 0,
                copied: 0,
                favorites: 0
            };

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 800);
        })();
    });
}

// ===========================
// API FUNCTIONS
// ===========================

async function fetchQuote(category = '') {
    try {
        elements.quoteContent.style.display = 'none';
        elements.quoteLoading.style.display = 'flex';

        let url = QUOTE_ENDPOINT;
        if (category) {
            url += `?category=${encodeURIComponent(category)}`;
        }

        console.log('📡 Fetching quote from:', url);

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'same-origin'
        });

        console.log('Response Status:', response.status);

        const data = await response.json();

        if (!response.ok || !data.success) {
            showToast(data.message || 'No quotes found for this category.');
            return null;
        }

        console.log('✅ Quote received:', data.quote);

        return {
            text: data.quote.text,
            author: data.quote.author || 'Unknown',
            category: data.quote.category || category || 'Inspirational',
            timestamp: new Date()
        };
    } catch (error) {
        console.error('❌ Error fetching quote:', error);
        showToast('Could not reach the server. Make sure Apache & MySQL are running in XAMPP.');
        return null;
    }
}

// ===========================
// QUOTE DISPLAY & UPDATES
// ===========================

function displayQuote(quote) {
    if (!quote) return;

    appState.currentQuote = quote;
    appState.stats.generated++;

    elements.quoteText.textContent = `"${quote.text}"`;
    elements.quoteAuthor.textContent = `— ${quote.author}`;
    elements.categoryBadge.textContent = quote.category;
    elements.quoteTime.textContent = getTimeAgo(quote.timestamp);

    // Check if favorite
    const isFavorite = appState.favorites.some(q => q.text === quote.text);
    if (isFavorite) {
        elements.favoriteBtn.classList.add('active');
    } else {
        elements.favoriteBtn.classList.remove('active');
    }

    elements.quoteLoading.style.display = 'none';
    elements.quoteContent.style.display = 'block';

    updateStatistics();
}

function getTimeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

// ===========================
// GENERATE QUOTE HANDLER
// ===========================

async function handleGenerateQuote() {
    if (elements.generateBtn.disabled) return;

    elements.generateBtn.disabled = true;
    const category = elements.categorySelect.value;
    const quote = await fetchQuote(category);

    if (quote) {
        displayQuote(quote);
        appState.quotes.push(quote);
        showToast('✨ New quote generated!');
    }

    elements.generateBtn.disabled = false;
}

elements.generateBtn.addEventListener('click', handleGenerateQuote);

// ===========================
// CATEGORY CHANGE HANDLER
// ===========================

elements.categorySelect.addEventListener('change', handleGenerateQuote);

// ===========================
// COPY QUOTE HANDLER
// ===========================

elements.copyBtn.addEventListener('click', () => {
    if (!appState.currentQuote) return;

    const text = `"${appState.currentQuote.text}" — ${appState.currentQuote.author}`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            appState.stats.copied++;
            updateStatistics();
            showToast('📋 Quote copied to clipboard!');
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
});

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    appState.stats.copied++;
    updateStatistics();
    showToast('📋 Quote copied to clipboard!');
}

// ===========================
// SHARE HANDLER
// ===========================

elements.shareBtn.addEventListener('click', async () => {
    if (!appState.currentQuote) return;

    const text = `"${appState.currentQuote.text}" — ${appState.currentQuote.author}`;
    const shareData = {
        title: 'QuoteGen',
        text: text
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast('🚀 Quote shared!');
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        }
    } else {
        // Fallback to copy
        const text = `"${appState.currentQuote.text}" — ${appState.currentQuote.author}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('📋 Quote copied to share!');
            });
        } else {
            fallbackCopy(text);
        }
    }
});

// ===========================
// FAVORITES <-> BACKEND
// ===========================

async function loadFavorites() {
    try {
        const response = await fetch(FAVORITES_ENDPOINT, { credentials: 'same-origin' });
        const data = await response.json();
        if (data.success) {
            appState.favorites = data.favorites;
            appState.stats.favorites = appState.favorites.length;
        }
    } catch (err) {
        console.error('Could not load favorites:', err);
    }
    updateStatistics();
    renderFavorites();
}

async function addFavorite(quote) {
    try {
        const response = await fetch(FAVORITES_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ text: quote.text, author: quote.author, category: quote.category })
        });
        const data = await response.json();
        if (data.success) {
            appState.favorites.push({ id: data.id, text: quote.text, author: quote.author, category: quote.category });
            return true;
        }
    } catch (err) {
        console.error('Could not add favorite:', err);
    }
    showToast('⚠️ Could not save favorite. Check the server connection.');
    return false;
}

async function removeFavorite(id) {
    try {
        const response = await fetch(`${FAVORITES_ENDPOINT}?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        const data = await response.json();
        if (data.success) {
            appState.favorites = appState.favorites.filter(f => f.id !== id);
            return true;
        }
    } catch (err) {
        console.error('Could not remove favorite:', err);
    }
    return false;
}

// ===========================
// FAVORITE HANDLER
// ===========================

elements.favoriteBtn.addEventListener('click', async () => {
    if (!appState.currentQuote) return;

    const existing = appState.favorites.find(q => q.text === appState.currentQuote.text);

    if (existing) {
        const removed = await removeFavorite(existing.id);
        if (removed) {
            elements.favoriteBtn.classList.remove('active');
            showToast('❌ Removed from favorites');
        }
    } else {
        const added = await addFavorite(appState.currentQuote);
        if (added) {
            elements.favoriteBtn.classList.add('active');
            showToast('❤️ Added to favorites!');
        }
    }

    appState.stats.favorites = appState.favorites.length;
    updateStatistics();
    renderFavorites();
});

// ===========================
// FAVORITES PANEL
// ===========================

elements.favoritesNavLink.addEventListener('click', (e) => {
    e.preventDefault();
    openFavoritesPanel();
});

function openFavoritesPanel() {
    elements.favoritesPanel.classList.add('open');
    elements.overlay.classList.add('active');
}

function closeFavoritesPanel() {
    elements.favoritesPanel.classList.remove('open');
    elements.overlay.classList.remove('active');
}

elements.closeFavoritesBtn.addEventListener('click', closeFavoritesPanel);
elements.overlay.addEventListener('click', closeFavoritesPanel);

function renderFavorites() {
    let searchTerm = elements.favoriteSearchInput.value.toLowerCase();
    let filteredFavorites = appState.favorites.filter(quote =>
        quote.text.toLowerCase().includes(searchTerm) ||
        quote.author.toLowerCase().includes(searchTerm)
    );

    if (filteredFavorites.length === 0) {
        if (appState.favorites.length === 0) {
            elements.panelContent.innerHTML = '<p class="empty-state">No favorite quotes yet. Heart your first quote!</p>';
        } else {
            elements.panelContent.innerHTML = '<p class="empty-state">No quotes match your search.</p>';
        }
        return;
    }

    elements.panelContent.innerHTML = filteredFavorites.map((quote) => `
        <div class="favorite-item">
            <p class="favorite-quote-text">${quote.text}</p>
            <div class="favorite-quote-meta">
                <span class="favorite-author">— ${quote.author}</span>
                <span class="favorite-category">${quote.category}</span>
            </div>
            <button class="favorite-remove-btn" data-id="${quote.id}">Remove</button>
        </div>
    `).join('');

    document.querySelectorAll('.favorite-remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.dataset.id);
            const removed = await removeFavorite(id);
            if (removed) {
                appState.stats.favorites = appState.favorites.length;
                updateStatistics();
                renderFavorites();
                showToast('❌ Removed from favorites');
            }
        });
    });
}

elements.favoriteSearchInput.addEventListener('input', renderFavorites);

// ===========================
// SEARCH HANDLER
// ===========================

elements.searchInput.addEventListener('input', () => {
    const searchTerm = elements.searchInput.value.toLowerCase();

    if (searchTerm.length === 0) {
        elements.searchResults.style.display = 'none';
        return;
    }

    const results = appState.quotes.filter(quote =>
        quote.text.toLowerCase().includes(searchTerm) ||
        quote.author.toLowerCase().includes(searchTerm)
    );

    if (results.length === 0) {
        elements.searchResults.style.display = 'none';
        return;
    }

    elements.searchResults.innerHTML = results.map(quote => `
        <div class="search-result-item" data-quote-text="${quote.text}">
            <p class="search-result-quote">${quote.text}</p>
            <p class="search-result-author">— ${quote.author}</p>
        </div>
    `).join('');

    elements.searchResults.style.display = 'block';

    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const quoteText = item.dataset.quoteText;
            const quote = appState.quotes.find(q => q.text === quoteText);
            if (quote) {
                displayQuote(quote);
                elements.searchResults.style.display = 'none';
                elements.searchInput.value = '';
            }
        });
    });
});

// Close search results when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!elements.searchInput.contains(e.target) && !elements.searchResults.contains(e.target)) {
        elements.searchResults.style.display = 'none';
    }
});

// ===========================
// VOICE / SPEECH SYNTHESIS
// ===========================

function initVoices() {
    const voices = window.speechSynthesis.getVoices();
    elements.voiceSelect.innerHTML = '<option value="">Default Voice</option>';
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        elements.voiceSelect.appendChild(option);
    });
}

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = initVoices;
    initVoices();
}

function setVoiceStatus(status, speaking = false) {
    const statusText = elements.voiceStatus.querySelector('.status-text');
    statusText.textContent = status;

    elements.voiceStatus.classList.remove('speaking', 'paused');
    if (speaking) {
        elements.voiceStatus.classList.add('speaking');
    }
}

elements.readBtn.addEventListener('click', () => {
    if (!appState.currentQuote) {
        showToast('No quote to read');
        return;
    }

    if (appState.speech.isSpeaking) {
        showToast('Already reading');
        return;
    }

    if (appState.speech.isPaused) {
        window.speechSynthesis.resume();
        appState.speech.isPaused = false;
        setVoiceStatus('Reading...', true);
        updateVoiceButtons();
        return;
    }

    const text = `${appState.currentQuote.text}. By ${appState.currentQuote.author}`;
    const utterance = new SpeechSynthesisUtterance(text);

    const voiceIndex = elements.voiceSelect.value;
    if (voiceIndex) {
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices[voiceIndex];
    }

    utterance.rate = appState.speech.rate;

    utterance.onstart = () => {
        appState.speech.isSpeaking = true;
        appState.stats.spoken++;
        updateStatistics();
        setVoiceStatus('Reading...', true);
        updateVoiceButtons();
    };

    utterance.onend = () => {
        appState.speech.isSpeaking = false;
        appState.speech.isPaused = false;
        setVoiceStatus('Ready to speak');
        updateVoiceButtons();
    };

    utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        showToast('Speech synthesis error');
        appState.speech.isSpeaking = false;
        setVoiceStatus('Ready to speak');
        updateVoiceButtons();
    };

    appState.speech.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
});

elements.pauseBtn.addEventListener('click', () => {
    if (appState.speech.isSpeaking && !appState.speech.isPaused) {
        window.speechSynthesis.pause();
        appState.speech.isPaused = true;
        setVoiceStatus('Paused');
        updateVoiceButtons();
    }
});

elements.resumeBtn.addEventListener('click', () => {
    if (appState.speech.isPaused) {
        window.speechSynthesis.resume();
        appState.speech.isPaused = false;
        setVoiceStatus('Reading...', true);
        updateVoiceButtons();
    }
});

elements.stopBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    appState.speech.isSpeaking = false;
    appState.speech.isPaused = false;
    setVoiceStatus('Ready to speak');
    updateVoiceButtons();
});

function updateVoiceButtons() {
    elements.readBtn.disabled = appState.speech.isSpeaking && !appState.speech.isPaused;
    elements.pauseBtn.disabled = !appState.speech.isSpeaking || appState.speech.isPaused;
    elements.resumeBtn.disabled = !appState.speech.isPaused;
    elements.stopBtn.disabled = !appState.speech.isSpeaking && !appState.speech.isPaused;

    if (appState.speech.isSpeaking) {
        elements.readBtn.classList.add('active');
    } else {
        elements.readBtn.classList.remove('active');
    }
}

elements.speechRate.addEventListener('input', (e) => {
    const rate = parseFloat(e.target.value);
    appState.speech.rate = rate;
    elements.rateValue.textContent = `${rate.toFixed(1)}x`;

    if (appState.speech.isSpeaking && !appState.speech.isPaused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
    }
});

// ===========================
// STATISTICS UPDATE
// ===========================

function updateStatistics() {
    elements.statGenerated.textContent = appState.stats.generated;
    elements.statSpoken.textContent = appState.stats.spoken;
    elements.statCopied.textContent = appState.stats.copied;
    elements.statFavorites.textContent = appState.stats.favorites;
}

// ===========================
// KEYBOARD SHORTCUTS
// ===========================

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'g') {
            e.preventDefault();
            handleGenerateQuote();
        } else if (e.key === 'c') {
            e.preventDefault();
            elements.copyBtn.click();
        } else if (e.key === 'f') {
            e.preventDefault();
            elements.searchInput.focus();
        }
    } else if (e.code === 'Space' && document.activeElement === document.body) {
        e.preventDefault();
        elements.readBtn.click();
    } else if (e.key === 'Escape') {
        closeFavoritesPanel();
        elements.dropdownMenu.classList.remove('active');
    }
});

// ===========================
// INITIALIZATION
// ===========================

async function init() {
    console.log('🚀 Initializing QuoteGen Dashboard...');
    initTheme();

    const user = await requireSession();
    if (!user) return; // requireSession already redirected to login.html

    await loadFavorites();
    handleGenerateQuote();
    updateVoiceButtons();
    showToast(`🎉 Welcome back to QuoteGen!`);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===========================
// RESPONSIVE MENU
// ===========================

elements.navLinks.forEach(link => {
    link.addEventListener('click', function(e) {

        const targetId = this.getAttribute('href');

        // Only intercept links that point to an on-page section (#home, #generate, #categories).
        // The Favorites link (href="#") is handled elsewhere to open the favorites panel.
        if (targetId && targetId.length > 1 && targetId.startsWith('#')) {

            const targetSection = document.querySelector(targetId);

            if (targetSection) {

                e.preventDefault();

                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

            }

        }

        elements.navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});