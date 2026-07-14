export interface SeedTeam {
  name: string;
  code: string;
  group: string | null;
  flagUrl: string | null;
}

export const seedTeams: SeedTeam[] = [
  { name: "Mexico", code: "MEX", group: "A", flagUrl: null },
  { name: "Canada", code: "CAN", group: "A", flagUrl: null },
  { name: "USA", code: "USA", group: "A", flagUrl: null },
  { name: "Costa Rica", code: "CRC", group: "A", flagUrl: null },

  { name: "Brazil", code: "BRA", group: "B", flagUrl: null },
  { name: "Japan", code: "JPN", group: "B", flagUrl: null },
  { name: "Senegal", code: "SEN", group: "B", flagUrl: null },
  { name: "Tunisia", code: "TUN", group: "B", flagUrl: null },

  { name: "Argentina", code: "ARG", group: "C", flagUrl: null },
  { name: "Australia", code: "AUS", group: "C", flagUrl: null },
  { name: "Egypt", code: "EGY", group: "C", flagUrl: null },
  { name: "New Zealand", code: "NZL", group: "C", flagUrl: null },

  { name: "France", code: "FRA", group: "D", flagUrl: null },
  { name: "South Korea", code: "KOR", group: "D", flagUrl: null },
  { name: "Nigeria", code: "NGA", group: "D", flagUrl: null },
  { name: "Panama", code: "PAN", group: "D", flagUrl: null },

  { name: "England", code: "ENG", group: "E", flagUrl: null },
  { name: "Iran", code: "IRN", group: "E", flagUrl: null },
  { name: "Morocco", code: "MAR", group: "E", flagUrl: null },
  { name: "Paraguay", code: "PAR", group: "E", flagUrl: null },

  { name: "Spain", code: "ESP", group: "F", flagUrl: null },
  { name: "Croatia", code: "CRO", group: "F", flagUrl: null },
  { name: "Cameroon", code: "CMR", group: "F", flagUrl: null },
  { name: "Ecuador", code: "ECU", group: "F", flagUrl: null },

  { name: "Germany", code: "GER", group: "G", flagUrl: null },
  { name: "Saudi Arabia", code: "KSA", group: "G", flagUrl: null },
  { name: "South Africa", code: "RSA", group: "G", flagUrl: null },
  { name: "Uruguay", code: "URU", group: "G", flagUrl: null },

  { name: "Portugal", code: "POR", group: "H", flagUrl: null },
  { name: "Switzerland", code: "SUI", group: "H", flagUrl: null },
  { name: "Algeria", code: "ALG", group: "H", flagUrl: null },
  { name: "Chile", code: "CHI", group: "H", flagUrl: null },

  { name: "Netherlands", code: "NED", group: "I", flagUrl: null },
  { name: "Denmark", code: "DEN", group: "I", flagUrl: null },
  { name: "Ghana", code: "GHA", group: "I", flagUrl: null },
  { name: "Peru", code: "PER", group: "I", flagUrl: null },

  { name: "Belgium", code: "BEL", group: "J", flagUrl: null },
  { name: "Poland", code: "POL", group: "J", flagUrl: null },
  { name: "Iraq", code: "IRQ", group: "J", flagUrl: null },
  { name: "Honduras", code: "HON", group: "J", flagUrl: null },

  { name: "Italy", code: "ITA", group: "K", flagUrl: null },
  { name: "Serbia", code: "SRB", group: "K", flagUrl: null },
  { name: "Qatar", code: "QAT", group: "K", flagUrl: null },
  { name: "Colombia", code: "COL", group: "K", flagUrl: null },

  { name: "Turkey", code: "TUR", group: "L", flagUrl: null },
  { name: "Austria", code: "AUT", group: "L", flagUrl: null },
  { name: "Ukraine", code: "UKR", group: "L", flagUrl: null },
  { name: "UAE", code: "UAE", group: "L", flagUrl: null },

  { name: "TBD Home", code: "TBDH", group: null, flagUrl: null },
  { name: "TBD Away", code: "TBDA", group: null, flagUrl: null },
];
