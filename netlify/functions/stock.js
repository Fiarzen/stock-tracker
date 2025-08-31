const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    // Get stock symbol from query parameters
    const { symbol } = event.queryStringParameters || {};
    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

    if (!symbol) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Stock symbol is required' })
        };
    }

    if (!API_KEY) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'API key not configured on server' })
        };
    }

    try {
        console.log(`Fetching data for symbol: ${symbol}`);
        
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Alpha Vantage API responded with ${response.status}`);
        }

        const data = await response.json();

        // Check for API errors
        if (data['Error Message']) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Invalid stock symbol' })
            };
        }
        
        if (data['Note']) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({ 
                    error: 'API rate limit exceeded. Please try again later.' 
                })
            };
        }

        const quote = data['Global Quote'];
        if (!quote || Object.keys(quote).length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'No data found for this symbol' })
            };
        }

        // Format the response
        const price = parseFloat(quote['05. price']);
        const change = parseFloat(quote['09. change']);
        const changePercent = quote['10. change percent'].replace('%', '');

        const formattedData = {
            symbol: quote['01. symbol'],
            name: `${quote['01. symbol']} Corporation`,
            price: price.toFixed(2),
            change: change.toFixed(2),
            changePercent: (parseFloat(changePercent) >= 0 ? '+' : '') + parseFloat(changePercent).toFixed(2) + '%',
            volume: parseInt(quote['06. volume']).toLocaleString(),
            high: parseFloat(quote['03. high']).toFixed(2),
            low: parseFloat(quote['04. low']).toFixed(2),
            open: parseFloat(quote['02. open']).toFixed(2),
            lastUpdated: quote['07. latest trading day']
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(formattedData)
        };

    } catch (error) {
        console.error('Error fetching stock data:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to fetch stock data',
                details: error.message 
            })
        };
    }
};