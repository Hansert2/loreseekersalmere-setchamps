// Search all known events for a player matching a name fragment
const fs = require('fs');
const SEARCH = (process.argv[2] || 'MrBlizzard').toLowerCase();
const BASE = 'https://api.cloudflare.ravensburgerplay.com/hydraproxy/api/v2';

async function getAllPages(url) {
  let results = [], page = 1;
  while (true) {
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${sep}page=${page}&page_size=100`);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    const data = await res.json();
    const items = data.results ?? data;
    if (!Array.isArray(items) || items.length === 0) break;
    results.push(...items);
    if (!data.next) break;
    page++;
  }
  return results;
}

async function main() {
  const players = JSON.parse(fs.readFileSync('data/players.json', 'utf8'));

  const eventIds = new Set();
  for (const p of players) {
    for (const c of p.championships ?? []) {
      if (c.eventId) eventIds.add(c.eventId);
    }
  }

  console.log(`Searching ${eventIds.size} events for "${SEARCH}"...\n`);

  const hits = [];
  for (const id of eventIds) {
    let regs;
    try { regs = await getAllPages(`${BASE}/events/${id}/registrations/`); }
    catch (e) { console.error(`Event ${id}: ${e.message}`); continue; }

    for (const r of regs) {
      const tag = (r.best_identifier ?? '').toLowerCase();
      if (tag.includes(SEARCH)) {
        hits.push({
          eventId: id,
          userId: r.user?.id,
          tag: r.best_identifier,
          placement: r.final_place_in_standings,
          record: `${r.matches_won}-${r.matches_lost}${r.matches_drawn ? '-' + r.matches_drawn : ''}`,
        });
      }
    }
  }

  if (hits.length === 0) {
    console.log('No matches found in tracked events.');
  } else {
    console.log(`Found ${hits.length} appearance(s):\n`);
    for (const h of hits) {
      console.log(`  Event ${h.eventId} (user ${h.userId}) — ${h.tag}  #${h.placement ?? '?'}  ${h.record}`);
    }
  }
}

main().catch(console.error);
