import { v4 as uuidv4 } from 'uuid';
import { EventData, EnrichedEvent } from './types/event';
import { eventDataSchema, enrichedEventSchema } from './validators/eventSchema';
import { getConfig, isSDKInitialized } from './init';
import { sendEvent } from './api';
import { addToQueue } from './queue';

export async function cruxTrack(categoryName: string, eventData: EventData = {}): Promise<void> {
  // Check if SDK is initialized
  if (!isSDKInitialized()) {
    throw new Error('SDK not initialized. Call init() first.');
  }
  // Validate category name
  if (!categoryName || typeof categoryName !== 'string' || categoryName.trim().length === 0) {
    throw new Error('Category name is required and must be a non-empty string');
  }
  try {
    // Validate event data
    const validatedEventData = eventDataSchema.parse(eventData);
    // Get config
    const config = getConfig();
    // Enrich the event with required fields (env is always 'server' internally, not sent)
    const enrichedEvent: EnrichedEvent = {
      id: uuidv4(),
      appId: config.appId,
      category: categoryName.trim(),
      eventTime: validatedEventData.eventTime || Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      data: validatedEventData,
      userId: validatedEventData.userId
    };
    // Validate the enriched event
    const validatedEvent = enrichedEventSchema.parse(enrichedEvent);
    // Try to send the event
    try {
      await sendEvent(validatedEvent);
    } catch (error) {
      // If sending fails, add to queue for retry
      console.warn(`Failed to send event immediately, adding to queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
      addToQueue(validatedEvent);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Event tracking failed: ${error.message}`);
    }
    throw new Error('Event tracking failed: Unknown error');
  }
} 