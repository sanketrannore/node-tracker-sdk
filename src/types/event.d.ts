export interface InitConfig {
  clientId: string;
  customerId: string;
  customerName: string;
}

export interface EventData {
  eventTime?: number;
  userId?: string;
  [key: string]: any;
}

export interface EnrichedEvent {
  eid: string; // eventId
  cid: string; // customerId
  cna: string; // customerName (renamed from cn)
  e: string; // event (categoryName)
  dtm: number; // eventTime
  tz: string; // timezone
  ev: EventData; // eventData
  uid: string; // userId
  client_id: string; // clientId
  
  // Static values
  tna: string; // tracker name (always "node")
  tv: string; // tracker version (always "v1")
  
  // Optional fields that can be provided by user
  sid?: string; // sessionId
  ua?: string; // userAgent
  sh?: number; // screenHeight
  sw?: number; // screenWidth
  l?: string; // language
  p?: string; // platform
  an?: boolean; // adBlock
  vh?: number; // viewportHeight
  vw?: number; // viewportWidth
  pt?: string; // pageTitle
  pu?: string; // pageUrl
  pp?: string; // pagePath
  pd?: string; // pageDomain
  pl?: number; // pageLoadTime
  pr?: string; // referrer
  ip?: string; // ipAddress
}

export interface QueuedEvent {
  event: EnrichedEvent;
  attempts: number;
  timestamp: number;
}

// New interfaces for getUserTraits functionality
export interface GetUserTraitsRequest {
  userIds: string[];
}

export interface GetUserTraitsResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
} 