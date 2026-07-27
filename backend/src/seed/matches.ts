export interface SeedMatch {
  homeCode: string;
  awayCode: string;
  stage: "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";
  group: string | null;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "scheduled" | "finished";
}

export const seedMatches: SeedMatch[] = [
  // ============================================================
  // GROUP STAGE - 72 matches (12 groups x 6 matches each)
  // ============================================================

  // Group A
  { homeCode: "MEX", awayCode: "RSA", stage: "group", group: "A", kickoffTime: "2026-06-11T18:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "KOR", awayCode: "CZE", stage: "group", group: "A", kickoffTime: "2026-06-11T21:00:00Z", homeScore: 1, awayScore: 2, status: "finished" },
  { homeCode: "MEX", awayCode: "KOR", stage: "group", group: "A", kickoffTime: "2026-06-16T18:00:00Z", homeScore: 3, awayScore: 1, status: "finished" },
  { homeCode: "CZE", awayCode: "RSA", stage: "group", group: "A", kickoffTime: "2026-06-16T21:00:00Z", homeScore: 0, awayScore: 1, status: "finished" },
  { homeCode: "RSA", awayCode: "KOR", stage: "group", group: "A", kickoffTime: "2026-06-22T15:00:00Z", homeScore: 1, awayScore: 2, status: "finished" },
  { homeCode: "CZE", awayCode: "MEX", stage: "group", group: "A", kickoffTime: "2026-06-22T15:00:00Z", homeScore: 1, awayScore: 4, status: "finished" },

  // Group B
  { homeCode: "SUI", awayCode: "CAN", stage: "group", group: "B", kickoffTime: "2026-06-12T18:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "BIH", awayCode: "QAT", stage: "group", group: "B", kickoffTime: "2026-06-12T21:00:00Z", homeScore: 3, awayScore: 0, status: "finished" },
  { homeCode: "SUI", awayCode: "BIH", stage: "group", group: "B", kickoffTime: "2026-06-17T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "QAT", awayCode: "CAN", stage: "group", group: "B", kickoffTime: "2026-06-17T21:00:00Z", homeScore: 0, awayScore: 2, status: "finished" },
  { homeCode: "CAN", awayCode: "BIH", stage: "group", group: "B", kickoffTime: "2026-06-23T15:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "QAT", awayCode: "SUI", stage: "group", group: "B", kickoffTime: "2026-06-23T15:00:00Z", homeScore: 0, awayScore: 4, status: "finished" },

  // Group C
  { homeCode: "BRA", awayCode: "MAR", stage: "group", group: "C", kickoffTime: "2026-06-12T15:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "SCO", awayCode: "HAI", stage: "group", group: "C", kickoffTime: "2026-06-12T18:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "BRA", awayCode: "SCO", stage: "group", group: "C", kickoffTime: "2026-06-17T15:00:00Z", homeScore: 3, awayScore: 0, status: "finished" },
  { homeCode: "HAI", awayCode: "MAR", stage: "group", group: "C", kickoffTime: "2026-06-17T18:00:00Z", homeScore: 0, awayScore: 4, status: "finished" },
  { homeCode: "MAR", awayCode: "SCO", stage: "group", group: "C", kickoffTime: "2026-06-23T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "HAI", awayCode: "BRA", stage: "group", group: "C", kickoffTime: "2026-06-23T18:00:00Z", homeScore: 0, awayScore: 3, status: "finished" },

  // Group D
  { homeCode: "USA", awayCode: "AUS", stage: "group", group: "D", kickoffTime: "2026-06-13T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "PAR", awayCode: "TUR", stage: "group", group: "D", kickoffTime: "2026-06-13T21:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "USA", awayCode: "PAR", stage: "group", group: "D", kickoffTime: "2026-06-18T18:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "TUR", awayCode: "AUS", stage: "group", group: "D", kickoffTime: "2026-06-18T21:00:00Z", homeScore: 0, awayScore: 2, status: "finished" },
  { homeCode: "AUS", awayCode: "PAR", stage: "group", group: "D", kickoffTime: "2026-06-24T15:00:00Z", homeScore: 0, awayScore: 0, status: "finished" },
  { homeCode: "TUR", awayCode: "USA", stage: "group", group: "D", kickoffTime: "2026-06-24T15:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },

  // Group E
  { homeCode: "GER", awayCode: "CIV", stage: "group", group: "E", kickoffTime: "2026-06-14T15:00:00Z", homeScore: 3, awayScore: 1, status: "finished" },
  { homeCode: "ECU", awayCode: "CUW", stage: "group", group: "E", kickoffTime: "2026-06-14T18:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "GER", awayCode: "ECU", stage: "group", group: "E", kickoffTime: "2026-06-19T15:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "CUW", awayCode: "CIV", stage: "group", group: "E", kickoffTime: "2026-06-19T18:00:00Z", homeScore: 0, awayScore: 3, status: "finished" },
  { homeCode: "CIV", awayCode: "ECU", stage: "group", group: "E", kickoffTime: "2026-06-24T18:00:00Z", homeScore: 1, awayScore: 2, status: "finished" },
  { homeCode: "CUW", awayCode: "GER", stage: "group", group: "E", kickoffTime: "2026-06-24T18:00:00Z", homeScore: 0, awayScore: 5, status: "finished" },

  // Group F
  { homeCode: "NED", awayCode: "JPN", stage: "group", group: "F", kickoffTime: "2026-06-14T21:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "SWE", awayCode: "TUN", stage: "group", group: "F", kickoffTime: "2026-06-15T00:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "NED", awayCode: "SWE", stage: "group", group: "F", kickoffTime: "2026-06-19T21:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "TUN", awayCode: "JPN", stage: "group", group: "F", kickoffTime: "2026-06-20T00:00:00Z", homeScore: 0, awayScore: 2, status: "finished" },
  { homeCode: "JPN", awayCode: "SWE", stage: "group", group: "F", kickoffTime: "2026-06-25T15:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "TUN", awayCode: "NED", stage: "group", group: "F", kickoffTime: "2026-06-25T15:00:00Z", homeScore: 0, awayScore: 1, status: "finished" },

  // Group G
  { homeCode: "BEL", awayCode: "EGY", stage: "group", group: "G", kickoffTime: "2026-06-15T18:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "IRN", awayCode: "NZL", stage: "group", group: "G", kickoffTime: "2026-06-15T21:00:00Z", homeScore: 2, awayScore: 2, status: "finished" },
  { homeCode: "BEL", awayCode: "IRN", stage: "group", group: "G", kickoffTime: "2026-06-20T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "NZL", awayCode: "EGY", stage: "group", group: "G", kickoffTime: "2026-06-20T21:00:00Z", homeScore: 0, awayScore: 1, status: "finished" },
  { homeCode: "EGY", awayCode: "IRN", stage: "group", group: "G", kickoffTime: "2026-06-25T18:00:00Z", homeScore: 1, awayScore: 0, status: "finished" },
  { homeCode: "NZL", awayCode: "BEL", stage: "group", group: "G", kickoffTime: "2026-06-25T18:00:00Z", homeScore: 0, awayScore: 2, status: "finished" },

  // Group H
  { homeCode: "ESP", awayCode: "CPV", stage: "group", group: "H", kickoffTime: "2026-06-16T15:00:00Z", homeScore: 4, awayScore: 0, status: "finished" },
  { homeCode: "KSA", awayCode: "URU", stage: "group", group: "H", kickoffTime: "2026-06-16T18:00:00Z", homeScore: 1, awayScore: 0, status: "finished" },
  { homeCode: "ESP", awayCode: "KSA", stage: "group", group: "H", kickoffTime: "2026-06-21T15:00:00Z", homeScore: 3, awayScore: 1, status: "finished" },
  { homeCode: "URU", awayCode: "CPV", stage: "group", group: "H", kickoffTime: "2026-06-21T18:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "CPV", awayCode: "KSA", stage: "group", group: "H", kickoffTime: "2026-06-26T18:00:00Z", homeScore: 1, awayScore: 2, status: "finished" },
  { homeCode: "URU", awayCode: "ESP", stage: "group", group: "H", kickoffTime: "2026-06-26T18:00:00Z", homeScore: 0, awayScore: 3, status: "finished" },

  // Group I
  { homeCode: "FRA", awayCode: "NOR", stage: "group", group: "I", kickoffTime: "2026-06-13T15:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "SEN", awayCode: "IRQ", stage: "group", group: "I", kickoffTime: "2026-06-13T18:00:00Z", homeScore: 3, awayScore: 0, status: "finished" },
  { homeCode: "FRA", awayCode: "SEN", stage: "group", group: "I", kickoffTime: "2026-06-18T15:00:00Z", homeScore: 3, awayScore: 0, status: "finished" },
  { homeCode: "IRQ", awayCode: "NOR", stage: "group", group: "I", kickoffTime: "2026-06-18T18:00:00Z", homeScore: 0, awayScore: 4, status: "finished" },
  { homeCode: "NOR", awayCode: "SEN", stage: "group", group: "I", kickoffTime: "2026-06-24T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "IRQ", awayCode: "FRA", stage: "group", group: "I", kickoffTime: "2026-06-24T18:00:00Z", homeScore: 0, awayScore: 5, status: "finished" },

  // Group J
  { homeCode: "ARG", awayCode: "AUT", stage: "group", group: "J", kickoffTime: "2026-06-14T15:00:00Z", homeScore: 3, awayScore: 1, status: "finished" },
  { homeCode: "ALG", awayCode: "JOR", stage: "group", group: "J", kickoffTime: "2026-06-14T18:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "ARG", awayCode: "ALG", stage: "group", group: "J", kickoffTime: "2026-06-19T15:00:00Z", homeScore: 1, awayScore: 0, status: "finished" },
  { homeCode: "JOR", awayCode: "AUT", stage: "group", group: "J", kickoffTime: "2026-06-19T18:00:00Z", homeScore: 0, awayScore: 3, status: "finished" },
  { homeCode: "AUT", awayCode: "ALG", stage: "group", group: "J", kickoffTime: "2026-06-25T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "JOR", awayCode: "ARG", stage: "group", group: "J", kickoffTime: "2026-06-25T18:00:00Z", homeScore: 0, awayScore: 4, status: "finished" },

  // Group K
  { homeCode: "COL", awayCode: "POR", stage: "group", group: "K", kickoffTime: "2026-06-15T15:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "COD", awayCode: "UZB", stage: "group", group: "K", kickoffTime: "2026-06-15T18:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "COL", awayCode: "COD", stage: "group", group: "K", kickoffTime: "2026-06-20T15:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  { homeCode: "UZB", awayCode: "POR", stage: "group", group: "K", kickoffTime: "2026-06-20T18:00:00Z", homeScore: 0, awayScore: 3, status: "finished" },
  { homeCode: "POR", awayCode: "COD", stage: "group", group: "K", kickoffTime: "2026-06-26T15:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "UZB", awayCode: "COL", stage: "group", group: "K", kickoffTime: "2026-06-26T15:00:00Z", homeScore: 0, awayScore: 2, status: "finished" },

  // Group L
  { homeCode: "ENG", awayCode: "CRO", stage: "group", group: "L", kickoffTime: "2026-06-16T18:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  { homeCode: "GHA", awayCode: "PAN", stage: "group", group: "L", kickoffTime: "2026-06-16T21:00:00Z", homeScore: 3, awayScore: 0, status: "finished" },
  { homeCode: "ENG", awayCode: "GHA", stage: "group", group: "L", kickoffTime: "2026-06-21T18:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  { homeCode: "PAN", awayCode: "CRO", stage: "group", group: "L", kickoffTime: "2026-06-21T21:00:00Z", homeScore: 0, awayScore: 4, status: "finished" },
  { homeCode: "CRO", awayCode: "GHA", stage: "group", group: "L", kickoffTime: "2026-06-26T18:00:00Z", homeScore: 0, awayScore: 0, status: "finished" },
  { homeCode: "PAN", awayCode: "ENG", stage: "group", group: "L", kickoffTime: "2026-06-26T18:00:00Z", homeScore: 0, awayScore: 2, status: "finished" },

  // ============================================================
  // ROUND OF 32 - 16 matches (all finished, real results from ESPN)
  // ============================================================

  // Match 73: Germany 1-1 Paraguay (Paraguay won 4-3 on pens)
  { homeCode: "GER", awayCode: "PAR", stage: "r32", group: null, kickoffTime: "2026-06-29T18:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  // Match 74: South Africa 0-1 Canada
  { homeCode: "RSA", awayCode: "CAN", stage: "r32", group: null, kickoffTime: "2026-06-29T21:00:00Z", homeScore: 0, awayScore: 1, status: "finished" },
  // Match 75: France 3-0 Sweden
  { homeCode: "FRA", awayCode: "SWE", stage: "r32", group: null, kickoffTime: "2026-06-30T15:00:00Z", homeScore: 3, awayScore: 0, status: "finished" },
  // Match 76: Netherlands 1-1 Morocco (Morocco won 3-2 on pens)
  { homeCode: "NED", awayCode: "MAR", stage: "r32", group: null, kickoffTime: "2026-06-30T18:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  // Match 77: Portugal 2-1 Croatia
  { homeCode: "POR", awayCode: "CRO", stage: "r32", group: null, kickoffTime: "2026-07-01T15:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  // Match 78: Spain 3-0 Austria
  { homeCode: "ESP", awayCode: "AUT", stage: "r32", group: null, kickoffTime: "2026-07-01T18:00:00Z", homeScore: 3, awayScore: 0, status: "finished" },
  // Match 79: USA 2-0 Bosnia-Herzegovina (AET)
  { homeCode: "USA", awayCode: "BIH", stage: "r32", group: null, kickoffTime: "2026-07-01T21:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  // Match 80: Belgium 3-2 Senegal
  { homeCode: "BEL", awayCode: "SEN", stage: "r32", group: null, kickoffTime: "2026-07-02T15:00:00Z", homeScore: 3, awayScore: 2, status: "finished" },
  // Match 81: Brazil 2-1 Japan
  { homeCode: "BRA", awayCode: "JPN", stage: "r32", group: null, kickoffTime: "2026-07-02T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  // Match 82: Ivory Coast 1-2 Norway
  { homeCode: "CIV", awayCode: "NOR", stage: "r32", group: null, kickoffTime: "2026-07-02T21:00:00Z", homeScore: 1, awayScore: 2, status: "finished" },
  // Match 83: Mexico 2-0 Ecuador
  { homeCode: "MEX", awayCode: "ECU", stage: "r32", group: null, kickoffTime: "2026-07-03T15:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  // Match 84: England 2-1 Congo DR (AET)
  { homeCode: "ENG", awayCode: "COD", stage: "r32", group: null, kickoffTime: "2026-07-03T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  // Match 85: Argentina 3-2 Cape Verde
  { homeCode: "ARG", awayCode: "CPV", stage: "r32", group: null, kickoffTime: "2026-07-04T15:00:00Z", homeScore: 3, awayScore: 2, status: "finished" },
  // Match 86: Australia 1-1 Egypt (Egypt won 4-2 on pens)
  { homeCode: "AUS", awayCode: "EGY", stage: "r32", group: null, kickoffTime: "2026-07-04T18:00:00Z", homeScore: 1, awayScore: 1, status: "finished" },
  // Match 87: Switzerland 2-0 Algeria
  { homeCode: "SUI", awayCode: "ALG", stage: "r32", group: null, kickoffTime: "2026-07-05T15:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  // Match 88: Colombia 1-0 Ghana
  { homeCode: "COL", awayCode: "GHA", stage: "r32", group: null, kickoffTime: "2026-07-05T18:00:00Z", homeScore: 1, awayScore: 0, status: "finished" },

  // ============================================================
  // ROUND OF 16 - 8 matches
  // ============================================================

  // Match 89: Paraguay 0-1 France
  { homeCode: "PAR", awayCode: "FRA", stage: "r16", group: null, kickoffTime: "2026-07-06T15:00:00Z", homeScore: 0, awayScore: 1, status: "finished" },
  // Match 90: Canada 0-3 Morocco
  { homeCode: "CAN", awayCode: "MAR", stage: "r16", group: null, kickoffTime: "2026-07-06T18:00:00Z", homeScore: 0, awayScore: 3, status: "finished" },
  // Match 91: Portugal 0-1 Spain
  { homeCode: "POR", awayCode: "ESP", stage: "r16", group: null, kickoffTime: "2026-07-06T21:00:00Z", homeScore: 0, awayScore: 1, status: "finished" },
  // Match 92: USA 1-4 Belgium
  { homeCode: "USA", awayCode: "BEL", stage: "r16", group: null, kickoffTime: "2026-07-07T15:00:00Z", homeScore: 1, awayScore: 4, status: "finished" },
  // Match 93: Brazil 1-2 Norway
  { homeCode: "BRA", awayCode: "NOR", stage: "r16", group: null, kickoffTime: "2026-07-07T18:00:00Z", homeScore: 1, awayScore: 2, status: "finished" },
  // Match 94: Mexico 2-3 England
  { homeCode: "MEX", awayCode: "ENG", stage: "r16", group: null, kickoffTime: "2026-07-07T21:00:00Z", homeScore: 2, awayScore: 3, status: "finished" },
  // Match 95: Argentina 3-2 Egypt
  { homeCode: "ARG", awayCode: "EGY", stage: "r16", group: null, kickoffTime: "2026-07-08T15:00:00Z", homeScore: 3, awayScore: 2, status: "finished" },
  // Match 96: Switzerland 0-0 Colombia (Switzerland won 4-3 on pens)
  { homeCode: "SUI", awayCode: "COL", stage: "r16", group: null, kickoffTime: "2026-07-08T18:00:00Z", homeScore: 0, awayScore: 0, status: "finished" },

  // ============================================================
  // QUARTERFINALS - 4 matches
  // ============================================================

  // Match 97: France 2-0 Morocco
  { homeCode: "FRA", awayCode: "MAR", stage: "qf", group: null, kickoffTime: "2026-07-10T15:00:00Z", homeScore: 2, awayScore: 0, status: "finished" },
  // Match 98: Spain 2-1 Belgium (AET)
  { homeCode: "ESP", awayCode: "BEL", stage: "qf", group: null, kickoffTime: "2026-07-10T18:00:00Z", homeScore: 2, awayScore: 1, status: "finished" },
  // Match 99: Norway 1-2 England (AET)
  { homeCode: "NOR", awayCode: "ENG", stage: "qf", group: null, kickoffTime: "2026-07-11T15:00:00Z", homeScore: 1, awayScore: 2, status: "finished" },
  // Match 100: Argentina 3-1 Switzerland
  { homeCode: "ARG", awayCode: "SUI", stage: "qf", group: null, kickoffTime: "2026-07-11T18:00:00Z", homeScore: 3, awayScore: 1, status: "finished" },

  // ============================================================
  // SEMIFINALS
  // ============================================================

  // Match 101: France 0-2 Spain
  { homeCode: "FRA", awayCode: "ESP", stage: "sf", group: null, kickoffTime: "2026-07-14T19:00:00Z", homeScore: 0, awayScore: 2, status: "finished" },
  // Match 102: England 1-2 Argentina
  { homeCode: "ENG", awayCode: "ARG", stage: "sf", group: null, kickoffTime: "2026-07-15T19:00:00Z", homeScore: 1, awayScore: 2, status: "finished" },

  // ============================================================
  // THIRD PLACE + FINAL
  // ============================================================

  // Match 103: Third Place - France 4-6 England
  { homeCode: "FRA", awayCode: "ENG", stage: "third", group: null, kickoffTime: "2026-07-18T21:00:00Z", homeScore: 4, awayScore: 6, status: "finished" },
  // Match 104: Final - Spain 1-0 Argentina (AET)
  { homeCode: "ESP", awayCode: "ARG", stage: "final", group: null, kickoffTime: "2026-07-19T19:00:00Z", homeScore: 1, awayScore: 0, status: "finished" },
];
