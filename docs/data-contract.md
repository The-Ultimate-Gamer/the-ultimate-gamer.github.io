# Data contract (schema version 1)

The website reads JSON files published by the separate data repository ([The-Ultimate-Gamer/data](https://github.com/The-Ultimate-Gamer/data), served at `https://the-ultimate-gamer.github.io/data/`). The files are generated from the SQLite database and should never be edited by hand. TypeScript mirror: `src/lib/data/types.ts`. Validation of essential fields: `src/lib/data/validate.ts`.

## Envelope

Every file uses the same wrapper:

```json
{ "schemaVersion": 1, "generatedAt": "2026-10-17T08:00:00Z", "data": {} }
```

- `schemaVersion` (integer). Increase it only for breaking changes. The website rejects versions newer than it supports.
- `generatedAt`: ISO 8601 UTC time of the export. The site shows it as "Updated … ago".
- **Optional fields** may be omitted or set to `null`. The website never invents missing values.
- **Slugs** are lowercase kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`). They are stable and used in URLs.

Shared shapes:

- `PlayerRef`, `GameRef` and `TournamentRef` are `{ slug, name }`. A `GameRef` also has `url?` (an https link to get or play the game) when one is known.
- `TokenCounts` is `{ doubleDown, nominate }` and counts **remaining** tokens.

## Files

Besides the JSON below, the export publishes two kinds of non-JSON files next to it:

- `avatars/<player-slug>.<ext>` and `avatars/<player-slug>.discord.png`: player pictures (uploaded, or copied from Discord), referenced by `avatarUrl` as relative paths.
- `share/players/<slug>/` and `share/tournaments/<slug>/`: HTML pages with link-preview tags that redirect to the website. The website links to them through `shareUrl()` and never reads them.

| Path                      | `data` shape                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `site.json`               | `{ name, tagline?, currentTournament?: TournamentRef, demo?: boolean }` (`demo` is true while fictional demo data is published, and the site shows a banner) |
| `leaderboard.json`        | Live view of the current tournament (see below)                                                                                                              |
| `categories.json`         | `{ categories: [{ slug, name, icon?, description?, tournamentsUsed? }] }`                                                                                    |
| `awards.json`             | `{ awards: [{ slug, name, icon?, description?, scope?, recipients?: AwardGrant[] }] }`                                                                       |
| `games/index.json`        | `{ games: GameInfo[] }`                                                                                                                                      |
| `players/index.json`      | `{ players: PlayerSummary[] }`                                                                                                                               |
| `players/{slug}.json`     | `{ player: PlayerProfile }`                                                                                                                                  |
| `tournaments/index.json`  | `{ tournaments: TournamentSummary[] }`                                                                                                                       |
| `tournaments/{slug}.json` | `{ tournament: TournamentDetail }`                                                                                                                           |

### leaderboard.json

```
{
  tournament: TournamentSummary | null,     // null = no current tournament
  currentCategory?: slug | null,
  currentGame?: GameRef | null,             // null while not yet revealed
  nextSelection?: GameSelection | null,
  nextNemeses?: NemesisPair[] | null,       // public Nemesis pairs for the next game; null when not live
  standings: StandingEntry[],
  categories: CategoryProgressEntry[],      // one entry per game: played ones, then the rest of the current lap
  recentResults?: GameResult[]              // newest first; include `tournament` ref
}
```

### Key types

- **PlayerRef:** `{ slug, name, avatarUrl? }`. `avatarUrl` is present only when the player has a picture (see PlayerSummary).
- **NemesisPair:** `{ player, nemesis }`. Nemeses are public. Several players can share a Nemesis, and pairs need not be mutual.

- **StandingEntry:**
  - Fields: `{ rank, player, points, isChallenger, challengerSinceGame?, isChampion, tokens?, gamesPlayed?, gamesWon?, categoryWins?: slug[], awards?: slug[], isFirstTournament? }`
  - `rank` is the points rank.
  - `isChampion` is separate from `isChallenger`, and the champion does not need to have rank 1.
- **CategoryProgressEntry:** `{ order, lap?, category, status: 'completed'|'active'|'upcoming', gameNumber?, game?, winner? }`
  - `order` is the game number. Games follow the tournament's category order and start over (a new `lap`) until someone is crowned, so a category can appear more than once; each game is still drawn separately.
- **GameSelection:** `{ status: 'pending'|'drawn', category?, nominations?: [{ game, nominatedBy?, source: 'winner'|'vote'|'token', entries? }], selected? }`
- **GameResult:**
  - Fields: `{ number, category, game, tournament?, playedAt?, winner?, results?: GameResultEntry[], newChallengers?: PlayerRef[], decidedTournament?, selection? }`
  - Set `decidedTournament: true` on the game in which a Challenger won the tournament.
- **GameResultEntry:** `{ player, placement, points, basePoints?, nemesisBonus?, doubleDown?, nemesis?, defeatedNemesis? }`
  - `points` is the final total for that game, including the Double Down multiplier and the Nemesis bonus.
- **TournamentSummary:** `{ slug, name, tags?: string[], startDate?, endDate?, location?, status: 'upcoming'|'ongoing'|'completed', isDemo?, challengerThreshold?, pointsTable?: [{ placement, points }], playerCount?, gamesPlayed?, categoriesCompleted?, categoriesPlanned?, lap?, champion?, leaders?: [{ rank, player, points }], awards?: AwardGrant[] }`
  - `tags` are display labels such as "LAN" or "Weekend". Older data had a free-text `edition` instead.
  - `status` follows the games: upcoming until the first game is drawn, ongoing after that, completed when a Challenger wins (or the organisers end it).
  - `categoriesPlanned` is the number of categories in the order; `categoriesCompleted` counts distinct categories played (at most `categoriesPlanned`); `lap` is the current (or last) pass through the order.
- **TournamentDetail:** a `TournamentSummary` plus `{ currentCategory?, currentGame?, nextSelection?, nextNemeses?, standings, categories, games: GameResult[] }`
- **AwardGrant:** `{ award: slug, player, tournament?, detail? }`
  - `detail` is a human-readable supporting statistic.
- **GameInfo:** `{ slug, name, categories: slug[], description?, minPlayers?, maxPlayers?, timesPlayed?, timesNominated?, lastPlayed?: { tournament, gameNumber, playedAt? }, available?, url? }`
  - A game may belong to several categories.
- **PlayerSummary:** `{ slug, name, initials?, avatarUrl?, firstTournament?, tournamentsPlayed?, ultimateGamerWins?, challengerAppearances?, gameWins?, podiumFinishes?, awardCount?, bestPlacement?, current?: { tournament, rank, points }, discord?: { id, username?, displayName? } }`
  - `avatarUrl` is an `https:` URL, or a path relative to the data URL for pictures hosted with the data (for example `avatars/tnoy.jpg` or `avatars/tnoy.discord.png`). Anything else is ignored. The admin picks it in this order: an uploaded picture, a picture link, the Discord picture; without any, the site shows initials.
  - `bestPlacement` is the best final placement (`finish`) in a completed tournament, so the champion counts as 1st.
  - `discord` is the player's linked Discord account. Real players always have one; fictional demo players have `null`. `id` is the numeric user id (15–21 digits); `username` and `displayName` are copied from Discord by the admin tool (`ug-admin discord`) and are `null` until fetched. The site links to `https://discord.com/users/<id>` and never calls Discord itself.
- **PlayerProfile:** a `PlayerSummary` plus:
  - `tournaments?: [{ tournament, startDate?, status, placement?, finish?, points?, gamesWon?, podiums?, wasChallenger?, wasChampion? }]`
    - `placement` is the points rank. `finish` is the final placement once the tournament is over: the champion is 1st and everyone else follows by points. It is null while the tournament is running.
  - `awards?: [{ award, tournament?, detail? }]`
  - `categoryWins?: [{ category, wins }]`
  - `nemesis?: { defeated, defeatedBy, timesAssigned? }`
  - `doubleDown?: { used, wins, bonusPoints? }`
  - `nominate?: { used, selected }`
  - `matches?: PlayerMatch[]` (newest first)
  - `rivals?: [{ player, nemesisWins, nemesisLosses }]`

## Responsibilities

The data repository computes everything authoritative:

- Standings and ranks
- Challenger and champion flags
- Award recipients, from fixed rules (everyone tied for an award gets it)
- Statistics

The website only presents these values. It does sort lists for display, but it does not derive tournament outcomes.

Award slugs the website knows about: `ultimate-gamer`, `challenger`, `dominator`, `contender`, `podium`, `believer`, `nominator`, `rookie`, `underdog`, `fallout`, `legend`, `nemesis`, `victim`, `ghost`, `survivor`.

Category slugs the website knows about: `strategy`, `combat`, `puzzle`, `platform`, `chaos`, `racing`, `teamwork`, `wildcard`, `knowledge`, `tabletop`, `offline`, `idle`, `speedrun`, `simulation`.

Unknown slugs still render, using a neutral fallback icon and name.

The data repository's `ug-admin seed --demo` generates a complete fictional example dataset.
