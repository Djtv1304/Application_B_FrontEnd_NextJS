
// lib/workos.ts
import { WorkOS } from '@workos-inc/node';

/**
 *  Instancia única del SDK de WorkOS inicializada explícitamente
 *  con las credenciales leídas de las env vars.
 */
export const workos = new WorkOS(process.env.WORKOS_API_KEY!, {
  clientId: process.env.WORKOS_CLIENT_ID!,
});

