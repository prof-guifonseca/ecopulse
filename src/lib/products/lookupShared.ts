/**
 * Shared product-lookup primitives used by both the orchestrator
 * (`productLookup.ts`) and the Open Food Facts adapter
 * (`adapters/openFoodFacts.ts`). A leaf module so the two never import each
 * other (the orchestrator calls the adapter — the reverse would cycle).
 */
export const INSUFFICIENT_TIP =
  'Dados insuficientes para avaliação completa. Use como registro e confira alternativas com mais evidências.';
