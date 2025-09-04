class StockTracker {
    constructor() {
        this.apiKey =  '';
        this.initializeEventListeners();
        
    }

    /**
     * Initialize all event listeners for the application
     */
    initializeEventListeners() {
        const form = document.getElementById('stockForm');
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // Allow Enter key in symbol input
        document.getElementById('stockSymbol').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSearch();
            }
        });
    }

    /**
     * Handle stock search submission
     */
    async handleSearch() {
        const symbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
        
        if (!symbol) {
            this.showError('Please enter a stock symbol');
            return;
        }

        console.log('Searching for symbol:', symbol);
        this.showLoading();
        this.hideError();

        try {
            const stockData = await this.fetchStockData(symbol);
            console.log('Stock data received:', stockData);
            this.displayStockData(stockData);
        } catch (error) {
            console.error('Search error:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Fetch stock data from serverless backend or fallback to demo
     * @param {string} symbol - Stock symbol to fetch
     * @returns {Object} Formatted stock data
     */
    async fetchStockData(symbol) {
        // Try serverless backend first (API key is secure on server)
        try {
            const backendUrl = `/api/stock?symbol=${symbol}`;
            const response = await fetch(backendUrl);
            
            if (response.ok) {
                const data = await response.json();
                return this.formatBackendData(data);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Backend error');
            }
        } catch (error) {
            console.log('Backend not available:', error.message);
            throw error;
        }
    }


    
    /**
     * Format backend API response data
     * @param {Object} data - Backend response data
     * @returns {Object} Formatted stock data
     */
    formatBackendData(data) {
        const change = parseFloat(data.change);
        return {
            symbol: data.symbol,
            name: data.name || data.symbol,
            price: data.price,
            change: (change >= 0 ? '+' : '') + data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            high: data.high,
            low: data.low,
            open: data.open
        };
    }

    /**
     * Display stock data in the UI
     * @param {Object} data - Formatted stock data
     */
    displayStockData(data) {
        const isPositive = parseFloat(data.change) >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const changeIcon = isPositive ? '📈' : '📉';
        console.log('Displaying stock data:', data);
        if (!data) {
        console.error('No data to display!');
        return;
    }
        const stockHTML = `
            <div class="stock-card">
                <div class="stock-header">
                    <div>
                        <div class="stock-symbol">${data.symbol}</div>
                        <div class="stock-name">${data.name}</div>
                    </div>
                    <div class="stock-price ${changeClass}">$${data.price}</div>
                </div>
                
                <div class="stock-details">
                    <div class="detail-item">
                        <div class="detail-label">Change</div>
                        <div class="detail-value ${changeClass}">
                            ${changeIcon} ${data.change}
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Change %</div>
                        <div class="detail-value ${changeClass}">${data.changePercent}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Volume</div>
                        <div class="detail-value">${data.volume}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Day High</div>
                        <div class="detail-value">$${data.high}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Day Low</div>
                        <div class="detail-value">$${data.low}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Open</div>
                        <div class="detail-value">$${data.open}</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('stockContainer').innerHTML = stockHTML;
    }

    /**
     * Show loading spinner and disable search button
     */
    showLoading() {
        document.getElementById('loadingContainer').style.display = 'block';
        document.getElementById('stockContainer').innerHTML = '';
        document.getElementById('searchBtn').disabled = true;
    }

    /**
     * Hide loading spinner and enable search button
     */
    hideLoading() {
        document.getElementById('loadingContainer').style.display = 'none';
        document.getElementById('searchBtn').disabled = false;
    }

    /**
     * Display error message to user
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorHTML = `<div class="error">❌ ${message}</div>`;
        document.getElementById('errorContainer').innerHTML = errorHTML;
        document.getElementById('errorContainer').style.display = 'block';
    }

    /**
     * Hide error message
     */
    hideError() {
        document.getElementById('errorContainer').style.display = 'none';
    }

    /**
     * Add stock symbol to recent searches
     * @param {string} symbol - Stock symbol to add
     */


}
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance for onclick handlers to access
    window.stockTracker = new StockTracker();
    
    console.log('Stock Tracker initialized successfully!');
});