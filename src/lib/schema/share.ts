import { z } from 'zod'
import {
  handlingStatusEnum,
  incidentTypeEnum,
  verificationStatusEnum,
} from './reports'

export const emergencyDispatchPayloadSchema = z.object({
  trackingCode: z
    .string()
    .trim()
    .regex(/^SW-\d{4}-[A-Z0-9]{4}$/, {
      message: 'Format kode pelacakan tidak valid.',
    }),
  incidentType: incidentTypeEnum,
  verificationStatus: verificationStatusEnum,
  handlingStatus: handlingStatusEnum,
  observedAtIso: z.string().optional(),
  submittedAtIso: z.string(),
  addressDisplay: z.string().nullable().optional(),
  latitude: z.number().min(-11.0).max(6.0),
  longitude: z.number().min(95.0).max(141.0),
  description: z.string().min(1),
  reporterName: z.string().optional(),
})

export type EmergencyDispatchPayload = z.infer<
  typeof emergencyDispatchPayloadSchema
>
