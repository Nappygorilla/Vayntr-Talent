/* -------------------------------------------------------------------------- */
/*  Age floors                                                                */
/*                                                                            */
/*  Minimum ages come from each scene's competition rules, not from a         */
/*  platform-wide number. Guardian consent is required for every minor; an    */
/*  organisation contracting a minor also needs a guardian's signature.       */
/* -------------------------------------------------------------------------- */

export type AgePolicy = { game: string; minAge: number; note: string; source: string }
// Minimum ages come from each scene's competition rules, not from a platform-wide number.
// Guardian consent is required for every minor; organisation contracts for a minor also need a guardian's signature.
export const gameAgePolicies: AgePolicy[] = [
  { game: 'Rocket League', minAge: 13, note: 'RLCS lowered its minimum to 13 in 2024, so a 14-year-old can sign with an org. A guardian must consent and accompany them at in-person events.', source: 'https://www.rocketleague.com/competitive/rules' },
  { game: 'Fortnite', minAge: 13, note: 'FNCS rules set 13+, with parent or guardian permission to compete.', source: 'https://www.fortnite.com/competitive/rules-guidelines/rules-library/fortnite-championship-series-fncs-2026-official-rules' },
  { game: 'Street Fighter 6', minAge: 13, note: 'Capcom Pro Tour requires 13+ and the local game rating, with guardian consent and accompaniment.', source: 'https://sf.esports.capcom.com/cpt/2025/rules/' },
  { game: 'Apex Legends', minAge: 16, note: 'ALGS requires 16+ (17 in Japan, 18 in South Korea) and guardian consent for minors.', source: 'https://algs.ea.com/year-6-rules.pdf' },
  { game: 'Counter-Strike 2', minAge: 16, note: 'ESL Pro League qualifiers list 16+; Valve leaves the Major age floor to event organisers.', source: 'https://pro.eslgaming.com/tour/2025/02/2025-rulebook-update-2/' },
  { game: 'EA SPORTS FC', minAge: 16, note: 'FC Pro uses 16+ (17 in Japan; 18 in Ghana, Kenya, Nigeria and South Korea).', source: 'https://www.ea.com/games/ea-sports-fc/fc-pro/ea-sports-fc-pro-26-official-rules' },
  { game: 'League of Legends', minAge: 17, note: 'LCS/LTA competition is 17+; the LEC requires players to have lived 18 years to play a match.', source: 'https://competitiveops.riotgames.com/library?GAME=lol' },
  { game: 'Overwatch 2', minAge: 17, note: 'OWCS requires players to be 17 by the first day of each tournament.', source: 'https://esports.overwatch.com/faq' },
  { game: 'VALORANT', minAge: 18, note: 'VCT Tier 1 is 18+. Challengers and regional qualifiers can set their own rules.', source: 'https://competitiveops.riotgames.com/library?GAME=val' },
  { game: 'Call of Duty / Warzone', minAge: 18, note: 'CDL Challengers and the World Series of Warzone are 18+.', source: 'https://callofdutyleague.com/en-us/challengers/how-to-compete' },
  { game: 'Rainbow Six Siege', minAge: 18, note: 'BLAST R6 requires players and team staff to be 18+ at their first match.', source: 'https://www.ubisoft.com/en-us/esports/rainbow-six' },
  { game: 'Tekken 8', minAge: 18, note: 'Tekken World Tour requires the local age of majority or explicit guardian permission.', source: 'https://www.bandainamcoent.com/legal/community-events/official-rules-twt' },
]
// Organizations type these labels by hand, so they are matched through an alias table
// instead of an exact string compare. A label that matches no verified rule is treated as
// 18+ and flagged — an unrecognised game can never quietly inherit a lower floor.
const gameAliases: Record<string, string> = {
  valorant: 'VALORANT', val: 'VALORANT',
  'call of duty': 'Call of Duty / Warzone', 'call of duty / warzone': 'Call of Duty / Warzone',
  warzone: 'Call of Duty / Warzone', cod: 'Call of Duty / Warzone', mw3: 'Call of Duty / Warzone',
  'black ops 6': 'Call of Duty / Warzone', 'black ops 7': 'Call of Duty / Warzone',
  'league of legends': 'League of Legends', lol: 'League of Legends',
  'counter-strike 2': 'Counter-Strike 2', 'counter strike 2': 'Counter-Strike 2', cs2: 'Counter-Strike 2', cs: 'Counter-Strike 2',
  'overwatch 2': 'Overwatch 2', overwatch: 'Overwatch 2', ow2: 'Overwatch 2',
  'rainbow six siege': 'Rainbow Six Siege', r6: 'Rainbow Six Siege', 'r6 siege': 'Rainbow Six Siege', siege: 'Rainbow Six Siege',
  'rocket league': 'Rocket League', rl: 'Rocket League',
  fortnite: 'Fortnite',
  'apex legends': 'Apex Legends', apex: 'Apex Legends',
  'ea sports fc': 'EA SPORTS FC', 'ea fc': 'EA SPORTS FC', fifa: 'EA SPORTS FC', 'fc 25': 'EA SPORTS FC', 'fc 26': 'EA SPORTS FC',
  'street fighter 6': 'Street Fighter 6', 'street fighter': 'Street Fighter 6', sf6: 'Street Fighter 6',
  'tekken 8': 'Tekken 8', tekken: 'Tekken 8',
}

/** The verified policy name for a label, or null when nothing matches it. */
export function canonicalGame(value: string): string | null {
  const key = value.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!key) return null
  const alias = gameAliases[key]
  if (alias) return alias
  return gameAgePolicies.find((policy) => policy.game.toLowerCase() === key)?.game ?? null
}

export function agePolicyFor(game: string): AgePolicy & { verified: boolean } {
  const label = game.trim()
  const canonical = label ? canonicalGame(label) : null
  const policy = canonical ? gameAgePolicies.find((entry) => entry.game === canonical) : undefined
  if (policy) return { ...policy, verified: true }
  return {
    game: label || 'Unspecified game',
    minAge: 18,
    note: 'No verified competition rule matches this game, so it is treated as 18+ and flagged for review until an organizer rule is added. A requirement is never lowered for an unrecognised game.',
    source: '',
    verified: false,
  }
}
