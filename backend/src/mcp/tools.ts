import type { DatabaseSync } from "node:sqlite";
import { createMatchRepo, listMatches, getMatch, getStandings, getKnockout, listTeams, getTeam } from "../service/match-logic";
import { createPredictionRepo } from "../service/prediction-logic";
import { createCommentRepo, listCommentsLogic } from "../service/comment-logic";

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
}

export function createMcpTools(db: DatabaseSync) {
  const matchRepo = createMatchRepo(db);
  const predictionRepo = createPredictionRepo(db);
  const commentRepo = createCommentRepo(db);

  const tools: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
    get_matches: async (args) => {
      const stage = typeof args.stage === "string" ? args.stage : undefined;
      const status = typeof args.status === "string" ? args.status : undefined;
      const matches = await listMatches(matchRepo, stage, status);
      return { matches };
    },
    get_match_by_id: async (args) => {
      const id = Number(args.id);
      const match = await getMatch(matchRepo, id);
      return { match };
    },
    get_standings: async (args) => {
      const group = typeof args.group === "string" ? args.group : undefined;
      const standings = await getStandings(matchRepo, group);
      return { standings };
    },
    get_knockout_bracket: async () => {
      const bracket = await getKnockout(matchRepo);
      return { bracket };
    },
    get_teams: async () => {
      const teams = await listTeams(matchRepo);
      return { teams };
    },
    get_team_by_id: async (args) => {
      const id = Number(args.id);
      const team = await getTeam(matchRepo, id);
      return { team };
    },
    get_predictions: async (args) => {
      const userId = Number(args.userId);
      const predictions = await predictionRepo.listPredictionsByUser(userId);
      return { predictions };
    },
    get_match_comments: async (args) => {
      const matchId = Number(args.matchId);
      const comments = await listCommentsLogic(commentRepo, matchId);
      return { comments };
    },
  };

  return tools;
}

export function getToolDefinitions(): McpTool[] {
  return [
    {
      name: "get_matches",
      description: "查询世界杯比赛列表，可按阶段和状态筛选",
      inputSchema: {
        type: "object",
        properties: {
          stage: { type: "string", description: "比赛阶段: group|r32|r16|qf|sf|third|final" },
          status: { type: "string", description: "比赛状态: scheduled|live|finished" },
        },
        required: [],
      },
    },
    {
      name: "get_match_by_id",
      description: "查询指定比赛的详细信息",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "number", description: "比赛 ID" },
        },
        required: ["id"],
      },
    },
    {
      name: "get_standings",
      description: "查询小组积分榜",
      inputSchema: {
        type: "object",
        properties: {
          group: { type: "string", description: "小组名称: A-L" },
        },
        required: [],
      },
    },
    {
      name: "get_knockout_bracket",
      description: "查询淘汰赛对阵图",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "get_teams",
      description: "查询所有球队列表",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "get_team_by_id",
      description: "查询指定球队信息",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "number", description: "球队 ID" },
        },
        required: ["id"],
      },
    },
    {
      name: "get_predictions",
      description: "查询用户的预测记录",
      inputSchema: {
        type: "object",
        properties: {
          userId: { type: "number", description: "用户 ID" },
        },
        required: ["userId"],
      },
    },
    {
      name: "get_match_comments",
      description: "查询比赛评论",
      inputSchema: {
        type: "object",
        properties: {
          matchId: { type: "number", description: "比赛 ID" },
        },
        required: ["matchId"],
      },
    },
  ];
}
