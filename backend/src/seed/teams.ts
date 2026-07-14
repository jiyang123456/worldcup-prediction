export interface SeedTeam {
  name: string;
  code: string;
  group: string | null;
  flagUrl: string | null;
}

export const seedTeams: SeedTeam[] = [
  // Group A: Mexico 9, South Africa 3, South Korea 3, Czechia 3
  { name: "Mexico", code: "MEX", group: "A", flagUrl: "https://flagcdn.com/w80/mx.png" },
  { name: "South Africa", code: "RSA", group: "A", flagUrl: "https://flagcdn.com/w80/za.png" },
  { name: "South Korea", code: "KOR", group: "A", flagUrl: "https://flagcdn.com/w80/kr.png" },
  { name: "Czechia", code: "CZE", group: "A", flagUrl: "https://flagcdn.com/w80/cz.png" },

  // Group B: Switzerland 7, Canada 5, Bosnia-Herzegovina 4, Qatar 0
  { name: "Switzerland", code: "SUI", group: "B", flagUrl: "https://flagcdn.com/w80/ch.png" },
  { name: "Canada", code: "CAN", group: "B", flagUrl: "https://flagcdn.com/w80/ca.png" },
  { name: "Bosnia-Herzegovina", code: "BIH", group: "B", flagUrl: "https://flagcdn.com/w80/ba.png" },
  { name: "Qatar", code: "QAT", group: "B", flagUrl: "https://flagcdn.com/w80/qa.png" },

  // Group C: Brazil 7, Morocco 7, Scotland 3, Haiti 0
  { name: "Brazil", code: "BRA", group: "C", flagUrl: "https://flagcdn.com/w80/br.png" },
  { name: "Morocco", code: "MAR", group: "C", flagUrl: "https://flagcdn.com/w80/ma.png" },
  { name: "Scotland", code: "SCO", group: "C", flagUrl: "https://flagcdn.com/w80/gb-sct.png" },
  { name: "Haiti", code: "HAI", group: "C", flagUrl: "https://flagcdn.com/w80/ht.png" },

  // Group D: USA 6, Australia 4, Paraguay 3, Turkiye 2
  { name: "United States", code: "USA", group: "D", flagUrl: "https://flagcdn.com/w80/us.png" },
  { name: "Australia", code: "AUS", group: "D", flagUrl: "https://flagcdn.com/w80/au.png" },
  { name: "Paraguay", code: "PAR", group: "D", flagUrl: "https://flagcdn.com/w80/py.png" },
  { name: "Turkiye", code: "TUR", group: "D", flagUrl: "https://flagcdn.com/w80/tr.png" },

  // Group E: Germany 6, Ivory Coast 3, Ecuador 3, Curacao 0
  { name: "Germany", code: "GER", group: "E", flagUrl: "https://flagcdn.com/w80/de.png" },
  { name: "Ivory Coast", code: "CIV", group: "E", flagUrl: "https://flagcdn.com/w80/ci.png" },
  { name: "Ecuador", code: "ECU", group: "E", flagUrl: "https://flagcdn.com/w80/ec.png" },
  { name: "Curacao", code: "CUW", group: "E", flagUrl: "https://flagcdn.com/w80/cw.png" },

  // Group F: Netherlands 7, Japan 4, Sweden 4, Tunisia 1
  { name: "Netherlands", code: "NED", group: "F", flagUrl: "https://flagcdn.com/w80/nl.png" },
  { name: "Japan", code: "JPN", group: "F", flagUrl: "https://flagcdn.com/w80/jp.png" },
  { name: "Sweden", code: "SWE", group: "F", flagUrl: "https://flagcdn.com/w80/se.png" },
  { name: "Tunisia", code: "TUN", group: "F", flagUrl: "https://flagcdn.com/w80/tn.png" },

  // Group G: Belgium 5, Egypt 5, Iran 3, New Zealand 2
  { name: "Belgium", code: "BEL", group: "G", flagUrl: "https://flagcdn.com/w80/be.png" },
  { name: "Egypt", code: "EGY", group: "G", flagUrl: "https://flagcdn.com/w80/eg.png" },
  { name: "Iran", code: "IRN", group: "G", flagUrl: "https://flagcdn.com/w80/ir.png" },
  { name: "New Zealand", code: "NZL", group: "G", flagUrl: "https://flagcdn.com/w80/nz.png" },

  // Group H: Spain 9, Cape Verde 3, Uruguay 2, Saudi Arabia 4
  { name: "Spain", code: "ESP", group: "H", flagUrl: "https://flagcdn.com/w80/es.png" },
  { name: "Cape Verde", code: "CPV", group: "H", flagUrl: "https://flagcdn.com/w80/cv.png" },
  { name: "Saudi Arabia", code: "KSA", group: "H", flagUrl: "https://flagcdn.com/w80/sa.png" },
  { name: "Uruguay", code: "URU", group: "H", flagUrl: "https://flagcdn.com/w80/uy.png" },

  // Group I: France 9, Norway 6, Senegal 3, Iraq 0
  { name: "France", code: "FRA", group: "I", flagUrl: "https://flagcdn.com/w80/fr.png" },
  { name: "Norway", code: "NOR", group: "I", flagUrl: "https://flagcdn.com/w80/no.png" },
  { name: "Senegal", code: "SEN", group: "I", flagUrl: "https://flagcdn.com/w80/sn.png" },
  { name: "Iraq", code: "IRQ", group: "I", flagUrl: "https://flagcdn.com/w80/iq.png" },

  // Group J: Argentina 9, Austria 6, Algeria 3, Jordan 0
  { name: "Argentina", code: "ARG", group: "J", flagUrl: "https://flagcdn.com/w80/ar.png" },
  { name: "Austria", code: "AUT", group: "J", flagUrl: "https://flagcdn.com/w80/at.png" },
  { name: "Algeria", code: "ALG", group: "J", flagUrl: "https://flagcdn.com/w80/dz.png" },
  { name: "Jordan", code: "JOR", group: "J", flagUrl: "https://flagcdn.com/w80/jo.png" },

  // Group K: Colombia 7, Portugal 5, Congo DR 4, Uzbekistan 0
  { name: "Colombia", code: "COL", group: "K", flagUrl: "https://flagcdn.com/w80/co.png" },
  { name: "Portugal", code: "POR", group: "K", flagUrl: "https://flagcdn.com/w80/pt.png" },
  { name: "Congo DR", code: "COD", group: "K", flagUrl: "https://flagcdn.com/w80/cd.png" },
  { name: "Uzbekistan", code: "UZB", group: "K", flagUrl: "https://flagcdn.com/w80/uz.png" },

  // Group L: England 7, Croatia 5, Ghana 4, Panama 0
  { name: "England", code: "ENG", group: "L", flagUrl: "https://flagcdn.com/w80/gb-eng.png" },
  { name: "Croatia", code: "CRO", group: "L", flagUrl: "https://flagcdn.com/w80/hr.png" },
  { name: "Ghana", code: "GHA", group: "L", flagUrl: "https://flagcdn.com/w80/gh.png" },
  { name: "Panama", code: "PAN", group: "L", flagUrl: "https://flagcdn.com/w80/pa.png" },
];
