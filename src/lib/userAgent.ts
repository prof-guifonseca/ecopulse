// Identifying User-Agent + contact for outbound calls to open data providers
// (Open Food Facts, OpenStreetMap Overpass/Nominatim). These services ask for a
// real, identifiable agent with a contact and may throttle or block generic or
// placeholder agents (e.g. example.com / *.local). Override per-environment via
// OPEN_FOOD_FACTS_USER_AGENT / ESG_USER_AGENT.

export const ECOPULSE_CONTACT_URL = 'https://github.com/prof-guifonseca/ecopulse';
export const ECOPULSE_USER_AGENT = `EcoPulse/0.1 (+${ECOPULSE_CONTACT_URL})`;
