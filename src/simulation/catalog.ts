import {
  CHALLENGES,
  DAILY_MISSIONS,
  EVENTS,
  FEED_POSTS,
  MAP_POINTS,
  PRODUCTS,
  TUTORIALS,
  getMissionTemplate,
} from '@/data';

export const PRODUCT_CATALOG = PRODUCTS;
export const MAP_POINT_CATALOG = MAP_POINTS;
export const COMMUNITY_POST_CATALOG = FEED_POSTS;
export const EVENT_CATALOG = EVENTS;
export const CHALLENGE_CATALOG = CHALLENGES;
export const TUTORIAL_CATALOG = TUTORIALS;
export const LEGACY_DAILY_MISSIONS = DAILY_MISSIONS;

export function getProductCatalog() {
  return PRODUCT_CATALOG;
}

export function getMapPointCatalog() {
  return MAP_POINT_CATALOG;
}

export function getCommunityPostCatalog() {
  return COMMUNITY_POST_CATALOG;
}

export function getDailyMissionTemplate(id: string | null | undefined) {
  return getMissionTemplate(id);
}
