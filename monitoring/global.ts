import fetch from 'node-fetch';

class Global {
  constructor() { }

  static async fetchContent(url: string, init?: any): Promise<string> {
    const response = await fetch(url, init);
    if (!response.ok) {
      throw new Error('Response is not OK');
    }
    return await response.text();
  }
}

export { Global };
