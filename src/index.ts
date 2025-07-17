// Main SDK exports
export { init } from './init';
export { cruxTrack } from './cruxTrack';

// Type exports for users
export type { InitConfig, EventData, EnrichedEvent } from './types/event';

// Utility exports (optional, for advanced users)
export { getQueueSize, clearQueue } from './queue';
export { isSDKInitialized } from './init';
