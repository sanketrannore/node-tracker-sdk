import { z } from 'zod';

export const initConfigSchema = z.object({
  appId: z.string().min(1, 'appId is required'),
  apiEndpoint: z.string().url().optional()
});

export const eventDataSchema = z.object({
  eventTime: z.number().int().positive().optional(),
  userId: z.string().min(1)
}).passthrough(); // Allow additional properties

export const enrichedEventSchema = z.object({
  id: z.string().uuid(),
  appId: z.string().min(1),
  category: z.string().min(1),
  eventTime: z.number().int().positive(),
  timezone: z.string().min(1),
  data: z.record(z.any()),
  userId: z.string().min(1)
}); 