export async function searchByBarcode(barcode) {
  
  const API_KEY = '28d08b4471msh2be6ed32317187bp1f1c3ajsne0241d5f5dc0';


  const query = `${barcode} action figure`;
  const url = `https://real-time-web-search.p.rapidapi.com/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'real-time-web-search.p.rapidapi.com'
      }
    });

    const jsonData = await response.json();
    console.log('🔍 API response:', JSON.stringify(jsonData, null, 2));
    //const jsonData = JSON.parse(data);

    if (!jsonData || !Array.isArray(jsonData.data)) {
      console.warn('⚠️ Unexpected API format:', jsonData);
      return [];
    }

    return jsonData.data.slice(0, 5);
  } catch (err) {
    console.error('API fetch error:', err);
    return [];
  }
}
  