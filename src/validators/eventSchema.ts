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
  cna: z.string().min(1), // Updated from cn to cna
  e: z.string().min(1),
  dtm: z.number().int().positive(),
  tz: z.string().min(1),
  ev: z.record(z.any()),
  uid: z.string().min(1),
  client_id: z.string().min(1),
  
  // Required static values
  tna: z.string().min(1),
  tv: z.string().min(1),
  
  // Optional fields
  sid: z.string().optional(),
  ua: z.string().optional(),
  sh: z.number().int().positive().optional(),
  sw: z.number().int().positive().optional(),
  l: z.string().optional(),
  p: z.string().optional(),
  an: z.boolean().optional(),
  vh: z.number().int().positive().optional(),
  vw: z.number().int().positive().optional(),
  pt: z.string().optional(),
  pu: z.string().optional(),
  pp: z.string().optional(),
  pd: z.string().optional(),
  pl: z.number().int().positive().optional(),
  pr: z.string().optional(),
  ip: z.string().optional()
}); 