/**
 * @workspace/orpc
 * Shared oRPC contracts for type-safe API communication
 */

// Export schemas
export * from './schemas/todo.schema.js';
export * from './schemas/file.schema.js';
export * from './schemas/mail.schema.js';

// Export contracts
export * from './contracts/todo.contract.js';
export * from './contracts/file.contract.js';
export * from './contracts/mail.contract.js';

// Export main contract router
export { contract, type Contract } from './contract.js';

// Export utilities
export * from './utils/transform.js';

// Re-export useful types from @orpc packages for convenience
export type { ContractRouter } from '@orpc/contract';