import type { DatabaseSync } from "node:sqlite";

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

interface MatchRow {
  id: number;
  home_team_id: number;
  away_team_id: number;
  stage: string;
  group: string | null;
  kickoff_time: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
}

interface TeamRow {
  id: number;
  name: string;
  code: string;
  group_name: string | null;
  flag_url: string | null;
}

interface MatchDbRow extends MatchRow {
  ht_name: string;
  ht_code: string;
  ht_group: string | null;
  ht_flag: string | null;
  at_name: string;
  at_code: string;
  at_group: string | null;
  at_flag: string | null;
}

export function createMatchRepo(db: DatabaseSync): MatchRepo {
  return {
    async findMatches(stage?: string, status?: string): Promise<MatchData[]> {
      let sql = `
        SELECT m.*, 
          ht.name AS ht_name, ht.code AS ht_code, ht.group_name AS ht_group, ht.flag_url AS ht_flag,
          at.name AS at_name, at.code AS at_code, at.group_name AS at_group, at.flag_url AS at_flag
        FROM matches m
        LEFT JOIN teams ht ON m.home_team_id = ht.id
        LEFT JOIN teams at ON m.away_team_id = at.id
        WHERE 1=1
      `;
      const params: (string | number)[] = [];
      if (stage) { sql += " AND m.stage = ?"; params.push(stage); }
      if (status) { sql += " AND m.status = ?"; params.push(status); }
      sql += " ORDER BY m.kickoff_time ASC";
      const rows = db.prepare(sql).all(...params) as unknown as MatchDbRow[];
      return rows.map(mapMatchRow);
    },
    async findMatchById(id: number): Promise<MatchData | null> {
      const sql = `
        SELECT m.*, 
          ht.name AS ht_name, ht.code AS ht_code, ht.group_name AS ht_group, ht.flag_url AS ht_flag,
          at.name AS at_name, at.code AS at_code, at.group_name AS at_group, at.flag_url AS at_flag
        FROM matches m
        LEFT JOIN teams ht ON m.home_team_id = ht.id
        LEFT JOIN teams at ON m.away_team_id = at.id
        WHERE m.id = ?
      `;
      const row = db.prepare(sql).get(id) as unknown as MatchDbRow | undefined;
      return row ? mapMatchRow(row) : null;
    },
    async findFinishedGroupMatches(group?: string): Promise<MatchData[]> {
      let sql = `
        SELECT m.*, 
          ht.name AS ht_name, ht.code AS ht_code, ht.group_name AS ht_group, ht.flag_url AS ht_flag,
          at.name AS at_name, at.code AS at_code, at.group_name AS at_group, at.flag_url AS at_flag
        FROM matches m
        LEFT JOIN teams ht ON m.home_team_id = ht.id
        LEFT JOIN teams at ON m.away_team_id = at.id
        WHERE m.stage = 'group' AND m.status = 'finished'
      `;
      const params: (string | number)[] = [];
      if (group) { sql += " AND m.\"group\" = ?"; params.push(group); }
      const rows = db.prepare(sql).all(...params) as unknown as MatchDbRow[];
      return rows.map(mapMatchRow);
    },
    async findAllTeams(): Promise<TeamData[]> {
      const rows = db.prepare("SELECT * FROM teams ORDER BY name ASC").all() as unknown as TeamRow[];
      return rows.map((r): TeamData => ({
        id: r.id, name: r.name, code: r.code, group: r.group_name, flagUrl: r.flag_url,
      }));
    },
    async findTeamById(id: number): Promise<TeamData | null> {
      const row = db.prepare("SELECT * FROM teams WHERE id = ?").get(id) as unknown as TeamRow | undefined;
      if (!row) return null;
      return { id: row.id, name: row.name, code: row.code, group: row.group_name, flagUrl: row.flag_url };
    },
    async updateMatchResult(id: number, homeScore: number, awayScore: number): Promise<MatchData | null> {
      const result = db.prepare(
        "UPDATE matches SET home_score = ?, away_score = ?, status = 'finished' WHERE id = ?"
      ).run(homeScore, awayScore, id);
      if (result.changes === 0) return null;
      return this.findMatchById(id);
    },
  };
}

function mapMatchRow(r: MatchDbRow): MatchData {
  return {
    id: r.id,
    homeTeam: { id: r.home_team_id, name: r.ht_name, code: r.ht_code, group: r.ht_group, flagUrl: r.ht_flag },
    awayTeam: { id: r.away_team_id, name: r.at_name, code: r.at_code, group: r.at_group, flagUrl: r.at_flag },
    stage: r.stage,
    group: r.group,
    kickoffTime: new Date(r.kickoff_time),
    homeScore: r.home_score,
    awayScore: r.away_score,
    status: r.status,
  };
}
