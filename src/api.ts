import axios, { AxiosError } from "axios";
import { EnrichedEvent } from "./types/event";
import { getConfig } from "./init";
// new push
export async function sendEvent(event: EnrichedEvent): Promise<void> {
  const config = getConfig();
  try {
    // Construct outgoing payload
    const { appId, id, eventTime, timezone, category, data, userId } = event;
    const payload = {
      aid: appId,
      eid: id,
      uid: userId,
      dtm: eventTime,
      tz: timezone,
      p: "node",
      e: category,
      tv: "for-audienz",
      ev: data,
    };
    const response = await axios.post(config.apiEndpoint!, payload);
    if (response.status >= 200 && response.status < 300) {
      console.log(`Event sent successfully: ${event.id}`);
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      console.error(`🚀 --- sendEvent --- error.response?.data:`, error.response?.data);
      throw new Error(`Failed to send event: ${message}`);
    }
    throw new Error(`Failed to send event: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
