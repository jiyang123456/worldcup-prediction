export interface TeamData {
  id: number;
  name: string;
  code: string;
  group: string | null;
  flagUrl: string | null;
}

export interface MatchData {
  id: number;
  homeTeam: TeamData | null;
  awayTeam: TeamData | null;
  stage: string;
  group: string | null;
  kickoffTime: Date;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

export interface Standing {
  teamId: number;
  teamName: string;
  teamCode: string;
  flagUrl: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface KnockoutTeam {
  id: number;
  name: string;
  code: string;
  flagUrl: string | null;
}

export interface KnockoutMatch {
  id: number;
  stage: string;
  homeTeam: KnockoutTeam | null;
  awayTeam: KnockoutTeam | null;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

export interface MatchRepo {
  findMatches(stage?: string, status?: string): Promise<MatchData[]>;
  findMatchById(id: number): Promise<MatchData | null>;
  findFinishedGroupMatches(group?: string): Promise<MatchData[]>;
  findAllTeams(): Promise<TeamData[]>;
  findTeamById(id: number): Promise<TeamData | null>;
  updateMatchResult(
    id: number,
    homeScore: number,
    awayScore: number,
  ): Promise<MatchData | null>;
}

const KNOCKOUT_STAGES: readonly string[] = [
  "r32",
  "r16",
  "qf",
  "sf",
  "third",
  "final",
];

function toKnockoutTeam(team: TeamData | null): KnockoutTeam | null {
  if (!team) {
    return null;
  }
  return {
    id: team.id,
    name: team.name,
    code: team.code,
    flagUrl: team.flagUrl,
  };
}

export function computeStandings(matches: MatchData[]): Standing[] {
  const table = new Map<number, Standing>();

  const ensure = (team: TeamData): Standing => {
    let row = table.get(team.id);
    if (!row) {
      row = {
        teamId: team.id,
        teamName: team.name,
        teamCode: team.code,
        flagUrl: team.flagUrl,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
      table.set(team.id, row);
    }
    return row;
  };

  for (const match of matches) {
    if (match.status !== "finished") {
      continue;
    }
    if (match.homeScore === null || match.awayScore === null) {
      continue;
    }
    if (!match.homeTeam || !match.awayTeam) {
      continue;
    }
    const home = ensure(match.homeTeam);
    const away = ensure(match.awayTeam);
    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const standings = Array.from(table.values());
  for (const row of standings) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }
  standings.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }
    return a.teamName.localeCompare(b.teamName);
  });
  return standings;
}

export function groupKnockout(
  matches: MatchData[],
): Record<string, KnockoutMatch[]> {
  const bracket: Record<string, KnockoutMatch[]> = {};
  for (const stage of KNOCKOUT_STAGES) {
    bracket[stage] = [];
  }
  for (const match of matches) {
    if (!KNOCKOUT_STAGES.includes(match.stage)) {
      continue;
    }
    bracket[match.stage].push({
      id: match.id,
      stage: match.stage,
      homeTeam: toKnockoutTeam(match.homeTeam),
      awayTeam: toKnockoutTeam(match.awayTeam),
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status,
    });
  }
  return bracket;
}

export async function listMatches(
  repo: MatchRepo,
  stage?: string,
  status?: string,
): Promise<MatchData[]> {
  return repo.findMatches(stage, status);
}

export async function getMatch(
  repo: MatchRepo,
  id: number,
): Promise<MatchData | null> {
  return repo.findMatchById(id);
}

export async function getStandings(
  repo: MatchRepo,
  group?: string,
): Promise<Standing[]> {
  const matches = await repo.findFinishedGroupMatches(group);
  return computeStandings(matches);
}

export async function getKnockout(
  repo: MatchRepo,
): Promise<Record<string, KnockoutMatch[]>> {
  const matches = await repo.findMatches();
  return groupKnockout(matches);
}

export async function listTeams(repo: MatchRepo): Promise<TeamData[]> {
  return repo.findAllTeams();
}

export async function getTeam(
  repo: MatchRepo,
  id: number,
): Promise<TeamData | null> {
  return repo.findTeamById(id);
}

export async function updateMatchResult(
  repo: MatchRepo,
  id: number,
  homeScore: number,
  awayScore: number,
): Promise<MatchData | null> {
  return repo.updateMatchResult(id, homeScore, awayScore);
}
