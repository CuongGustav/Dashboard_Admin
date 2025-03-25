const API_URL = process.env.NEXT_PUBLIC_URL_API

export interface ServerHistory {
  cpu_history: number[];
  ram_history: number[];
  disk_history: number[];
  last_reported: string;
}

export async function fetchServerHistory(serverName: string): Promise<ServerHistory> {
  try {
    console.log(`Fetching history for server: ${serverName}`);
    const response = await fetch(`${API_URL}/chart/${serverName}/history`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data: ServerHistory = await response.json();
    if (
      !Array.isArray(data.cpu_history) || 
      !Array.isArray(data.ram_history) || 
      !Array.isArray(data.disk_history
    )) {
      console.warn('Received empty or invalid server history data');
      throw new Error('Invalid data format received');
    }
    console.log('Fetched server history:', data);
    return data;
  } catch (error) {
    console.error(`Failed to fetch history for server ${serverName}:`, error);
    throw error;
  }
}


