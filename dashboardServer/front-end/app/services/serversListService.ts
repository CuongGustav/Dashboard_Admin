const API_URL = process.env.NEXT_PUBLIC_URL_API

interface Server {
  name: string;
}

export async function getServerList(): Promise<Server[]> {
  try {
    console.log('Fetching server list...');
    const response = await fetch(`${API_URL}/servers`);

    if (!response.ok) {
      console.error(`Server responded with error: ${response.statusText}`);
      return [];
    }

    const serverNames: string[] = await response.json();
    console.log('Fetched server list:', serverNames);

    if (!Array.isArray(serverNames)) {
      console.error('Invalid response format: Expected an array of strings');
      return [];
    }

    return serverNames.map(name => ({ name }));
  } catch (error) {
    console.error('Failed to fetch server list:', error);
    return [];
  }
}
