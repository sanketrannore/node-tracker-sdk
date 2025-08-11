# Node Tracker SDK

A Node.js SDK for tracking custom events with automatic retry, validation, and queueing capabilities. Now with enhanced tracking fields for comprehensive event data collection.

## Features

- ✅ **Type-safe**: Full TypeScript support with strict validation
- ✅ **Automatic retry**: Failed events are queued and retried automatically
- ✅ **Event enrichment**: Automatically adds UUID, timestamp, and timezone
- ✅ **Validation**: Comprehensive data validation using Zod
- ✅ **Clean API**: Simple initialization and event tracking
- ✅ **Error handling**: Robust error handling with detailed messages
- ✅ **Queue management**: Built-in queue system for failed events
- ✅ **User-friendly**: Accepts intuitive field names like `userId` and `eventTime`
- ✅ **User traits retrieval**: Get user traits by userId(s)
- ✅ **Enhanced tracking**: Support for session, browser, device, page, and network data
- ✅ **Flexible payload**: Automatically maps user-friendly field names to API format

## Installation

```bash
npm install @sanketrannore/node-tracker-sdk
```

## Quick Start

```javascript
import { init, cruxTrack, getUserTraits } from '@sanketrannore/node-tracker-sdk';

// Initialize the SDK (required before tracking events)
init({
  clientId: 'your-client-id',
  customerId: 'your-customer-id',
  customerName: 'your-customer-name'
});

// Track an event
await cruxTrack('user_signup', {
  userId: 'user123', // mandatory
  email: 'user@example.com',
  eventTime: Date.now() // optional, defaults to current time
});

// Get user traits
const traits = await getUserTraits('user123');
// Or get traits for multiple users
const multipleTraits = await getUserTraits(['user123', 'user456']);
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

### `cruxTrack(categoryName: string, eventData?: ExtendedEventData)`

Track a custom event with optional data and enhanced tracking fields.

```typescript
interface ExtendedEventData extends EventData {
  // Basic fields
  eventTime?: number;      // Epoch milliseconds (optional, defaults to Date.now())
  userId?: string;         // User ID (optional, defaults to "undefined")
  
  // Session related
  sessionId?: string;      // Session identifier
  
  // Browser/Device related
  userAgent?: string;      // Browser user agent string
  screenHeight?: number;   // Screen height in pixels
  screenWidth?: number;    // Screen width in pixels
  language?: string;       // Browser language (e.g., 'en-US')
  platform?: string;       // Platform (e.g., 'Win32', 'MacIntel')
  adBlock?: boolean;       // Ad blocker detection
  viewportHeight?: number; // Viewport height in pixels
  viewportWidth?: number;  // Viewport width in pixels
  
  // Page related
  pageTitle?: string;      // Page title
  pageUrl?: string;        // Full page URL
  pagePath?: string;       // Page path (e.g., '/discover')
  pageDomain?: string;     // Page domain
  pageLoadTime?: number;   // Page load time in milliseconds
  referrer?: string;       // Referrer URL
  
  // Network related
  ipAddress?: string;      // IP address
  
  // Custom fields
  [key: string]: any;      // Additional event properties (goes into 'ev' field)
}
```

**Parameters:**
- `categoryName`: String identifying the event category (required)
- `eventData`: Object containing event data and tracking fields (optional)

**Example:**
```javascript
await cruxTrack('page_view', {
  userId: 'user123',
  eventTime: Date.now(),
  
  // Session tracking
  sessionId: 'session-456',
  
  // Browser/Device tracking
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  screenHeight: 1920,
  screenWidth: 1080,
  language: 'en-US',
  platform: 'Win32',
  adBlock: true,
  viewportHeight: 1047,
  viewportWidth: 911,
  
  // Page tracking
  pageTitle: 'PortQii Connect',
  pageUrl: 'http://localhost:5173/discover',
  pagePath: '/discover',
  pageDomain: 'localhost',
  pageLoadTime: 4908,
  referrer: 'http://localhost:5173/',
  
  // Network tracking
  ipAddress: '120.12.23.01',
  
  // Custom event data
  customField: 'customValue'
});
```

### Enhanced Tracking Example

The SDK automatically maps your user-friendly field names to the correct API format:

```javascript
// Your input
await cruxTrack('page_view', {
  userId: 'user123',
  sessionId: 'session-456',
  userAgent: 'Mozilla/5.0...',
  screenHeight: 1920,
  pageTitle: 'My Page'
});

