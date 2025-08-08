export interface InitConfig {
  clientId: string;
  customerId: string;
  customerName: string;
}

export interface EventData {
  dtm?: number;
  [key: string]: any;
}

export interface EnrichedEvent {
  eid: string; // eventId
  cid: string; // customerId
  cn: string; // customerName
  e: string; // event
  dtm: number; // eventTime
  tz: string; // timezone
  ev: EventData;
  uid: string; // userId
  client_id: string; // clientId
}

export interface QueuedEvent {
  event: EnrichedEvent;
  attempts: number;
  timestamp: number;
} 