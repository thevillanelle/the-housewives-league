export type RelationType = 'ally' | 'friend' | 'frenemy' | 'enemy' | 'former_friend' | 'family';

export interface Relationship {
  a: string;       // housewife id
  b: string;       // housewife id
  type: RelationType;
  label: string;   // short description
  franchise: string; // primary franchise context
}

export const REL_COLORS: Record<RelationType, string> = {
  ally:         '#c9a84c',   // gold
  friend:       '#5c9e6e',   // green
  frenemy:      '#d4813a',   // orange
  enemy:        '#b5426a',   // rose/accent
  former_friend:'#7a6a7a',   // muted purple
  family:       '#4a7fc1',   // blue
};

export const REL_LABELS: Record<RelationType, string> = {
  ally:         'Alliance',
  friend:       'Friends',
  frenemy:      'Frenemies',
  enemy:        'Enemies',
  former_friend:'Former Friends',
  family:       'Family',
};

export const RELATIONSHIPS: Relationship[] = [
  // ── NEW JERSEY ────────────────────────────────────────────────────────────
  { a: 'teresa-giudice',    b: 'melissa-gorga',       type: 'family',       label: 'Sister-in-law — war of the Gorgas',             franchise: 'rhonj' },
  { a: 'teresa-giudice',    b: 'caroline-manzo',      type: 'enemy',        label: 'The table flip started a decade of feud',       franchise: 'rhonj' },
  { a: 'teresa-giudice',    b: 'danielle-staub',       type: 'enemy',        label: 'Kitchen table meltdown. Never recovered.',       franchise: 'rhonj' },
  { a: 'teresa-giudice',    b: 'jacqueline-laurita',   type: 'former_friend',label: 'Decades of friendship undone by legal drama',    franchise: 'rhonj' },
  { a: 'melissa-gorga',     b: 'caroline-manzo',      type: 'ally',         label: 'United against Teresa during peak NJ years',     franchise: 'rhonj' },
  { a: 'danielle-staub',    b: 'jacqueline-laurita',   type: 'enemy',        label: 'The hair pull. The charges. The chaos.',         franchise: 'rhonj' },

  // ── NEW YORK ──────────────────────────────────────────────────────────────
  { a: 'bethenny-frankel',  b: 'jill-zarin',          type: 'former_friend',label: '"I\'m done" — friendship implosion of RHONY S4', franchise: 'rhony' },
  { a: 'bethenny-frankel',  b: 'ramona-singer',       type: 'frenemy',      label: 'Mutual respect with regular clashes',            franchise: 'rhony' },
  { a: 'bethenny-frankel',  b: 'luann-de-lesseps',    type: 'enemy',        label: 'The Countess vs. the Skinnygirl — never warm',   franchise: 'rhony' },
  { a: 'ramona-singer',     b: 'sonja-morgan',        type: 'ally',         label: 'Turtle Time besties. Unshakeable bond.',         franchise: 'rhony' },
  { a: 'ramona-singer',     b: 'luann-de-lesseps',    type: 'frenemy',      label: 'Constant tension beneath surface friendship',    franchise: 'rhony' },
  { a: 'ramona-singer',     b: 'dorinda-medley',      type: 'frenemy',      label: 'Berkshires battleground, on and off',            franchise: 'rhony' },
  { a: 'luann-de-lesseps',  b: 'dorinda-medley',      type: 'enemy',        label: '"Clip! Clip! Clip!" — Luann\'s cabaret nemesis', franchise: 'rhony' },
  { a: 'luann-de-lesseps',  b: 'sonja-morgan',        type: 'ally',         label: 'Society girls united, mostly',                   franchise: 'rhony' },
  { a: 'dorinda-medley',    b: 'sonja-morgan',        type: 'friend',       label: 'Bluestone Manor friendship holds strong',        franchise: 'rhony' },

  // ── ATLANTA ───────────────────────────────────────────────────────────────
  { a: 'nene-leakes',       b: 'kim-zolciak',         type: 'former_friend',label: 'Atlanta\'s original duo — crumbled slowly',      franchise: 'rhoa' },
  { a: 'nene-leakes',       b: 'kandi-burruss',       type: 'frenemy',      label: 'Competitive energy masked as friendship',        franchise: 'rhoa' },
  { a: 'nene-leakes',       b: 'cynthia-bailey',      type: 'former_friend',label: 'Business partner fallout ended their era',       franchise: 'rhoa' },
  { a: 'kenya-moore',       b: 'phaedra-parks',       type: 'enemy',        label: 'The lie that got Phaedra fired. Historic.',      franchise: 'rhoa' },
  { a: 'kenya-moore',       b: 'sheree-whitfield',    type: 'frenemy',      label: '"Gone with the Wind" vs. "Who gon\' check me?"', franchise: 'rhoa' },
  { a: 'kandi-burruss',     b: 'phaedra-parks',       type: 'former_friend',label: 'Real estate partnership → betrayal → lawsuit',    franchise: 'rhoa' },
  { a: 'kandi-burruss',     b: 'kenya-moore',         type: 'ally',         label: 'Mutual respect, shared targets',                 franchise: 'rhoa' },
  { a: 'cynthia-bailey',    b: 'kenya-moore',         type: 'friend',       label: 'The model alliance that endured seasons',        franchise: 'rhoa' },
  { a: 'phaedra-parks',     b: 'porsha-williams',     type: 'ally',         label: 'The alliance that blindsided everyone',          franchise: 'rhoa' },
  { a: 'sheree-whitfield',  b: 'nene-leakes',         type: 'frenemy',      label: '"She by Sheree" vs. Millionaire\'s Row',         franchise: 'rhoa' },

  // ── BEVERLY HILLS ─────────────────────────────────────────────────────────
  { a: 'lisa-vanderpump',   b: 'kyle-richards',       type: 'former_friend',label: 'PuppyGate ended a decade of friendship',         franchise: 'rhobh' },
  { a: 'kyle-richards',     b: 'lisa-rinna',          type: 'ally',         label: 'BH\'s most powerful alliance — until it cracked',franchise: 'rhobh' },
  { a: 'lisa-rinna',        b: 'denise-richards',     type: 'enemy',        label: 'Brandi allegation + Rinna amplification = war',   franchise: 'rhobh' },
  { a: 'kathy-hilton',      b: 'kyle-richards',       type: 'family',       label: 'Sisters — complicated by decades of rivalry',    franchise: 'rhobh' },
  { a: 'kathy-hilton',      b: 'lisa-rinna',          type: 'enemy',        label: 'Aspen meltdown leaked. Rinna called it out.',    franchise: 'rhobh' },
  { a: 'erika-jayne',       b: 'lisa-rinna',          type: 'ally',         label: 'Erika\'s main defender through Tom Girardi saga', franchise: 'rhobh' },
  { a: 'kyle-richards',     b: 'erika-jayne',         type: 'ally',         label: 'BH power trio solidarity',                       franchise: 'rhobh' },
  { a: 'lisa-vanderpump',   b: 'erika-jayne',         type: 'frenemy',      label: 'Never fully trusted each other on-screen',       franchise: 'rhobh' },
  { a: 'kim-richards',      b: 'kyle-richards',       type: 'family',       label: 'Siblings — sobriety arc defined early BH',       franchise: 'rhobh' },

  // ── ORANGE COUNTY ─────────────────────────────────────────────────────────
  { a: 'vicki-gunvalson',   b: 'tamra-judge',         type: 'ally',         label: 'OC\'s original powerhouse duo',                  franchise: 'rhoc' },
  { a: 'tamra-judge',       b: 'shannon-beador',      type: 'ally',         label: 'Three\'s company with Vicki — then unraveled',   franchise: 'rhoc' },
  { a: 'vicki-gunvalson',   b: 'shannon-beador',      type: 'frenemy',      label: 'Never quite on the same page',                   franchise: 'rhoc' },
  { a: 'heather-dubrow',    b: 'shannon-beador',      type: 'former_friend',label: 'Fancy Pants vs. Whole Foods — classic OC war',   franchise: 'rhoc' },
  { a: 'heather-dubrow',    b: 'tamra-judge',         type: 'ally',         label: 'Aligned through many seasons of cast chaos',     franchise: 'rhoc' },

  // ── POTOMAC ───────────────────────────────────────────────────────────────
  { a: 'gizelle-bryant',    b: 'karen-huger',         type: 'frenemy',      label: 'Grande Dame vs. the Pastor\'s Wife. Always.',    franchise: 'rhop' },
  { a: 'gizelle-bryant',    b: 'robyn-dixon',         type: 'ally',         label: 'Ride-or-die since Season 1',                     franchise: 'rhop' },
  { a: 'karen-huger',       b: 'ashley-darby',        type: 'frenemy',      label: 'Shade wars with occasional truce',               franchise: 'rhop' },
  { a: 'ashley-darby',      b: 'gizelle-bryant',      type: 'enemy',        label: 'Gizelle vs. Ashley — recurring season drama',    franchise: 'rhop' },
  { a: 'monique-samuels',   b: 'candiace-dillard',    type: 'enemy',        label: 'Physical altercation defined Season 5',          franchise: 'rhop' },
  { a: 'gizelle-bryant',    b: 'candiace-dillard',    type: 'enemy',        label: '"Potomac\'s mean girl" vs. the newest target',   franchise: 'rhop' },

  // ── SALT LAKE CITY ────────────────────────────────────────────────────────
  { a: 'heather-gay',       b: 'lisa-barlow',         type: 'former_friend',label: 'Hot mic ended years of sisterhood',              franchise: 'rhoslc' },
  { a: 'heather-gay',       b: 'whitney-rose',        type: 'friend',       label: 'SLC\'s most consistent friendship',              franchise: 'rhoslc' },
  { a: 'jen-shah',          b: 'meredith-marks',      type: 'enemy',        label: 'Allies until arrest put everything in question',  franchise: 'rhoslc' },
  { a: 'jen-shah',          b: 'lisa-barlow',         type: 'frenemy',      label: 'United sometimes, opposed often',                franchise: 'rhoslc' },
  { a: 'meredith-marks',    b: 'lisa-barlow',         type: 'ally',         label: 'BFFs — codependent SLC power duo',               franchise: 'rhoslc' },

  // ── MIAMI ─────────────────────────────────────────────────────────────────
  { a: 'adriana-de-moura',  b: 'lisa-hochstein',      type: 'enemy',        label: 'Miami\'s most explosive feud post-Lenny scandal',franchise: 'rhom' },
  { a: 'alexia-echevarria', b: 'adriana-de-moura',    type: 'frenemy',      label: 'Long history, deep tension underneath',          franchise: 'rhom' },
];

export function getRelationshipsForFranchise(franchiseId: string): Relationship[] {
  return RELATIONSHIPS.filter(r => r.franchise === franchiseId);
}

export function getRelationshipsForPlayer(playerId: string): Relationship[] {
  return RELATIONSHIPS.filter(r => r.a === playerId || r.b === playerId);
}
