export interface InitConfig {
  appId: string;
  apiEndpoint?: string;
}

export interface EventData {
  eventTime?: number;
  [key: string]: any;
}

export interface EnrichedEvent {
  id: string; // eventId
  appId: string;
  category: string;
  eventTime: number;
  timezone: string;
  data: EventData;
  userId: string;
}

export interface QueuedEvent {
  event: EnrichedEvent;
  attempts: number;
  timestamp: number;
} 