import { InitConfig } from './types/event';
import { initConfigSchema } from './validators/eventSchema';

let isInitialized = false;
let config: InitConfig;

export function init(initConfig: InitConfig): void {
  try {
    // Validate the configuration
    config = initConfigSchema.parse(initConfig);
    // Set default API endpoint if not provided
    if (!config.apiEndpoint) {
      config.apiEndpoint = 'https://dev-uii.portqii.com/api/v1/events';
    }
    isInitialized = true;
    console.log('Node Tracker SDK initialized successfully');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`SDK initialization failed: ${error.message}`);
    }
    throw new Error('SDK initialization failed: Unknown error');
  }
}

export function getConfig(): InitConfig {
  if (!isInitialized) {
    throw new Error('SDK not initialized. Call init() first.');
  }
  return config;
}

export function isSDKInitialized(): boolean {
  return isInitialized;
} 