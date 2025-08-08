# Node Tracker SDK

A Node.js SDK for tracking custom events with automatic retry, validation, and queueing capabilities.

## Features

- ✅ **Type-safe**: Full TypeScript support with strict validation
- ✅ **Automatic retry**: Failed events are queued and retried automatically
- ✅ **Event enrichment**: Automatically adds UUID, timestamp, and timezone
- ✅ **Validation**: Comprehensive data validation using Zod
- ✅ **Clean API**: Simple initialization and event tracking
- ✅ **Error handling**: Robust error handling with detailed messages
- ✅ **Queue management**: Built-in queue system for failed events

## Installation

```bash
npm install @sanketrannore/node-tracker-sdk
```

## Quick Start

```javascript
import { init, cruxTrack } from '@sanketrannore/node-tracker-sdk';

// Initialize the SDK (required before tracking events)
init({
  clientId: 'your-client-id',
  customerId: 'your-customer-id',
  customerName: 'your-customer-name'
});

// Track an event
await cruxTrack('user_signup', {
  uid: 'user123', // mandatory
  email: 'user@example.com',
  dtm: Date.now() // optional, defaults to current time
});
```

## API Reference

### `init(config: InitConfig)`

Initialize the SDK with your configuration. **Must be called before tracking any events.**

```typescript
interface InitConfig {
  clientId: string;        // Your client ID (required)
  customerId: string;      // Your customer ID (required)
  customerName: string;    // Your customer name (required)
}
```

**Example:**
```javascript
init({
  clientId: 'client-123',
  customerId: 'customer-456',
  customerName: 'My Company'
});
```

### `cruxTrack(categoryName: string, eventData?: EventData)`

Track a custom event with optional data.

```typescript
interface EventData {
  dtm?: number;           // Epoch milliseconds (optional, defaults to Date.now())
  uid?: string;           // User ID (optional, defaults to "undefined")
  [key: string]: any;     // Additional event properties
}
```

**Parameters:**
- `categoryName`: String identifying the event category (required)
- `eventData`: Object containing event data (optional)

**Example:**
```javascript
await cruxTrack('purchase', {
  uid: 'user123',
  productId: 'prod-123',
  amount: 99.99,
  currency: 'USD',
  dtm: Date.now()
});
```

### Event Enrichment & Outgoing Payload

Every event is automatically enriched and sent as a POST request to `https://dev-uii.portqii.com/api/v1/events` with the following structure:

**Final outgoing payload:**
```json
{
  "events": [
    {
      "cid": "customer-456",
      "eid": "550e8400-e29b-41d4-a716-446655440000",
      "uid": "user123",
      "dtm": 1703097600000,
      "tz": "Asia/Calcutta",
      "p": "node",
      "tna": "node-tracker-sdk",
      "tv": "for-audienz",
      "e": "user_signup",
      "ev": {
        "uid": "user123",
        "email": "user@example.com",
        "dtm": 1703097600000
      }
    }
  ]
}
```

**Payload fields:**
- `cid`: Customer ID (from initialization)
- `eid`: Random UUID (eventId)
- `uid`: User ID (from eventData.uid, defaults to "undefined")
- `dtm`: Epoch milliseconds (provided or current time)
- `tz`: User's timezone (e.g., 'America/New_York')
- `p`: Platform, always "node"
- `tna`: Tracker name, always "node-tracker-sdk"
- `tv`: Tracker version, always "for-audienz"
- `e`: The event category
- `ev`: The full eventData object

> **Note:** Events are sent wrapped in an `events` array for batch processing compatibility.

## Error Handling & Retry

The SDK includes automatic retry logic:

- **Immediate send**: Events are sent immediately when tracked
- **Queue on failure**: If sending fails, events are queued for retry
- **Automatic retry**: Queued events are retried every 10 seconds
- **Max retries**: Events are retried up to 3 times before being dropped
- **Logging**: All retry attempts and failures are logged

### Queue Management

```javascript
import { getQueueSize, clearQueue, isSDKInitialized } from '@sanketrannore/node-tracker-sdk';

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
import { InitConfig, EventData, EnrichedEvent } from '@sanketrannore/node-tracker-sdk';

const config: InitConfig = {
  clientId: 'client-123',
  customerId: 'customer-456',
  customerName: 'My Company'
};

const eventData: EventData = {
  uid: 'user123',
  dtm: Date.now()
};
```

## Examples

### Basic Usage
```javascript
import { init, cruxTrack } from '@sanketrannore/node-tracker-sdk';

// Initialize
init({
  clientId: 'client-123',
  customerId: 'customer-456',
  customerName: 'My Company'
});

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
  dtm: customTime
});
```

### With User ID
```javascript
await cruxTrack('user_action', { 
  uid: 'user123',
  action: 'login',
  source: 'web'
});
```

### Error Handling
```javascript
try {
  await cruxTrack('user_action', { uid: 'user123' });
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

### Running Example
```bash
npm run example
```

## Dependencies

- **axios**: HTTP client for API requests
- **uuid**: UUID generation for event IDs
- **zod**: Schema validation
- **tslib**: TypeScript runtime helpers

## License

Apache-2.0

## Support

For issues and questions, please visit our [GitHub repository](https://github.com/sanketrannore/node-tracker-sdk). 