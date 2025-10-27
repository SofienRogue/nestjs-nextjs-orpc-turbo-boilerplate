import { createORPCClient } from '@orpc/client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { contract, type Contract } from '@workspace/orpc';
import { type ContractRouterClient } from '@orpc/contract';
import { type JsonifiedClient } from '@orpc/openapi-client';

/**
 * OpenAPI Link configuration for backend communication
 * NestJS with @orpc/nest creates OpenAPI-compatible endpoints
 */
const link = new OpenAPILink(contract, {
  url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Type-safe oRPC client for frontend API calls
 * Uses OpenAPI Link to communicate with the NestJS backend via HTTP
 */
export const orpc: JsonifiedClient<ContractRouterClient<Contract>> = createORPCClient(link);

/**
 * Export contract type for use in components
 */
export type { Contract };