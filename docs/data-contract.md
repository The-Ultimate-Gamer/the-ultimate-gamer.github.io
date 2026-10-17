# Data contract (schema version 1)

The website reads JSON files published by the separate data repository ([The-Ultimate-Gamer/data](https://github.com/The-Ultimate-Gamer/data), served at `https://the-ultimate-gamer.github.io/data/`). The files are generated from the SQLite database and should never be edited by hand. TypeScript mirror: `src/lib/data/types.ts`. Validation of essential fields: `src/lib/data/validate.ts`.

## Envelope

Every file uses the same wrapper:

```json
{ "schemaVersion": 1, "generatedAt": "2026-10-17T08:00:00Z", "data": { } }
```

- `schemaVersion` (integer). Increase it only for breaking changes. The website rejects versions newer than it supports.
- `generatedAt`: ISO 8601 UTC time of the export. The site shows it as "Updated … ago".
- **Optional fields** may be omitted or set to `null`. The website never invents missing values.
- **Slugs** are lowercase kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`). They are stable and used in URLs.

Shared shapes:
- `PlayerRef`, `GameRef` and `TournamentRef` are `{ slug, name }`.
- `TokenCounts` is `{ doubleDown, nominate }` and counts **remaining** tokens.

## Files

| Path | `data` shape |
| --- | --- |
| `site.json` | `{ name, tagline?, currentTournament?: TournamentRef }` |
| `leaderboard.json` | Live view of the current tournament (see below) |
| `categories.json` | `{ categories: [{ slug, name, icon?, description? }] }` |
| `awards.json` | `{ awards: [{ slug, name, icon?, description?, scope?, recipients?: AwardGrant[] }] }` |
| `games/index.json` | `{ games: GameInfo[] }` |
| `players/index.json` | `{ players: PlayerSummary[] }` |
| `players/{slug}.json` | `{ player: PlayerProfile }` |
| `tournaments/index.json` | `{ tournaments: TournamentSummary[] }` |
| `tournaments/{slug}.json` | `{ tournament: TournamentDetail }` |

### leaderboard.json

```
{
  tournament: TournamentSummary | null,     // null = no current tournament
  currentCategory?: slug | null,
  currentGame?: GameRef | null,             // null while not yet revealed
  nextSelection?: GameSelection | null,
  standings: StandingEntry[],
  categories: CategoryProgressEntry[],      // only the categories this tournament uses, in order
  recentResults?: GameResult[]              // newest first; include `tournament` ref
}
```

### Key types

- **StandingEntry:**
  - Fields: `{ rank, player, points, isChallenger, challengerSinceGame?, isChampion, tokens?, gamesPlayed?, gamesWon?, categoryWins?: slug[], awards?: slug[], isFirstTournament? }`
  - `rank` is the points rank.
  - `isChampion` is separate from `isChallenger`, and the champion does not need to have rank 1.
- **CategoryProgressEntry:** `{ order, category, status: 'completed'|'active'|'upcoming', gameNumber?, game?, winner? }`
- **GameSelection:** `{ status: 'pending'|'drawn', category?, nominations?: [{ game, nominatedBy?, source: 'winner'|'vote'|'token', entries? }], selected? }`
- **GameResult:**
  - Fields: `{ number, category, game, tournament?, playedAt?, winner?, results?: GameResultEntry[], newChallengers?: PlayerRef[], decidedTournament?, selection? }`
  - Set `decidedTournament: true` on the game in which a Challenger won the tournament.
- **GameResultEntry:** `{ player, placement, points, basePoints?, nemesisBonus?, doubleDown?, nemesis?, defeatedNemesis? }`
  - `points` is the final total for that game, including the Double Down multiplier and the Nemesis bonus.
- **TournamentSummary:** `{ slug, name, edition?, startDate?, endDate?, location?, status: 'upcoming'|'ongoing'|'completed', challengerThreshold?, playerCount?, gamesPlayed?, categoriesCompleted?, categoriesPlanned?, champion?, leaders?: [{ rank, player, points }], awards?: AwardGrant[] }`
- **TournamentDetail:** a `TournamentSummary` plus `{ currentCategory?, currentGame?, nextSelection?, standings, categories, games: GameResult[], records?: [{ label, value, player? }] }`
- **AwardGrant:** `{ award: slug, player, tournament?, detail? }`
  - `detail` is a human-readable supporting statistic.
- **GameInfo:** `{ slug, name, categories: slug[], description?, minPlayers?, maxPlayers?, timesPlayed?, timesNominated?, lastPlayed?: { tournament, gameNumber }, available? }`
  - A game may belong to several categories.
- **PlayerSummary:** `{ slug, name, initials?, avatarUrl? (https only), firstTournament?, tournamentsPlayed?, ultimateGamerWins?, challengerAppearances?, gameWins?, podiumFinishes?, awardCount?, bestPlacement?, current?: { tournament, rank, points } }`
- **PlayerProfile:** a `PlayerSummary` plus:
  - `tournaments?: [{ tournament, startDate?, status, placement?, points?, gamesWon?, wasChallenger?, wasChampion? }]`
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
- Award recipients, including tie-breaking
- Statistics and records

The website only presents these values. It does sort lists for display, but it does not derive tournament outcomes.

Award slugs the website knows about: `ultimate-gamer`, `challenger`, `dominator`, `contender`, `podium`, `believer`, `nominator`, `rookie`, `underdog`, `fallout`, `legend`, `nemesis`, `victim`, `ghost`, `survivor`.

Category slugs the website knows about: `strategy`, `combat`, `puzzle`, `platform`, `chaos`, `racing`, `teamwork`, `wildcard`, `knowledge`, `tabletop`, `offline`, `idle`, `speedrun`, `simulation`.

Unknown slugs still render, using a neutral fallback icon and name.

The data repository's `scripts/seed.py --demo` generates a complete fictional example dataset.
