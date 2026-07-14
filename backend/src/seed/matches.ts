export interface SeedMatch {
  homeTeamCode: string;
  awayTeamCode: string;
  stage: "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";
  group: string | null;
  kickoffTime: string;
}

interface GroupTeams {
  group: string;
  teams: [string, string, string, string];
}

const groupTeams: GroupTeams[] = [
  { group: "A", teams: ["MEX", "CAN", "USA", "CRC"] },
  { group: "B", teams: ["BRA", "JPN", "SEN", "TUN"] },
  { group: "C", teams: ["ARG", "AUS", "EGY", "NZL"] },
  { group: "D", teams: ["FRA", "KOR", "NGA", "PAN"] },
  { group: "E", teams: ["ENG", "IRN", "MAR", "PAR"] },
  { group: "F", teams: ["ESP", "CRO", "CMR", "ECU"] },
  { group: "G", teams: ["GER", "KSA", "RSA", "URU"] },
  { group: "H", teams: ["POR", "SUI", "ALG", "CHI"] },
  { group: "I", teams: ["NED", "DEN", "GHA", "PER"] },
  { group: "J", teams: ["BEL", "POL", "IRQ", "HON"] },
  { group: "K", teams: ["ITA", "SRB", "QAT", "COL"] },
  { group: "L", teams: ["TUR", "AUT", "UKR", "UAE"] },
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function iso(month: number, day: number, hour: number, minute = 0): string {
  return `2026-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00.000Z`;
}

function buildGroupMatches(): SeedMatch[] {
  const matches: SeedMatch[] = [];
  const rounds = [
    { day: 11, times: [13, 16, 19, 22] },
    { day: 16, times: [13, 16, 19, 22] },
    { day: 23, times: [13, 16, 19, 22] },
  ];

  const pairings: [number, number][][] = [
    [
      [0, 1],
      [2, 3],
    ],
    [
      [0, 2],
      [3, 1],
    ],
    [
      [0, 3],
      [1, 2],
    ],
  ];

  for (let g = 0; g < groupTeams.length; g++) {
    const { group, teams } = groupTeams[g];
    for (let r = 0; r < 3; r++) {
      const day = rounds[r].day + Math.floor(g / 4);
      const timeSlot = rounds[r].times[(g % 4) * 2];
      const timeSlot2 = rounds[r].times[(g % 4) * 2 + 1];
      const [m1, m2] = pairings[r];
      matches.push({
        homeTeamCode: teams[m1[0]],
        awayTeamCode: teams[m1[1]],
        stage: "group",
        group,
        kickoffTime: iso(6, day, timeSlot),
      });
      matches.push({
        homeTeamCode: teams[m2[0]],
        awayTeamCode: teams[m2[1]],
        stage: "group",
        group,
        kickoffTime: iso(6, day, timeSlot2),
      });
    }
  }

  return matches;
}

function buildKnockoutMatches(): SeedMatch[] {
  const matches: SeedMatch[] = [];

  const r32: { day: number; times: number[] }[] = [
    { day: 28, times: [13, 16, 19, 22] },
    { day: 29, times: [13, 16, 19, 22] },
    { day: 30, times: [13, 16, 19, 22] },
    { day: 1, times: [13, 16, 19, 22] },
  ];
  for (let i = 0; i < 16; i++) {
    const slot = r32[Math.floor(i / 4)];
    const month = i < 12 ? 6 : 7;
    matches.push({
      homeTeamCode: "TBDH",
      awayTeamCode: "TBDA",
      stage: "r32",
      group: null,
      kickoffTime: iso(month, slot.day, slot.times[i % 4]),
    });
  }

  const r16: { day: number; times: number[] }[] = [
    { day: 4, times: [16, 22] },
    { day: 5, times: [16, 22] },
    { day: 6, times: [16, 22] },
    { day: 7, times: [16, 22] },
  ];
  for (let i = 0; i < 8; i++) {
    const slot = r16[Math.floor(i / 2)];
    matches.push({
      homeTeamCode: "TBDH",
      awayTeamCode: "TBDA",
      stage: "r16",
      group: null,
      kickoffTime: iso(7, slot.day, slot.times[i % 2]),
    });
  }

  const qf: { day: number; times: number[] }[] = [
    { day: 9, times: [16, 22] },
    { day: 10, times: [16, 22] },
  ];
  for (let i = 0; i < 4; i++) {
    const slot = qf[Math.floor(i / 2)];
    matches.push({
      homeTeamCode: "TBDH",
      awayTeamCode: "TBDA",
      stage: "qf",
      group: null,
      kickoffTime: iso(7, slot.day, slot.times[i % 2]),
    });
  }

  matches.push({
    homeTeamCode: "TBDH",
    awayTeamCode: "TBDA",
    stage: "sf",
    group: null,
    kickoffTime: iso(7, 14, 19),
  });
  matches.push({
    homeTeamCode: "TBDH",
    awayTeamCode: "TBDA",
    stage: "sf",
    group: null,
    kickoffTime: iso(7, 15, 19),
  });

  matches.push({
    homeTeamCode: "TBDH",
    awayTeamCode: "TBDA",
    stage: "third",
    group: null,
    kickoffTime: iso(7, 18, 18),
  });

  matches.push({
    homeTeamCode: "TBDH",
    awayTeamCode: "TBDA",
    stage: "final",
    group: null,
    kickoffTime: iso(7, 19, 19),
  });

  return matches;
}

export const seedMatches: SeedMatch[] = [
  ...buildGroupMatches(),
  ...buildKnockoutMatches(),
];
