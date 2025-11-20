export interface SensorData {
  timestamp: string;
  timestampEpoch: number; // Numeric timestamp for sorting and filtering
  network: string;
  sim: string;
  simOperator: string;
  wifiStrength: number;
  gsmStrength: number;
  waterLevel: number;
  status: 'Low' | 'Good' | 'Excess' | 'Flood Alert' | 'Unknown';
  sdSize: number;
  sdRemaining: number;
  device: string;
  dataType: 'Reading' | 'Live' | 'Backup';
  smsStatus: string;
}

export interface HistoricalDataPoint {
  timestamp: number; // Parsed time for charts
  originalTimestamp: string;
  waterLevel: number;
  status: string;
}

export enum Tab {
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  SETTINGS = 'settings'
}