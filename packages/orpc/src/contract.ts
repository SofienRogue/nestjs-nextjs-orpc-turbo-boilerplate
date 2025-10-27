import { oc } from '@orpc/contract';
import { todoContract } from './contracts/todo.contract.js';
import { fileContract } from './contracts/file.contract.js';
import { mailContract } from './contracts/mail.contract.js';

/**
 * Main contract router
 * Combines all API contracts
 */
export const contract = oc.router({
  todo: todoContract,
  file: fileContract,
  mail: mailContract,
});

/**
 * Export contract type for type inference
 */
export type Contract = typeof contract;