# Node Tracker SDK

A Node.js SDK for tracking custom events with automatic retry, validation, and queueing capabilities.

## Features

- ✅ **Type-safe**: Full TypeScript support with strict validation
- ✅ **Automatic retry**: Failed events are queued and retried automatically
- ✅ **Event enrichment**: Automatically adds UUID, timestamp, and timezone
- ✅ **Validation**: Comprehensive data validation using Zod
- ✅ **Clean API**: Simple initialization and event tracking
- ✅ **Error handling**: Robust error handling with detailed messages

## Installation

```bash
npm install @sanketrannore/node-tracker-sdk
```

## Quick Start

```javascript
import { init, cruxTrack } from '@sanketrannore/node-tracker-sdk';

// Initialize the SDK (required before tracking events)
init({
  appId: 'your-app-id-123',
  apiEndpoint: 'https://your-api.com/events' // optional
});

// Track an event
await cruxTrack('user_signup', {
  userId: 'user123', //mandatory
  email: 'user@example.com',
  eventTime: Date.now() // optional, defaults to current time
});
```

## API Reference

### `init(config: InitConfig)`

Initialize the SDK with your configuration. **Must be called before tracking any events.**

```typescript
interface InitConfig {
  appId: string;           // Your application ID (required)
  apiEndpoint?: string;   // API endpoint URL (optional)
}
```

**Example:**
```javascript
init({
  appId: 'my-app-123',
  apiEndpoint: 'https://api.myservice.com/events'
});
```

### `cruxTrack(categoryName: string, eventData?: EventData)`

Track a custom event with optional data.

```typescript
interface EventData {
  [key: string]: any;
  eventTime?: number;     // Epoch milliseconds (optional, defaults to Date.now())
  userId?: string;        // Used as uid in the outgoing payload
}
```

**Parameters:**
- `categoryName`: String identifying the event category (required)
- `eventData`: Object containing event data (optional)

**Example:**
```javascript
await cruxTrack('purchase', {
  userId: 'user123',
  productId: 'prod-123',
  amount: 99.99,
  currency: 'USD',
  eventTime: Date.now()
});
```

### Event Enrichment & Outgoing Payload

Every event is automatically enriched and sent as a POST request with the following fields:
- `aid`: Your appId (from initialization)
- `eid`: Random UUID (eventId)
- `uid`: userId (from eventData, if present)
- `dtm`: Epoch milliseconds (provided or current time)
- `tz`: User's timezone (e.g., 'America/New_York')
- `p`: Platform, always "node"
- `e`: The event category
- `tv`: Tracker version, always "for-audienz"
- `ev`: The full eventData object (not flattened)

**Final outgoing payload:**
```json
{
  "aid": "my-app-123",
  "eid": "550e8400-e29b-41d4-a716-446655440000",
  "uid": "user123",
  "dtm": 1703097600000,
  "tz": "Asia/Calcutta",
  "p": "node",
  "e": "user_signup",
  "tv": "for-audienz",
  "ev": {
    "userId": "user123",
    "email": "user@example.com"
  }
}
```

> **Note:** The `ev` field contains the entire eventData object you provide to `cruxTrack`.

## Error Handling & Retry

The SDK includes automatic retry logic:

- **Immediate send**: Events are sent immediately when tracked
- **Queue on failure**: If sending fails, events are queued for retry
- **Automatic retry**: Queued events are retried every 10 seconds
- **Max retries**: Events are retried up to 3 times before being dropped
- **Logging**: All retry attempts and failures are logged

### Utility Functions

```javascript
import { getQueueSize, clearQueue, isSDKInitialized } from 'node-tracker-sdk';

// Check if SDK is initialized
if (isSDKInitialized()) {
  console.log('SDK is ready');
}

// Get current queue size
console.log(`${getQueueSize()} events in queue`);

// Clear the queue (useful for testing)
clearQueue();
```

## Error Messages

The SDK provides clear error messages:

- `"SDK not initialized. Call init() first."` - You must call `init()` before tracking
- `"Category name is required and must be a non-empty string"` - Invalid category name
- `"SDK initialization failed: [reason]"` - Configuration validation failed
- `"Event tracking failed: [reason]"` - Event data validation failed
- `"Failed to send event: [reason]"` - Network or API error

## TypeScript Support

The SDK is written in TypeScript and exports all necessary types:

```typescript
import { InitConfig, EventData, EnrichedEvent } from 'node-tracker-sdk';

const config: InitConfig = {
  appId: 'my-app',
};

const eventData: EventData = {
  userId: 'user123',
  eventTime: Date.now()
};
```

## Examples

### Basic Usage
```javascript
import { init, cruxTrack } from 'node-tracker-sdk';

// Initialize
init({ appId: 'my-app' });

// Track events
await cruxTrack('page_view', { page: '/home' });
await cruxTrack('button_click', { button: 'signup' });
await cruxTrack('api_call', { endpoint: '/users', method: 'POST' });
```

### With Custom Event Time
```javascript
const customTime = new Date('2023-12-01').getTime();
await cruxTrack('historical_event', {
  action: 'data_migration',
  eventTime: customTime
});
```

### Error Handling
```javascript
try {
  await cruxTrack('user_action', { userId: 'user123' });
} catch (error) {
  console.error('Failed to track event:', error.message);
}
```

## Development

### Building
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

### Testing
```bash
npm test
```

## License

Apache-2.0

## Support

For issues and questions, please visit our [GitHub repository](https://github.com/sanketrannore/node-tracker-sdk). 