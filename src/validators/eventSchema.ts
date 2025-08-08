import { z } from 'zod';

export const initConfigSchema = z.object({
  clientId: z.string().min(1, 'clientId is required'),
  customerId: z.string().min(1, 'customerId is required'),
  customerName: z.string().min(1, 'customerName is required')
});

export const eventDataSchema = z.object({
  eventTime: z.number().int().positive().optional(),
  userId: z.string().min(1, 'userId is required').optional()
}).passthrough(); // Allow additional properties

export const enrichedEventSchema = z.object({
  eid: z.string().uuid(),
  cid: z.string().min(1),
  cn: z.string().min(1),
  e: z.string().min(1),
  dtm: z.number().int().positive(),
  tz: z.string().min(1),
  ev: z.record(z.any()),
  uid: z.string().min(1),
  client_id: z.string().min(1)
}); 