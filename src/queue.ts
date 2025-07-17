import { EnrichedEvent, QueuedEvent } from './types/event';
import { sendEvent } from './api';

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 10000; // 10 seconds
const eventQueue: QueuedEvent[] = [];
let retryTimer: NodeJS.Timeout | null = null;

export function addToQueue(event: EnrichedEvent): void {
  const queuedEvent: QueuedEvent = {
    event,
    attempts: 0,
    timestamp: Date.now()
  };
  
  eventQueue.push(queuedEvent);
  console.log(`Event queued: ${event.id}`);
  
  // Start retry timer if not already running
  if (!retryTimer) {
    startRetryTimer();
  }
}

export function getQueueSize(): number {
  return eventQueue.length;
}

export function clearQueue(): void {
  eventQueue.length = 0;
  if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
  }
}

function startRetryTimer(): void {
  retryTimer = setInterval(async () => {
    await processQueue();
  }, RETRY_INTERVAL);
}

async function processQueue(): Promise<void> {
  if (eventQueue.length === 0) {
    // Stop timer if queue is empty
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    return;
  }
  
  const eventsToRetry = [...eventQueue];
  eventQueue.length = 0; // Clear the queue
  
  for (const queuedEvent of eventsToRetry) {
    try {
      await sendEvent(queuedEvent.event);
      console.log(`Queued event sent successfully: ${queuedEvent.event.id}`);
    } catch (error) {
      queuedEvent.attempts++;
      
      if (queuedEvent.attempts < MAX_RETRIES) {
        // Re-queue for retry
        eventQueue.push(queuedEvent);
        console.log(`Event retry ${queuedEvent.attempts}/${MAX_RETRIES}: ${queuedEvent.event.id}`);
      } else {
        // Max retries reached, log error
        console.error(`Event failed after ${MAX_RETRIES} attempts: ${queuedEvent.event.id}`, error);
      }
    }
  }
} 