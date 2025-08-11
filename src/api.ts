import axios, { AxiosError } from 'axios';
import { EnrichedEvent, GetUserTraitsRequest, GetUserTraitsResponse } from './types/event';

export async function sendEvent(event: EnrichedEvent): Promise<void> {
  try {
    // Construct outgoing payload with all available fields
    const payload = {
      cid: event.cid,
      cna: event.cna,
      uid: event.uid,
      eid: event.eid,
      dtm: event.dtm,
      e: event.e,
      ev: event.ev,
      tna: event.tna, // Always "node"
      tv: event.tv,   // Always "v1"
      
      // Optional fields - only include if they exist
      ...(event.sid && { sid: event.sid }),
      ...(event.ua && { ua: event.ua }),
      ...(event.sh && { sh: event.sh }),
      ...(event.sw && { sw: event.sw }),
      ...(event.l && { l: event.l }),
      ...(event.p && { p: event.p }),
      ...(event.an !== undefined && { an: event.an }),
      ...(event.vh && { vh: event.vh }),
      ...(event.vw && { vw: event.vw }),
      ...(event.pt && { pt: event.pt }),
      ...(event.pu && { pu: event.pu }),
      ...(event.pp && { pp: event.pp }),
      ...(event.pd && { pd: event.pd }),
      ...(event.pl && { pl: event.pl }),
      ...(event.pr && { pr: event.pr }),
      ...(event.ip && { ip: event.ip }),
      ...(event.tz && { tz: event.tz })
    };
    
    // Wrap payload in events array
    const eventsPayload = {
      events: [payload]
    };
    
    const response = await axios.post('https://dev-uii.portqii.com/api/v1/events', eventsPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': event.client_id,
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

export async function getUserTraitsFromAPI(
  clientId: string, 
  customerId: string, 
  request: GetUserTraitsRequest
): Promise<GetUserTraitsResponse> {
  try {
    const response = await axios.post(
      `https://dev-uii.portqii.com/api/v1/users/traits?customerId=${encodeURIComponent(customerId)}`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
        }
      }
    );
    
    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        data: response.data,
        message: 'User traits retrieved successfully'
      };
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      console.error(`Failed to get user traits: ${message}`);
      return {
        success: false,
        error: `Failed to get user traits: ${message}`
      };
    }
    return {
      success: false,
      error: `Failed to get user traits: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 