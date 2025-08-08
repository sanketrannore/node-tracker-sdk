import axios, { AxiosError } from 'axios';
import { EnrichedEvent } from './types/event';

export async function sendEvent(event: EnrichedEvent): Promise<void> {
  try {
    // Construct outgoing payload
    const { cid, eid, dtm, tz, e, ev, uid, client_id } = event;
    const payload = {
      cid,
      eid,
      uid,
      dtm,
      tz,
      p: "node",
      tna: "node-tracker-sdk",
      tv: "for-audienz",
      e,
      ev
    };
    
    // Wrap payload in events array
    const eventsPayload = {
      events: [payload]
    };
    
    const response = await axios.post('https://dev-uii.portqii.com/api/v1/events', eventsPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': client_id,
      }
    });
    if (response.status >= 200 && response.status < 300) {
      console.log(`Event sent successfully: ${event.eid}`);
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      console.error(`Failed to send event: ${message}`);
      throw new Error(`Failed to send event: ${message}`);
    }
    throw new Error(`Failed to send event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 