// Gets transformed to API payload with:
// - cid: customerId from config
// - cna: customerName from config  
// - uid: userId from eventData
// - e: 'page_view'
// - dtm: current timestamp
// - tna: 'node' (static)
// - tv: 'v1' (static)
// - sid: sessionId
// - ua: userAgent
// - sh: screenHeight
// - pt: pageTitle
// - ev: { userId: 'user123', sessionId: 'session-456', ... }
```

### `getUserTraits(userIds: string | string[])`

Retrieve user traits by userId(s). **Must be called after initializing the SDK.**

```typescript
interface GetUserTraitsResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}
```

**Parameters:**
- `userIds`: Single userId string or array of userId strings (required)

**Returns:** Promise that resolves to `GetUserTraitsResponse`

**Example:**
```javascript
// Get traits for a single user
const singleUserTraits = await getUserTraits('user123');

// Get traits for multiple users
const multipleUserTraits = await getUserTraits(['user123', 'user456', 'user789']);

// Check the response
if (singleUserTraits.success) {
  console.log('User traits:', singleUserTraits.data);
} else {
  console.error('Error:', singleUserTraits.error);
}
```

**API Endpoint Details:**
- **Method**: POST
- **URL**: `https://dev-uii.portqii.com/api/v1/user-traits?customerId={customerId}`
- **Headers**: 
  - `Content-Type: application/json`
  - `x-client-id: {clientId}`
- **Body**: `{ "userIds": ["user1", "user2", ...] }`
- **Query Params**: `customerId` from your SDK configuration

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
- `"userIds is required"` - Missing userIds parameter for getUserTraits
- `"At least one userId is required"` - Empty userIds array for getUserTraits
- `"All userIds must be non-empty strings"` - Invalid userId format for getUserTraits
- `"Failed to get user traits: [reason]"` - Error in getUserTraits operation

## TypeScript Support

The SDK is written in TypeScript and exports all necessary types:

```typescript
import { 
  InitConfig, 
  EventData, 
  ExtendedEventData,
  EnrichedEvent, 
  GetUserTraitsRequest, 
  GetUserTraitsResponse 
} from '@sanketrannore/node-tracker-sdk';

const config: InitConfig = {
  clientId: 'client-123',
  customerId: 'customer-456',
  customerName: 'My Company'
};

const eventData: ExtendedEventData = {
  userId: 'user123',
  eventTime: Date.now(),
  sessionId: 'session-456',
  pageTitle: 'My Page'
};

const userTraitsRequest: GetUserTraitsRequest = {
  userIds: ['user123', 'user456']
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

### Enhanced Tracking with Browser Data
```javascript
await cruxTrack('page_view', {
  userId: 'user123',
  sessionId: 'session-456',
  userAgent: navigator.userAgent,
  screenHeight: window.screen.height,
  screenWidth: window.screen.width,
  language: navigator.language,
  platform: navigator.platform,
  viewportHeight: window.innerHeight,
  viewportWidth: window.innerWidth,
  pageTitle: document.title,
  pageUrl: window.location.href,
  pagePath: window.location.pathname,
  pageDomain: window.location.hostname,
  referrer: document.referrer
});
```

### With Custom Event Time
```javascript
const customTime = new Date('2023-12-01').getTime();
await cruxTrack('historical_event', {
  action: 'data_migration',
  eventTime: customTime
});
```

### With User ID
```javascript
await cruxTrack('user_action', { 
  userId: 'user123',
  action: 'login',
  source: 'web'
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

### Getting User Traits
```javascript
// Get traits for a single user
try {
  const traits = await getUserTraits('user123');
  if (traits.success) {
    console.log('User traits:', traits.data);
  } else {
    console.error('Failed to get traits:', traits.error);
  }
} catch (error) {
  console.error('Error getting user traits:', error.message);
}

// Get traits for multiple users
try {
  const multipleTraits = await getUserTraits(['user123', 'user456', 'user789']);
  if (multipleTraits.success) {
    console.log('Multiple user traits:', multipleTraits.data);
  } else {
    console.error('Failed to get multiple traits:', multipleTraits.error);
  }
} catch (error) {
  console.error('Error getting multiple user traits:', error.message);
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

## Dependencies

- **axios**: HTTP client for API requests
- **uuid**: UUID generation for event IDs
- **zod**: Schema validation
- **tslib**: TypeScript runtime helpers

## License

Apache-2.0

## Support

For issues and questions, please visit our [GitHub repository](https://github.com/sanketrannore/node-tracker-sdk).