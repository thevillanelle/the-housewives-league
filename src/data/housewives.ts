export type PlayerTier = 'legendary' | 'elite' | 'premium' | 'standard' | 'developing';
export type PlayerStatus = 'current' | 'former' | 'friend_of' | 'legend';

export interface Housewife {
  id: string;
  name: string;
  slug: string;
  franchises: string[];          // franchise ids
  primaryFranchise: string;      // franchise id
  status: PlayerStatus;
  debutYear: number;
  lastSeasonYear?: number;
  seasonsCount: number;
  fantasyValue: number;
  tier: PlayerTier;
  tagline: string;
  careerHighlights: string[];
}

export const HOUSEWIVES: Housewife[] = [
  // ── ORANGE COUNTY ────────────────────────────────────────────────────────
  {
    id: 'vicki-gunvalson', name: 'Vicki Gunvalson', slug: 'vicki-gunvalson',
    franchises: ['rhoc'], primaryFranchise: 'rhoc',
    status: 'legend', debutYear: 2006, lastSeasonYear: 2020, seasonsCount: 13,
    fantasyValue: 900, tier: 'legendary',
    tagline: 'OG of the OC',
    careerHighlights: ['First Housewife ever', 'Coined "woo-hoo"', 'The original insurance queen', 'Love Tank MVP'],
  },
  {
    id: 'tamra-judge', name: 'Tamra Judge', slug: 'tamra-judge',
    franchises: ['rhoc'], primaryFranchise: 'rhoc',
    status: 'current', debutYear: 2007, seasonsCount: 13,
    fantasyValue: 800, tier: 'elite',
    tagline: 'The Taminator',
    careerHighlights: ['Cut It Like a Diamond baptism', 'Season 9 table flip rival', 'Most confrontations in OC history'],
  },
  {
    id: 'heather-dubrow', name: 'Heather Dubrow', slug: 'heather-dubrow',
    franchises: ['rhoc'], primaryFranchise: 'rhoc',
    status: 'current', debutYear: 2012, seasonsCount: 9,
    fantasyValue: 650, tier: 'premium',
    tagline: 'The Fancy Pants',
    careerHighlights: ['Megahouse reveal', 'Dubrow Keto Cuisine empire', 'Champs-Élysées meltdown'],
  },
  {
    id: 'shannon-beador', name: 'Shannon Beador', slug: 'shannon-beador',
    franchises: ['rhoc'], primaryFranchise: 'rhoc',
    status: 'former', debutYear: 2014, lastSeasonYear: 2024, seasonsCount: 10,
    fantasyValue: 600, tier: 'premium',
    tagline: 'Whole Foods Warrior',
    careerHighlights: ['Marriage crisis arc', 'DUI storyline', 'The lemon cake incident'],
  },
  // ── NEW YORK CITY ─────────────────────────────────────────────────────────
  {
    id: 'bethenny-frankel', name: 'Bethenny Frankel', slug: 'bethenny-frankel',
    franchises: ['rhony'], primaryFranchise: 'rhony',
    status: 'legend', debutYear: 2008, lastSeasonYear: 2021, seasonsCount: 8,
    fantasyValue: 1000, tier: 'legendary',
    tagline: 'The Skinnygirl',
    careerHighlights: ['Built Skinnygirl into $100M brand', 'Spinoff success: Bethenny Ever After', 'Said "I\'m not your friend, I\'m not your girlfriend"', 'RHONY revival refusal'],
  },
  {
    id: 'ramona-singer', name: 'Ramona Singer', slug: 'ramona-singer',
    franchises: ['rhony'], primaryFranchise: 'rhony',
    status: 'current', debutYear: 2008, seasonsCount: 14,
    fantasyValue: 900, tier: 'legendary',
    tagline: 'Turtle Time',
    careerHighlights: ['Longest-running New York Housewife', 'Pinot Grigio incarnate', 'Iconic turtle time declaration', 'Renewal ceremon walk-out'],
  },
  {
    id: 'luann-de-lesseps', name: 'Luann de Lesseps', slug: 'luann-de-lesseps',
    franchises: ['rhony'], primaryFranchise: 'rhony',
    status: 'current', debutYear: 2008, seasonsCount: 13,
    fantasyValue: 850, tier: 'legendary',
    tagline: 'Countess',
    careerHighlights: ['"Money Can\'t Buy You Class" — the song', 'Cabaret tour', 'The pool fall heard \'round the world', 'Count downgrade saga'],
  },
  {
    id: 'sonja-morgan', name: 'Sonja Morgan', slug: 'sonja-morgan',
    franchises: ['rhony'], primaryFranchise: 'rhony',
    status: 'current', debutYear: 2010, seasonsCount: 12,
    fantasyValue: 750, tier: 'elite',
    tagline: 'The Socialite',
    careerHighlights: ['Toaster oven empire', 'Morgan letter debacle', 'Tipsy Girl lawsuit', 'Season 13 transformation arc'],
  },
  {
    id: 'dorinda-medley', name: 'Dorinda Medley', slug: 'dorinda-medley',
    franchises: ['rhony'], primaryFranchise: 'rhony',
    status: 'former', debutYear: 2015, lastSeasonYear: 2021, seasonsCount: 6,
    fantasyValue: 800, tier: 'elite',
    tagline: 'I Made It Nice',
    careerHighlights: ['"I made it nice" — the phrase of the universe', 'Bluestone Manor host', 'John Mahdessian arc', 'Season 12 undoing'],
  },
  {
    id: 'jill-zarin', name: 'Jill Zarin', slug: 'jill-zarin',
    franchises: ['rhony'], primaryFranchise: 'rhony',
    status: 'legend', debutYear: 2008, lastSeasonYear: 2012, seasonsCount: 4,
    fantasyValue: 700, tier: 'elite',
    tagline: 'Zarin Fabrics',
    careerHighlights: ['Season 4 villain arc — defining TV moment', 'Bobby forever', 'Ginger the dog supremacy'],
  },
  // ── ATLANTA ───────────────────────────────────────────────────────────────
  {
    id: 'nene-leakes', name: 'NeNe Leakes', slug: 'nene-leakes',
    franchises: ['rhoa'], primaryFranchise: 'rhoa',
    status: 'legend', debutYear: 2008, lastSeasonYear: 2021, seasonsCount: 10,
    fantasyValue: 1000, tier: 'legendary',
    tagline: 'The Tastiest Peach',
    careerHighlights: ['The original RHOA icon', 'Broadway: The Wizard of Oz, Cinderella', 'Glee arc', '"Bloop" — the greatest read in Housewives history', 'Most followed RHOA Housewife of all time'],
  },
  {
    id: 'kandi-burruss', name: 'Kandi Burruss', slug: 'kandi-burruss',
    franchises: ['rhoa'], primaryFranchise: 'rhoa',
    status: 'current', debutYear: 2009, seasonsCount: 14,
    fantasyValue: 850, tier: 'legendary',
    tagline: 'The Xscape OG',
    careerHighlights: ['Grammy winner before Housewives', 'Old Lady Gang restaurant empire', 'Kandi Koated Nights', 'Todd Tucker romance arc — fan favorite'],
  },
  {
    id: 'kenya-moore', name: 'Kenya Moore', slug: 'kenya-moore',
    franchises: ['rhoa'], primaryFranchise: 'rhoa',
    status: 'current', debutYear: 2012, seasonsCount: 11,
    fantasyValue: 900, tier: 'legendary',
    tagline: 'Gone With the Wind Fabulous',
    careerHighlights: ['"Gone with the wind fabulous" declaration', 'Twirl moment — the gif', 'Miss USA 1993', 'Moore Manor construction saga', 'Marc Daly divorce arc'],
  },
  {
    id: 'phaedra-parks', name: 'Phaedra Parks', slug: 'phaedra-parks',
    franchises: ['rhoa'], primaryFranchise: 'rhoa',
    status: 'former', debutYear: 2010, lastSeasonYear: 2017, seasonsCount: 7,
    fantasyValue: 800, tier: 'elite',
    tagline: 'The Southern Belle Esquire',
    careerHighlights: ['Apollo Nida prison arc', 'Season 9 villain edit — iconic', 'Donkey Booty workout', '"Bye Ashy"'],
  },
  {
    id: 'porsha-williams', name: 'Porsha Williams', slug: 'porsha-williams',
    franchises: ['rhoa'], primaryFranchise: 'rhoa',
    status: 'former', debutYear: 2012, lastSeasonYear: 2022, seasonsCount: 10,
    fantasyValue: 750, tier: 'elite',
    tagline: 'Dish Nation Diva',
    careerHighlights: ['Underground Railroad confusion — the moment', 'Kordell Stewart divorce arc', 'Spinoff: Porsha\'s Family Matters', 'Civil rights activism recognition'],
  },
  {
    id: 'kim-zolciak', name: 'Kim Zolciak-Biermann', slug: 'kim-zolciak',
    franchises: ['rhoa'], primaryFranchise: 'rhoa',
    status: 'legend', debutYear: 2008, lastSeasonYear: 2022, seasonsCount: 8,
    fantasyValue: 750, tier: 'elite',
    tagline: 'Don\'t Be Tardy',
    careerHighlights: ['"Tardy for the Party" — the song', 'Big Poppa mystery', 'Wigs — an era', 'Don\'t Be Tardy spinoff franchise'],
  },
  {
    id: 'sheree-whitfield', name: 'Sheree Whitfield', slug: 'sheree-whitfield',
    franchises: ['rhoa'], primaryFranchise: 'rhoa',
    status: 'former', debutYear: 2008, lastSeasonYear: 2022, seasonsCount: 8,
    fantasyValue: 650, tier: 'premium',
    tagline: 'Who Gon\' Check Me, Boo',
    careerHighlights: ['Chateau Sheree construction — 14 years', '"Who gon\' check me, boo?" — immortal', 'Bob Whitfield alimony saga'],
  },
  // ── NEW JERSEY ────────────────────────────────────────────────────────────
  {
    id: 'teresa-giudice', name: 'Teresa Giudice', slug: 'teresa-giudice',
    franchises: ['rhonj'], primaryFranchise: 'rhonj',
    status: 'current', debutYear: 2009, seasonsCount: 14,
    fantasyValue: 1000, tier: 'legendary',
    tagline: 'Table Flip Queen',
    careerHighlights: ['THE table flip — most iconic Housewives moment ever', 'Bankruptcy + prison arc — most-watched RHONJ season', 'Cookbooks empire', 'Joe Giudice deportation arc', 'Louie Ruelas marriage'],
  },
  {
    id: 'melissa-gorga', name: 'Melissa Gorga', slug: 'melissa-gorga',
    franchises: ['rhonj'], primaryFranchise: 'rhonj',
    status: 'current', debutYear: 2011, seasonsCount: 13,
    fantasyValue: 700, tier: 'elite',
    tagline: 'On Display',
    careerHighlights: ['"On Display" — the single', 'Envy boutique', 'Joe vs Teresa sibling rivalry — 13 seasons running', 'Built-in show drama machine'],
  },
  {
    id: 'caroline-manzo', name: 'Caroline Manzo', slug: 'caroline-manzo',
    franchises: ['rhonj'], primaryFranchise: 'rhonj',
    status: 'legend', debutYear: 2009, lastSeasonYear: 2014, seasonsCount: 5,
    fantasyValue: 800, tier: 'elite',
    tagline: 'The Godmother',
    careerHighlights: ['"Let me tell you something about my family" — the speech', 'Manzo\'d With Children spinoff', 'Season 5 Teresa betrayal arc — peak drama'],
  },
  {
    id: 'danielle-staub', name: 'Danielle Staub', slug: 'danielle-staub',
    franchises: ['rhonj'], primaryFranchise: 'rhonj',
    status: 'former', debutYear: 2009, lastSeasonYear: 2019, seasonsCount: 4,
    fantasyValue: 700, tier: 'elite',
    tagline: 'Prostitution Whore',
    careerHighlights: ['Table-side screaming match — season 1 finale', 'Brownstone brawl', '"Prostitution whore" — heard \'round the world', '19 engagements claim'],
  },
  {
    id: 'margaret-josephs', name: 'Margaret Josephs', slug: 'margaret-josephs',
    franchises: ['rhonj'], primaryFranchise: 'rhonj',
    status: 'current', debutYear: 2017, seasonsCount: 7,
    fantasyValue: 650, tier: 'premium',
    tagline: 'The Pigtail Mogul',
    careerHighlights: ['Macbeth Collection founder', 'Joe Benigno affair revelation arc', 'Teresa feud legacy', 'Pigtails — a whole thing'],
  },
  // ── BEVERLY HILLS ─────────────────────────────────────────────────────────
  {
    id: 'lisa-vanderpump', name: 'Lisa Vanderpump', slug: 'lisa-vanderpump',
    franchises: ['rhobh'], primaryFranchise: 'rhobh',
    status: 'legend', debutYear: 2010, lastSeasonYear: 2019, seasonsCount: 9,
    fantasyValue: 1000, tier: 'legendary',
    tagline: 'Vanderpump Rules',
    careerHighlights: ['Built Vanderpump Rules empire — an entirely separate franchise', 'SUR + TomTom + Villa Blanca restaurant dynasty', 'Season 9 exit — the most-discussed RHOBH departure', 'Giggy the Pom — icon', 'Vanderpump Dogs foundation'],
  },
  {
    id: 'kyle-richards', name: 'Kyle Richards', slug: 'kyle-richards',
    franchises: ['rhobh'], primaryFranchise: 'rhobh',
    status: 'current', debutYear: 2010, seasonsCount: 14,
    fantasyValue: 850, tier: 'legendary',
    tagline: 'The OG of BH',
    careerHighlights: ['Halloween franchise child actor legacy', 'Kim Richards sobriety arc — most emotional BH storyline', 'Mauricio separation arc', 'Kyle and Mauricio — America\'s couple crumbling in real time'],
  },
  {
    id: 'erika-jayne', name: 'Erika Jayne', slug: 'erika-jayne',
    franchises: ['rhobh'], primaryFranchise: 'rhobh',
    status: 'current', debutYear: 2015, seasonsCount: 9,
    fantasyValue: 750, tier: 'elite',
    tagline: 'XXPEN$IVE',
    careerHighlights: ['Tom Girardi fraud investigation — biggest legal storyline in Housewives history', '"Pretty Mess" — the book', 'XXPEN$IVE era', 'Season 11 divorce announcement'],
  },
  {
    id: 'lisa-rinna', name: 'Lisa Rinna', slug: 'lisa-rinna',
    franchises: ['rhobh'], primaryFranchise: 'rhobh',
    status: 'former', debutYear: 2014, lastSeasonYear: 2022, seasonsCount: 8,
    fantasyValue: 700, tier: 'elite',
    tagline: 'The Lips',
    careerHighlights: ['Rinna Beauty empire', 'Kathy Hilton limo scene — the most-discussed BH moment of the decade', 'Days of Our Lives legacy', '"Own it" — her philosophy'],
  },
  {
    id: 'camille-grammer', name: 'Camille Grammer', slug: 'camille-grammer',
    franchises: ['rhobh'], primaryFranchise: 'rhobh',
    status: 'legend', debutYear: 2010, lastSeasonYear: 2020, seasonsCount: 5,
    fantasyValue: 650, tier: 'premium',
    tagline: 'Divorce Season',
    careerHighlights: ['Season 1 villain-to-hero redemption arc', 'Kelsey Grammer divorce — cultural moment', 'Hawaii trip group dinner — RHOBH greatest scene'],
  },
  // ── MIAMI ─────────────────────────────────────────────────────────────────
  {
    id: 'adriana-de-moura', name: 'Adriana de Moura', slug: 'adriana-de-moura',
    franchises: ['rhom'], primaryFranchise: 'rhom',
    status: 'current', debutYear: 2011, seasonsCount: 7,
    fantasyValue: 700, tier: 'elite',
    tagline: 'The Brazilian Beauty',
    careerHighlights: ['Secret marriage revelation', 'Frederic de Moura romance arc', 'Art world expertise', 'Most iconic Miami confrontations'],
  },
  {
    id: 'larsa-pippen', name: 'Larsa Pippen', slug: 'larsa-pippen',
    franchises: ['rhom'], primaryFranchise: 'rhom',
    status: 'former', debutYear: 2011, lastSeasonYear: 2012, seasonsCount: 2,
    fantasyValue: 600, tier: 'premium',
    tagline: 'The Pippen',
    careerHighlights: ['Scottie Pippen divorce saga', 'Kim Kardashian public friendship fallout', 'Marcus Jordan romance — cultural lightning rod'],
  },
  {
    id: 'lisa-hochstein', name: 'Lisa Hochstein', slug: 'lisa-hochstein',
    franchises: ['rhom'], primaryFranchise: 'rhom',
    status: 'current', debutYear: 2012, seasonsCount: 5,
    fantasyValue: 600, tier: 'premium',
    tagline: 'The Boob Godfather\'s Wife',
    careerHighlights: ['Lenny Hochstein divorce drama', 'Katharina Mazepa confrontation — season 7 peak', 'Miami\'s glam queen'],
  },
  {
    id: 'alexia-echevarria', name: 'Alexia Echevarria', slug: 'alexia-echevarria',
    franchises: ['rhom'], primaryFranchise: 'rhom',
    status: 'current', debutYear: 2011, seasonsCount: 6,
    fantasyValue: 650, tier: 'premium',
    tagline: 'The Cuban Queen',
    careerHighlights: ['Peter Rosello tragedy storyline — most emotional Miami arc', 'Vanity Fair magazine career', 'Herman Echevarria passing arc'],
  },
  // ── POTOMAC ───────────────────────────────────────────────────────────────
  {
    id: 'gizelle-bryant', name: 'Gizelle Bryant', slug: 'gizelle-bryant',
    franchises: ['rhop'], primaryFranchise: 'rhop',
    status: 'current', debutYear: 2016, seasonsCount: 9,
    fantasyValue: 800, tier: 'elite',
    tagline: 'The Potomac Pillar',
    careerHighlights: ['Jamal Bryant on-again-off-again arc — multi-season', 'EveryHue Beauty founder', 'Candiace confrontation season 5 — RHOP greatest fight'],
  },
  {
    id: 'karen-huger', name: 'Karen Huger', slug: 'karen-huger',
    franchises: ['rhop'], primaryFranchise: 'rhop',
    status: 'current', debutYear: 2016, seasonsCount: 9,
    fantasyValue: 750, tier: 'elite',
    tagline: 'The Grand Dame',
    careerHighlights: ['Grand Dame title — self-appointed, universally accepted', 'Ray Huger tax issues arc', 'La Dame fragrance', '"I am Karen Huger" energy'],
  },
  {
    id: 'candiace-dillard', name: 'Candiace Dillard Bassett', slug: 'candiace-dillard',
    franchises: ['rhop'], primaryFranchise: 'rhop',
    status: 'former', debutYear: 2018, lastSeasonYear: 2023, seasonsCount: 6,
    fantasyValue: 700, tier: 'elite',
    tagline: 'Miss United States',
    careerHighlights: ['Miss United States 2013', '"Drive your girl crazy" music career', 'Monique Samuels physical altercation — most-discussed RHOP moment', 'Mia Thornton confrontation arc'],
  },
  // ── SALT LAKE CITY ────────────────────────────────────────────────────────
  {
    id: 'jen-shah', name: 'Jen Shah', slug: 'jen-shah',
    franchises: ['rhoslc'], primaryFranchise: 'rhoslc',
    status: 'former', debutYear: 2020, lastSeasonYear: 2023, seasonsCount: 3,
    fantasyValue: 900, tier: 'legendary',
    tagline: 'Shah Beauty',
    careerHighlights: ['Live on-camera arrest — most dramatic Housewives moment ever filmed', 'Federal fraud conviction and sentencing', 'Shah Beauty brand', '"Ching chong" controversy — defining cultural moment', 'Prison arc — spinoff territory'],
  },
  {
    id: 'heather-gay', name: 'Heather Gay', slug: 'heather-gay',
    franchises: ['rhoslc'], primaryFranchise: 'rhoslc',
    status: 'current', debutYear: 2020, seasonsCount: 5,
    fantasyValue: 700, tier: 'elite',
    tagline: 'Bad Mormon',
    careerHighlights: ['Bad Mormon memoir — NYT bestseller', 'Mormon faith exploration arc — multi-season', 'Mysterious black eye season 3 — still unresolved', 'Beauty Lab + Laser empire'],
  },
  {
    id: 'lisa-barlow', name: 'Lisa Barlow', slug: 'lisa-barlow',
    franchises: ['rhoslc'], primaryFranchise: 'rhoslc',
    status: 'current', debutYear: 2021, seasonsCount: 4,
    fantasyValue: 650, tier: 'premium',
    tagline: 'FRESH WOLF',
    careerHighlights: ['FRESH WOLF tequila brand', 'Hot mic Meredith rant — most-watched RHOSLC clip', 'John Barlow energy drinks empire'],
  },
  {
    id: 'meredith-marks', name: 'Meredith Marks', slug: 'meredith-marks',
    franchises: ['rhoslc'], primaryFranchise: 'rhoslc',
    status: 'current', debutYear: 2020, seasonsCount: 5,
    fantasyValue: 600, tier: 'premium',
    tagline: 'Meredith Marks Jewelry',
    careerHighlights: ['Fine jewelry designer — actual career success', 'Seth Marks separation arc', 'Jen Shah alliance then betrayal — full season arc'],
  },
  {
    id: 'whitney-rose', name: 'Whitney Rose', slug: 'whitney-rose',
    franchises: ['rhoslc'], primaryFranchise: 'rhoslc',
    status: 'current', debutYear: 2020, seasonsCount: 5,
    fantasyValue: 550, tier: 'premium',
    tagline: 'Iris + Beau',
    careerHighlights: ['Iris + Beau beauty brand', 'Steve Rose affair revelation arc', 'Cousin marriage storyline — defining SLC moment'],
  },
  // ── DUBAI ─────────────────────────────────────────────────────────────────
  {
    id: 'caroline-stanbury', name: 'Caroline Stanbury', slug: 'caroline-stanbury',
    franchises: ['rhoUAE'], primaryFranchise: 'rhoUAE',
    status: 'current', debutYear: 2022, seasonsCount: 2,
    fantasyValue: 650, tier: 'premium',
    tagline: 'Gift Library',
    careerHighlights: ['Gift Library founder', 'Ladies of London crossover fame', 'Sergio Carrallo marriage arc', 'Dubai social circle powerhouse'],
  },
  {
    id: 'lesa-milan', name: 'Lesa Milan', slug: 'lesa-milan',
    franchises: ['rhoUAE'], primaryFranchise: 'rhoUAE',
    status: 'current', debutYear: 2022, seasonsCount: 2,
    fantasyValue: 600, tier: 'premium',
    tagline: 'Mônot Founder',
    careerHighlights: ['Mônot fashion brand (worn by Beyoncé)', 'Marcus Imperato relationship arc', 'Dubai\'s most fabulous international import'],
  },
];

export const TIER_COLORS: Record<PlayerTier, string> = {
  legendary: '#d4af37',
  elite: '#b5426a',
  premium: '#a78bfa',
  standard: '#64748b',
  developing: '#334155',
};

export const TIER_LABELS: Record<PlayerTier, string> = {
  legendary: 'Legendary',
  elite: 'Elite',
  premium: 'Premium',
  standard: 'Standard',
  developing: 'Developing',
};
