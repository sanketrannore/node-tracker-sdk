import { v4 as uuidv4 } from 'uuid';
import { EventData, EnrichedEvent } from './types/event';
import { eventDataSchema, enrichedEventSchema } from './validators/eventSchema';
import { getConfig, isSDKInitialized } from './init';
import { sendEvent } from './api';
import { addToQueue } from './queue';

// Extended EventData interface to include optional tracking fields
interface ExtendedEventData extends EventData {
  // Session related
  sessionId?: string;
  
  // Browser/Device related
  userAgent?: string;
  screenHeight?: number;
  screenWidth?: number;
  language?: string;
  platform?: string;
  adBlock?: boolean;
  viewportHeight?: number;
  viewportWidth?: number;
  
  // Page related
  pageTitle?: string;
  pageUrl?: string;
  pagePath?: string;
  pageDomain?: string;
  pageLoadTime?: number;
  referrer?: string;
  
  // Network related
  ipAddress?: string;
}

export async function cruxTrack(
  categoryName: string, 
  eventData: ExtendedEventData = {}
): Promise<void> {
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
    
    // Map user-friendly fields to internal format
    const mappedEventData = {
      ...validatedEventData,
      uid: validatedEventData.userId || "undefined",
      dtm: validatedEventData.eventTime || Date.now()
    };
    
    // Enrich the event with required fields
    const enrichedEvent: EnrichedEvent = {
      eid: uuidv4(),
      cid: config.customerId,
      cna: config.customerName, // Updated from cn to cna
      client_id: config.clientId,
      e: categoryName.trim(),
      dtm: mappedEventData.dtm,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ev: validatedEventData, // Keep original eventData in ev field
      uid: mappedEventData.uid,
      
      // Static values
      tna: "node", // Always "node"
      tv: "v1",    // Always "v1"
      
      // Optional fields from user input
      ...(eventData.sessionId && { sid: eventData.sessionId }),
      ...(eventData.userAgent && { ua: eventData.userAgent }),
      ...(eventData.screenHeight && { sh: eventData.screenHeight }),
      ...(eventData.screenWidth && { sw: eventData.screenWidth }),
      ...(eventData.language && { l: eventData.language }),
      ...(eventData.platform && { p: eventData.platform }),
      ...(eventData.adBlock !== undefined && { an: eventData.adBlock }),
      ...(eventData.viewportHeight && { vh: eventData.viewportHeight }),
      ...(eventData.viewportWidth && { vw: eventData.viewportWidth }),
      ...(eventData.pageTitle && { pt: eventData.pageTitle }),
      ...(eventData.pageUrl && { pu: eventData.pageUrl }),
      ...(eventData.pagePath && { pp: eventData.pagePath }),
      ...(eventData.pageDomain && { pd: eventData.pageDomain }),
      ...(eventData.pageLoadTime && { pl: eventData.pageLoadTime }),
      ...(eventData.referrer && { pr: eventData.referrer }),
      ...(eventData.ipAddress && { ip: eventData.ipAddress })
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