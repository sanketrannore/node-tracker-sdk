// Main SDK exports
export { init } from './init';
export { cruxTrack } from './cruxTrack';
export { getUserTraits } from './getUserTraits';

export { isSDKInitialized } from './init';

// Type exports
export type {
  InitConfig,
  GetUserTraitsRequest,
} from './types/event';

// Export ExtendedEventData interface for enhanced tracking
export interface ExtendedEventData {
  // Basic fields
  eventTime?: number;
  userId?: string;
  
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
  
  // Custom fields
  [key: string]: any;
}

