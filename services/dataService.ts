import { SensorData } from '../types';

// The specific Google Apps Script Web App URL provided
const API_URL = "https://script.google.com/macros/s/AKfycby61hthQVULKFW_1--hI0V2t-gjxOVSnUzZ6iHK-Q-RT2cpUbvgvmM7BfFt5rSOuR0MFw/exec";

export const fetchSensorData = async (): Promise<SensorData[]> => {
  try {
    // Fetch data from the Google Apps Script
    // We add a cache-busting parameter to ensure we always get the latest reading
    const response = await fetch(`${API_URL}?nocache=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    
    // Handle various potential JSON structures returned by Google Apps Script
    let rawData: any[] = [];
    
    if (Array.isArray(json)) {
      // Case 1: Script returns an array of objects (The new Standard)
      rawData = json;
    } else if (json && typeof json === 'object' && Array.isArray(json.data)) {
      // Case 2: Script returns { data: [...] }
      rawData = json.data;
    } else if (json && typeof json === 'object' && !json.message && !json.status) {
      // Case 3: Script returns a single object (Legacy single-row fetch)
      rawData = [json];
    } else {
      // Case 4: Script returns error or message
      console.warn("API returned message or unexpected format:", json);
      return []; 
    }

    // Map the raw data to our TypeScript interface
    const parsedData: SensorData[] = [];

    for (const item of rawData) {
      // Strictly ignore data without a timestamp
      if (!item.timestamp) continue;

      let displayTimestamp = "";
      let timeForSort = 0;

      try {
        // Handle Google Sheets date strings (ISO or otherwise)
        const date = new Date(item.timestamp);
        
        // Check if date is valid
        if (!isNaN(date.getTime())) {
            timeForSort = date.getTime();
            
            // Format to DD/MM/YYYY HH:MM:SS in Local Time for display
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const seconds = date.getSeconds().toString().padStart(2, '0');
            
            displayTimestamp = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        } else {
            // Skip invalid date strings
            continue;
        }
      } catch (e) {
        console.warn("Date parsing error", e);
        continue;
      }

      parsedData.push({
        timestamp: displayTimestamp, 
        timestampEpoch: timeForSort, // Persist numeric timestamp for precise sorting
        network: item.network || 'Unknown',
        sim: item.sim || '',
        simOperator: item.simOperator || '',
        wifiStrength: Number(item.wifiStrength) || 0,
        gsmStrength: Number(item.gsmStrength) || 0,
        waterLevel: Number(item.waterLevel) || 0,
        status: item.status || 'Unknown',
        sdSize: Number(item.sdSize) || 0,
        sdRemaining: Number(item.sdRemaining) || 0,
        device: item.device || 'Device',
        dataType: item.dataType || 'Reading',
        smsStatus: item.smsStatus || 'None'
      });
    }

    // Sort data chronologically (Oldest -> Newest)
    // This ensures the 'latest' data is always at the end of the array
    // and charts draw correctly from left to right.
    const sortedData = parsedData.sort((a, b) => a.timestampEpoch - b.timestampEpoch);

    return sortedData;

  } catch (error) {
    console.error("Error fetching sensor data:", error);
    throw error;
  }
};