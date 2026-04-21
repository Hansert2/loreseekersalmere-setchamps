// Search all known store events for a player matching a name fragment
const SEARCH = (process.argv[2] || 'MrBlizzard').toLowerCase();
const BASE = 'https://api.cloudflare.ravensburgerplay.com/hydraproxy/api/v2';

const STORES = [
  { name: 'De Spellenhoorn', id: 1158 },
  { name: 'Trading Card Games Center', id: 5098 },
  { name: 'Mox spellen', id: 3478 },
  { name: 'Het Beeldverhaal', id: 2425 },
  { name: 'Poke-Maat', id: 3921 },
  { name: 'Kai of Cards B.V.', id: 2735 },
  { name: 'Spellekijn', id: 4384 },
  { name: 'ShibeTCG', id: 30922 },
  { name: 'Animerch', id: 29503 },
  { name: 'Bonfire Collectibles', id: 18116 },
  { name: 'TCGFamily', id: 4572 },
  { name: 'Koning Bordspel BV', id: 2825 },
  { name: 'Spellenpoort', id: 4387 },
];

async function getAllPages(url) {
  let results = [], page = 1;
  while (true) {
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${sep}page=${page}&page_size=100`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  const hits = [];

  for (const store of STORES) {
    let events;
    try {
      events = await getAllPages(`${BASE}/events/?game_type=LORCANA&store=${store.id}`);
    } catch (e) { console.error(`${store.name}: ${e.message}`); continue; }

    const champs = events.filter(e =>
      /set.?champion/i.test(e.name) || /set.?champ/i.test(e.name)
    );

    for (const ev of champs) {
      let regs;
      try { regs = await getAllPages(`${BASE}/events/${ev.id}/registrations/`); }
      catch (e) { console.error(`Event ${ev.id}: ${e.message}`); continue; }

      for (const r of regs) {
        const tag = (r.best_identifier ?? '').toLowerCase();
        if (tag.includes(SEARCH)) {
          hits.push({
            store: store.name,
            eventId: ev.id,
            eventName: ev.name,
            date: ev.start_datetime?.slice(0, 10) ?? '',
            userId: r.user?.id,
            tag: r.best_identifier,
            placement: r.final_place_in_standings,
            record: `${r.matches_won}-${r.matches_lost}${r.matches_drawn ? '-' + r.matches_drawn : ''}`,
          });
        }
      }
    }
    process.stdout.write('.');
  }

  console.log('\n');
  if (hits.length === 0) {
    console.log(`No appearances found for "${SEARCH}" across all known stores.`);
  } else {
    console.log(`Found ${hits.length} appearance(s) for "${SEARCH}":\n`);
    for (const h of hits) {
      console.log(`  [${h.date?.slice(0,10)}] ${h.store} — Event ${h.eventId} "${h.eventName}"`);
      console.log(`    Tag: ${h.tag}  Placement: ${h.placement ?? '?'}  Record: ${h.record ?? '?'}\n`);
    }
  }
}

main().catch(console.error);
