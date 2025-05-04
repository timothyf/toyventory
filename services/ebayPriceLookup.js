// ebayPriceLookup.js
export async function searchEbayItems(query, accessToken) {
    const url = `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(query)}&limit=5`;
  
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  
    const data = await response.json();
    return data.itemSummaries || [];
  }
  