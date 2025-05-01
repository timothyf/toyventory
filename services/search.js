export async function searchByBarcode(barcode) {
    const query = `${barcode} action figure`;
  
    const response = await fetch(`https://real-time-web-search.p.rapidapi.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'X-RapidAPI-Key': '28d08b4471msh2be6ed32317187bp1f1c3ajsne0241d5f5dc0',
        'X-RapidAPI-Host': 'real-time-web-search.p.rapidapi.com'
      }
    });
  
    const json = await response.json();
    return json.results.slice(0, 3); // top 3 results
  }
  