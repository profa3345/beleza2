/**
 * functions/src/index.ts
 *
 * Entry point das Cloud Functions.
 * Exporta todas as functions do projeto.
 */

export { createEstablishment } from "./professionals";
export { setAdminClaim, revokeAdminClaim, reviewEstablishment } from "./admin";
