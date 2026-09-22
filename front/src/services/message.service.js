import { API_BASE_URL } from '../config/api.config.js';

export class NotFoundError extends Error {
  constructor(message = 'Message not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export async function fetchMessageById(id) {
  if (!id) {
    throw new NotFoundError('No message ID provided');
  }

  const endpoint = `${API_BASE_URL.replace(/\/$/, '')}/messages/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (response.status === 404 || response.status === 400) {
      throw new NotFoundError(`Message with ID ${id} was not found or is expired.`);
    }

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    console.error('[MessageService] Failed to fetch message:', err);
    throw err;
  }
}
