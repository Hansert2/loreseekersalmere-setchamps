# Lore Seekers Almere — Set Championship Stats

Static website tracking Set Championship results for the Lore Seekers Almere competitive Disney Lorcana team.

**Live site:** https://hansert2.github.io/loreseekersalmere-setchamps

## Structure

```
public/          # Static site (served by GitHub Pages)
  index.html     # Team roster + overview table
  player.html    # Per-player profile with set-grouped results
  players.json   # Copy of data/players.json — what the site reads
  logo.png / svg

data/
  players.json   # Source of truth for player data

scrape_lsa.js          # Full rescrape — rebuilds players.json from the API
scrape_lsa2.js         # Finds new events missed by naming pattern gaps
scrape_known_stores.js # Checks all known stores for missing events
```

## Updating data

1. Run the scraper to find new events:
   ```
   node scrape_lsa2.js 2>scrape2_log.txt
   ```
   Review `scrape2_log.txt` and merge findings into `data/players.json` manually.

2. Sync to the public folder and deploy:
   ```
   npm run sync
   git add data/players.json public/players.json
   git commit -m "Update championship data"
   git push
   ```

GitHub Pages will redeploy automatically within a minute.

## Player data format

```json
{
  "slug": "loregoat",
  "tag": "LSA | LoreGoat 🐐",
  "initials": "LG",
  "championships": [
    {
      "eventId": 375648,
      "setName": "Winterspell",
      "eventName": "Sunday Winterspell - Set Championship",
      "date": "2026-04-05",
      "placement": 1,
      "record": "5-0",
      "store": "Het Beeldverhaal"
    }
  ]
}
```

## Social

- Twitch: https://www.twitch.tv/loreseekersalmere
- Instagram: https://www.instagram.com/loreseekers.almere/
- YouTube: https://www.youtube.com/@LoreSeekers.Almere
