/**
 * Branded (nominal) identifier types.
 *
 * A branded id is structurally a `string` at runtime but a distinct type at
 * compile time, so a `PointId` can never be passed where a `ProductId` is
 * expected — a whole class of "wrong id" bugs becomes uncompilable.
 *
 * Branded ids are *subtypes* of `string`: reading/comparing them is friction
 * free (a `ProductId` flows into any `string` slot). Only **construction** is
 * gated — a raw `string` is NOT a `ProductId`. That gate is the factory
 * functions below: they are the single, searchable place where an untrusted
 * string (API body, parsed JSON, fixture) is promoted into the branded world.
 */

declare const brand: unique symbol;
type Brand<B extends string> = { readonly [brand]: B };

export type ProductId = string & Brand<'ProductId'>;
export type PointId = string & Brand<'PointId'>;
export type PostId = string & Brand<'PostId'>;
export type BattleId = string & Brand<'BattleId'>;
export type OpponentId = string & Brand<'OpponentId'>;
export type UserId = string & Brand<'UserId'>;

export const asProductId = (value: string): ProductId => value as ProductId;
export const asPointId = (value: string): PointId => value as PointId;
export const asPostId = (value: string): PostId => value as PostId;
export const asBattleId = (value: string): BattleId => value as BattleId;
export const asOpponentId = (value: string): OpponentId => value as OpponentId;
export const asUserId = (value: string): UserId => value as UserId;
