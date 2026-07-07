export interface Episode {
  number: number;
  title: string;
  airDate?: string;
  status: 'aired' | 'current' | 'upcoming';
}

export interface Season {
  season: number;
  year: number;
  episodes: number;
  status: 'aired' | 'current' | 'upcoming';
  storyline: string;
  notableEpisode?: string;
}

export interface FranchiseSeasons {
  franchiseId: string;
  currentSeason: number;
  seasons: Season[];
}

export const SEASONS: FranchiseSeasons[] = [
  {
    franchiseId: 'rhoc',
    currentSeason: 19,
    seasons: [
      { season: 1, year: 2006, episodes: 9, status: 'aired', storyline: 'The original. Vicki Gunvalson and Jeana Keough introduce Orange County.' },
      { season: 2, year: 2007, episodes: 13, status: 'aired', storyline: 'Lauri Peterson\'s dramatic life arc. The OC blueprint solidifies.' },
      { season: 3, year: 2008, episodes: 12, status: 'aired', storyline: 'Quinn and Gretchen join. The cast expands.' },
      { season: 4, year: 2009, episodes: 12, status: 'aired', storyline: 'Tamra Judge joins. The dynamic shifts forever.' },
      { season: 5, year: 2010, episodes: 15, status: 'aired', storyline: 'Alexis Bellino arrives. The Vicki-Tamra power axis forms.' },
      { season: 6, year: 2011, episodes: 17, status: 'aired', storyline: 'Cast drama escalates. Peggy Tanous joins briefly.' },
      { season: 7, year: 2012, episodes: 15, status: 'aired', storyline: 'The Brooks scandal begins. Gretchen and Tamra feud.' },
      { season: 8, year: 2013, episodes: 19, status: 'aired', storyline: 'Lydia McLaughlin joins. Vicki and Brooks relationship takes center stage.' },
      { season: 9, year: 2014, episodes: 21, status: 'aired', storyline: 'Heather Dubrow\'s mega-house. Shannon Beador\'s arrival changes everything.' },
      { season: 10, year: 2015, episodes: 20, status: 'aired', storyline: 'Shannon\'s marriage crisis. Vicki\'s Brooks cancer lie exposed.', notableEpisode: 'Reunion: Brooks lie confrontation' },
      { season: 11, year: 2016, episodes: 21, status: 'aired', storyline: 'Meghan King Edmonds vs. Jim. Kelly Dodd\'s explosive debut.' },
      { season: 12, year: 2017, episodes: 20, status: 'aired', storyline: 'Lydia returns. Vicki\'s pig mask scene.' },
      { season: 13, year: 2018, episodes: 21, status: 'aired', storyline: 'Tamra and Vicki vs. Shannon. Three-way feud all season.' },
      { season: 14, year: 2019, episodes: 17, status: 'aired', storyline: 'Braunwyn Windham-Burke debuts. Gina Kirschenheiter DUI arc.' },
      { season: 15, year: 2020, episodes: 15, status: 'aired', storyline: 'COVID season. Braunwyn sobriety arc. Emily\'s husband crisis.' },
      { season: 16, year: 2021, episodes: 15, status: 'aired', storyline: 'Noella Bergener joins. Vicki and Tamra depart.' },
      { season: 17, year: 2022, episodes: 13, status: 'aired', storyline: 'Jen Armstrong, Jessica Perez arrive. Nicole James controversies.' },
      { season: 18, year: 2023, episodes: 18, status: 'aired', storyline: 'Tamra and Vicki return. Katie Ginella and Jennifer Pedranti join.', notableEpisode: 'The reunion: Vicki and Shannon face-off' },
      { season: 19, year: 2025, episodes: 18, status: 'current', storyline: 'The 20th anniversary season. Full ensemble showdown.' },
    ],
  },
  {
    franchiseId: 'rhony',
    currentSeason: 15,
    seasons: [
      { season: 1, year: 2008, episodes: 9, status: 'aired', storyline: 'Bethenny, Ramona, LuAnn, Alex, and Jill introduce New York.' },
      { season: 2, year: 2009, episodes: 16, status: 'aired', storyline: 'The group dynamic crystallizes. Kelly Bensimon joins.' },
      { season: 3, year: 2010, episodes: 14, status: 'aired', storyline: 'St. John trip — Kelly\'s breakdown. Season TV history.' },
      { season: 4, year: 2011, episodes: 19, status: 'aired', storyline: 'Bethenny leaves. Jill vs. everyone. Cindy Barshop flops.', notableEpisode: 'Jill\'s Season 4 villain arc' },
      { season: 5, year: 2012, episodes: 19, status: 'aired', storyline: 'Aviva Drescher joins. Carole Radziwill debuts. Heather Thomson.' },
      { season: 6, year: 2013, episodes: 20, status: 'aired', storyline: 'Kristen Taekman. London trip. The Aviva prosthetic leg moment.' },
      { season: 7, year: 2015, episodes: 20, status: 'aired', storyline: 'Bethenny returns. Dorinda and Jules Wainstein join.', notableEpisode: 'Bethenny\'s emotional return' },
      { season: 8, year: 2016, episodes: 20, status: 'aired', storyline: 'Sonja\'s financial chaos. Jules Wainstein eating disorder arc.' },
      { season: 9, year: 2017, episodes: 19, status: 'aired', storyline: 'The Berkshires meltdown. Tinsley Mortimer joins.' },
      { season: 10, year: 2018, episodes: 21, status: 'aired', storyline: 'LuAnn\'s arrest and sobriety. Carole vs. Bethenny.', notableEpisode: 'Carole-Bethenny fallout' },
      { season: 11, year: 2019, episodes: 20, status: 'aired', storyline: 'LuAnn\'s cabaret era. Barbara Kavovit joins. Bethenny exits.' },
      { season: 12, year: 2020, episodes: 13, status: 'aired', storyline: 'Leah McSweeney debuts. COVID cut-short season.' },
      { season: 13, year: 2021, episodes: 13, status: 'aired', storyline: 'Eboni K. Williams joins — first Black cast member. Race conversations.' },
      { season: 14, year: 2022, episodes: 19, status: 'aired', storyline: 'Full reboot. New cast: Sai, Erin, Ubah, Jessel, Brynn.', notableEpisode: 'Jessel Takar\'s explosive debut' },
      { season: 15, year: 2024, episodes: 16, status: 'current', storyline: 'New era ensemble finds its footing. Jenna Lyons standout.' },
    ],
  },
  {
    franchiseId: 'rhoa',
    currentSeason: 16,
    seasons: [
      { season: 1, year: 2008, episodes: 9, status: 'aired', storyline: 'NeNe, Kim, Lisa Wu, DeShawn, and Sheree introduce Atlanta.' },
      { season: 2, year: 2009, episodes: 19, status: 'aired', storyline: 'Kandi Burruss joins after TLC\'s Lisa Lopes mention. Drama explodes.' },
      { season: 3, year: 2010, episodes: 21, status: 'aired', storyline: 'Cynthia Bailey and Phaedra Parks join. Apollo Nida introduced.' },
      { season: 4, year: 2011, episodes: 22, status: 'aired', storyline: 'NeNe\'s Hollywood pivot. Kim vs. everyone. The wedding arc.' },
      { season: 5, year: 2012, episodes: 24, status: 'aired', storyline: 'Kenya Moore arrives "Gone With the Wind Fabulous." Game changer.', notableEpisode: 'Kenya\'s twirl debut' },
      { season: 6, year: 2013, episodes: 24, status: 'aired', storyline: 'Apollo\'s legal troubles begin. Kenya vs. Phaedra war starts.' },
      { season: 7, year: 2014, episodes: 24, status: 'aired', storyline: 'NeNe back after hiatus. Claudia Jordan joins. Kim Fields era.' },
      { season: 8, year: 2015, episodes: 22, status: 'aired', storyline: 'NeNe exits. Kim Fields underperforms. Apollo goes to prison.' },
      { season: 9, year: 2016, episodes: 21, status: 'aired', storyline: 'Season 9 explosive finale. Phaedra/Porsha/Kenya triangle. Defining TV.', notableEpisode: 'Season 9 finale — Phaedra blindside' },
      { season: 10, year: 2017, episodes: 21, status: 'aired', storyline: 'Phaedra fired for lie. Eva Marcille and Sheree return.' },
      { season: 11, year: 2018, episodes: 20, status: 'aired', storyline: 'Cynthia vs. NeNe feud escalates. Yovanna planted spy drama.' },
      { season: 12, year: 2019, episodes: 21, status: 'aired', storyline: 'Cynthia and Mike Hill love story. NeNe vs. all.' },
      { season: 13, year: 2020, episodes: 16, status: 'aired', storyline: 'Porsha\'s activism spotlight. NeNe departs mid-season.' },
      { season: 14, year: 2021, episodes: 17, status: 'aired', storyline: 'Post-NeNe era. Sanya Richards-Ross and Marlo Hampton join.' },
      { season: 15, year: 2022, episodes: 17, status: 'aired', storyline: 'Shereé returns. Kenya vs. Marlo. Kandi business drama.' },
      { season: 16, year: 2024, episodes: 18, status: 'current', storyline: 'New additions shake the peach. Legacy cast vs. newcomers.' },
    ],
  },
  {
    franchiseId: 'rhonj',
    currentSeason: 14,
    seasons: [
      { season: 1, year: 2009, episodes: 10, status: 'aired', storyline: 'Teresa, Jacqueline, Dina, Caroline, and Danielle. The table flip.', notableEpisode: 'Season 1 finale table flip' },
      { season: 2, year: 2010, episodes: 14, status: 'aired', storyline: 'Danielle Staub\'s stalker drama. Brownstone brawl.' },
      { season: 3, year: 2011, episodes: 22, status: 'aired', storyline: 'Melissa and Joe Gorga join. Teresa\'s family war begins.' },
      { season: 4, year: 2012, episodes: 22, status: 'aired', storyline: 'Wakile cousins. The christening meltdown. Teresa vs. Melissa.', notableEpisode: 'Christening fight — iconic moment' },
      { season: 5, year: 2013, episodes: 22, status: 'aired', storyline: 'Teresa and Joe\'s legal drama surfaces. Caroline and Jacqueline exit.' },
      { season: 6, year: 2014, episodes: 18, status: 'aired', storyline: 'Teresa\'s federal indictment. Amber Marchese joins.' },
      { season: 7, year: 2015, episodes: 19, status: 'aired', storyline: 'Teresa in prison and returns. Amber, Nicole, Teresa A. join.' },
      { season: 8, year: 2017, episodes: 18, status: 'aired', storyline: 'Post-prison Teresa. Margaret Josephs joins. Jacqueline returns.' },
      { season: 9, year: 2018, episodes: 21, status: 'aired', storyline: 'Danielle Staub returns. Margaret vs. Danielle. Joe Giudice deportation.', notableEpisode: 'Danielle\'s hair pull' },
      { season: 10, year: 2019, episodes: 19, status: 'aired', storyline: 'Joe Giudice deported to Italy. Teresa navigates alone.' },
      { season: 11, year: 2020, episodes: 14, status: 'aired', storyline: 'Jackie Goldschneider joins. Teresa and Louie arc begins.' },
      { season: 12, year: 2021, episodes: 15, status: 'aired', storyline: 'Teresa and Louie Ruelas engagement. Evan Goldschneider rumors.' },
      { season: 13, year: 2022, episodes: 13, status: 'aired', storyline: 'Teresa\'s wedding. Gorga family rift reaches peak.', notableEpisode: 'Joe and Melissa skip Teresa\'s wedding' },
      { season: 14, year: 2024, episodes: 17, status: 'current', storyline: 'Post-Gorga era. Teresa vs. the table. New alliances form.' },
    ],
  },
  {
    franchiseId: 'rhobh',
    currentSeason: 14,
    seasons: [
      { season: 1, year: 2010, episodes: 14, status: 'aired', storyline: 'Lisa Vanderpump, Taylor Armstrong, Kyle, Kim Richards, Camille Grammer debut.' },
      { season: 2, year: 2011, episodes: 16, status: 'aired', storyline: 'Taylor Armstrong\'s abuse storyline. Russell\'s death. Most devastating BH arc.', notableEpisode: 'Russell Armstrong tragedy' },
      { season: 3, year: 2012, episodes: 22, status: 'aired', storyline: 'Brandi Glanville joins full-time. Lisa vs. Adrienne Maloof.' },
      { season: 4, year: 2013, episodes: 20, status: 'aired', storyline: 'Lisa Vanderpump\'s power play. Brandi escalates everything.' },
      { season: 5, year: 2014, episodes: 22, status: 'aired', storyline: 'Amsterdam meltdown. Kim\'s sobriety crisis. Brandi vs. Lisa.', notableEpisode: 'Amsterdam chair incident' },
      { season: 6, year: 2015, episodes: 18, status: 'aired', storyline: 'Kathryn Edwards and Eileen Davidson join. Kim Richards breakdown.' },
      { season: 7, year: 2016, episodes: 22, status: 'aired', storyline: 'PuppyGate origins. Dorit Kemsley debuts. Lisa Rinna vs. Kim.' },
      { season: 8, year: 2017, episodes: 17, status: 'aired', storyline: 'Teddi Mellencamp joins. Eden Sassoon short stint.' },
      { season: 9, year: 2018, episodes: 22, status: 'aired', storyline: 'PuppyGate. Lisa Vanderpump exits. Defining season.', notableEpisode: 'Lisa Vanderpump\'s Season 9 departure' },
      { season: 10, year: 2019, episodes: 22, status: 'aired', storyline: 'Denise Richards and Brandi Glanville affair allegation. Garcelle Beauvais joins.' },
      { season: 11, year: 2020, episodes: 20, status: 'aired', storyline: 'Erika Jayne\'s Tom Girardi fraud surfaces. Crystal Kung Minkoff joins.' },
      { season: 12, year: 2021, episodes: 18, status: 'aired', storyline: 'Kathy Hilton joins. Aspen limo meltdown. Erika Jayne legal drama peaks.', notableEpisode: 'Kathy Hilton Aspen meltdown' },
      { season: 13, year: 2022, episodes: 14, status: 'aired', storyline: 'Kyle-Mauricio separation begins. Lisa Rinna exits after this season.' },
      { season: 14, year: 2024, episodes: 18, status: 'current', storyline: 'Post-Rinna era. Bozoma Saint John, Dolores Catania guest. New dynamics.' },
    ],
  },
  {
    franchiseId: 'rhom',
    currentSeason: 7,
    seasons: [
      { season: 1, year: 2011, episodes: 12, status: 'aired', storyline: 'Adriana, Larsa, Lisa H., Lea Black, Cristy, Marysol debut Miami.' },
      { season: 2, year: 2012, episodes: 14, status: 'aired', storyline: 'Adriana\'s secret marriage revealed. Cast chaos.' },
      { season: 3, year: 2013, episodes: 14, status: 'aired', storyline: 'Season 3 finale fireworks. Show goes on hiatus.' },
      { season: 4, year: 2021, episodes: 10, status: 'aired', storyline: 'Peacock revival. Julia Lemigova, Dr. Nicole Martin join.' },
      { season: 5, year: 2022, episodes: 12, status: 'aired', storyline: 'Lenny Hochstein-Katharina drama begins. Guerdy cancer arc.' },
      { season: 6, year: 2023, episodes: 12, status: 'aired', storyline: 'Lenny Hochstein divorce explodes on screen. Adriana vs. Lisa H.' },
      { season: 7, year: 2024, episodes: 10, status: 'aired', storyline: 'Final season before hiatus. Miami\'s glam swan song.' },
    ],
  },
  {
    franchiseId: 'rhop',
    currentSeason: 9,
    seasons: [
      { season: 1, year: 2016, episodes: 15, status: 'aired', storyline: 'Gizelle, Karen, Ashley, Robyn, Charrisse introduce Potomac.' },
      { season: 2, year: 2017, episodes: 12, status: 'aired', storyline: 'Monique Samuels joins. The etiquette debate era.' },
      { season: 3, year: 2018, episodes: 13, status: 'aired', storyline: 'Candiace Dillard debuts. Ray Huger tax issues surface.' },
      { season: 4, year: 2019, episodes: 17, status: 'aired', storyline: 'Candiace vs. Ashley physical altercation. Karen vs. Gizelle.' },
      { season: 5, year: 2020, episodes: 18, status: 'aired', storyline: 'Monique vs. Candiace fight. Most-watched RHOP moment.', notableEpisode: 'Monique and Candiace physical altercation' },
      { season: 6, year: 2021, episodes: 18, status: 'aired', storyline: 'Monique exits. Mia Thornton and Dr. Wendy Osefo join.' },
      { season: 7, year: 2022, episodes: 18, status: 'aired', storyline: 'Robyn Dixon wedding. Karen Huger\'s DUI arrest.' },
      { season: 8, year: 2023, episodes: 17, status: 'aired', storyline: 'Karen\'s legal woes continue. New alliances shift.' },
      { season: 9, year: 2024, episodes: 16, status: 'current', storyline: 'Post-Candiace reset. New cast member additions.' },
    ],
  },
  {
    franchiseId: 'rhoslc',
    currentSeason: 5,
    seasons: [
      { season: 1, year: 2020, episodes: 11, status: 'aired', storyline: 'Heather, Meredith, Lisa, Whitney, Mary, Jen Shah introduce Salt Lake.' },
      { season: 2, year: 2021, episodes: 18, status: 'aired', storyline: 'Jen Shah\'s live on-camera arrest. Most dramatic Housewives moment filmed.', notableEpisode: 'Jen Shah\'s arrest filmed live' },
      { season: 3, year: 2022, episodes: 20, status: 'aired', storyline: 'Lisa\'s hot mic Meredith rant. Heather\'s mysterious black eye. Mary Cosby exits.' },
      { season: 4, year: 2023, episodes: 20, status: 'aired', storyline: 'Jen Shah sentenced to 6.5 years. Monica Garcia joins. Angie Katsanevas.' },
      { season: 5, year: 2024, episodes: 18, status: 'current', storyline: 'Jen Shah in prison. New cast navigates post-Shah RHOSLC.' },
    ],
  },
  {
    franchiseId: 'rhod',
    currentSeason: 5,
    seasons: [
      { season: 1, year: 2016, episodes: 12, status: 'aired', storyline: 'LeeAnne, Brandi, Stephanie, Cary, Marie debut Dallas.' },
      { season: 2, year: 2017, episodes: 13, status: 'aired', storyline: 'D\'Andra Simmons joins. LeeAnne vs. Brandi conflict intensifies.' },
      { season: 3, year: 2018, episodes: 13, status: 'aired', storyline: 'D\'Andra vs. LeeAnne. Rich Emberlin engagement.' },
      { season: 4, year: 2019, episodes: 15, status: 'aired', storyline: 'LeeAnne\'s controversial comments lead to firing. Kary Brittingham joins.' },
      { season: 5, year: 2021, episodes: 15, status: 'aired', storyline: 'Tiffany Moon joins as first Asian-American main RHD cast member. Final season.' },
    ],
  },
  {
    franchiseId: 'rhome',
    currentSeason: 4,
    seasons: [
      { season: 1, year: 2014, episodes: 14, status: 'aired', storyline: 'Gina Liano, Janet Roach, Lydia Schiavello, Andrea Moss, Chyka Keebaugh debut.' },
      { season: 2, year: 2015, episodes: 14, status: 'aired', storyline: 'Gamble Breaux joins. Pettifleur Berenger controversial arrival.' },
      { season: 3, year: 2016, episodes: 13, status: 'aired', storyline: 'Jackie Gillies returns. Susie McLean joins. Dramatic season finale.' },
      { season: 4, year: 2017, episodes: 14, status: 'aired', storyline: 'Final season. Melbourne goes out in style.' },
    ],
  },
  {
    franchiseId: 'rhoch',
    currentSeason: 12,
    seasons: [
      { season: 1, year: 2015, episodes: 10, status: 'aired', storyline: 'Dawn Ward, Leanne Brown, Lauren Simon, Ampika Pickston, Magali Gorre debut.' },
      { season: 2, year: 2016, episodes: 10, status: 'aired', storyline: 'Tanya Bardsley joins. Cheshire social scene expands.' },
      { season: 3, year: 2017, episodes: 10, status: 'aired', storyline: 'Seema Malhotra joins. The roster evolves.' },
      { season: 4, year: 2018, episodes: 10, status: 'aired', storyline: 'Hanna Miraftab joins. International flavors in Cheshire.' },
      { season: 5, year: 2019, episodes: 10, status: 'aired', storyline: 'Ester Dohnalova joins. Cast in full swing.' },
      { season: 6, year: 2020, episodes: 10, status: 'aired', storyline: 'COVID adjustments. Intimacy amid crisis.' },
      { season: 7, year: 2021, episodes: 10, status: 'aired', storyline: 'Rachel Lugo returns. Drama escalates.' },
      { season: 8, year: 2022, episodes: 10, status: 'aired', storyline: 'New additions shake Cheshire\'s social hierarchy.' },
      { season: 9, year: 2023, episodes: 10, status: 'aired', storyline: 'Dawn Ward\'s empire at its peak.' },
      { season: 10, year: 2024, episodes: 10, status: 'current', storyline: 'Decade of drama — Cheshire turns 10.' },
    ],
  },
];

export function getSeasonsForFranchise(franchiseId: string): FranchiseSeasons | undefined {
  return SEASONS.find(s => s.franchiseId === franchiseId);
}
