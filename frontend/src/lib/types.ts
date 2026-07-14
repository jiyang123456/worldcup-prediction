export type UserRole = "user" | "admin";

export type User = {
  id: number;
  username: string;
  role: UserRole;
};

export type TeamGroup =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export type Team = {
  id: number;
  name: string;
  code: string;
  group: TeamGroup | null;
  flagUrl: string | null;
  createdAt: string;
};

export type MatchStage =
  | "group"
  | "r32"
  | "r16"
  | "qf"
  | "sf"
  | "third"
  | "final";

export type MatchStatus = "scheduled" | "live" | "finished";

export type Match = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  stage: MatchStage;
  group: TeamGroup | null;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  createdAt: string;
};

export type Prediction = {
  id: number;
  userId: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
  points: number | null;
  createdAt: string;
  match?: Match;
};

export type CommentUser = {
  id: number;
  username: string;
};

export type Comment = {
  id: number;
  userId: number;
  matchId: number;
  content: string;
  createdAt: string;
  user: CommentUser;
};

export type Favorite = {
  id: number;
  userId: number;
  matchId: number;
  createdAt: string;
  match?: Match;
};

export type Standing = {
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
};

export type KnockoutBracket = {
  r32: Match[];
  r16: Match[];
  qf: Match[];
  sf: Match[];
  third: Match[];
  final: Match[];
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "PREDICTION_LOCKED"
  | "DUPLICATE_PREDICTION"
  | "USERNAME_TAKEN"
  | "INVALID_CREDENTIALS";

export type ApiError = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
  requestId: string;
};
