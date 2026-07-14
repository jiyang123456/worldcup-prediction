import { MidwayConfig } from "@midwayjs/core";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { User } from "../entity/user.entity";
import { Team } from "../entity/team.entity";
import { Match } from "../entity/match.entity";
import { Prediction } from "../entity/prediction.entity";
import { Favorite } from "../entity/favorite.entity";
import { Comment } from "../entity/comment.entity";
import { Init1783987200000 } from "../migration/0001_init";

const databasePath = resolve(
  process.cwd(),
  process.env.DATABASE_PATH ?? "./data/worldcup.sqlite",
);
mkdirSync(dirname(databasePath), { recursive: true });

export default {
  keys: "course-demo-development-key",
  jwt: {
    secret: process.env.JWT_SECRET ?? "worldcup-dev-secret-change-me",
  },
  koa: {
    port: Number(process.env.BACKEND_PORT ?? 7001),
  },
  courseDatabase: {
    path: process.env.DATABASE_PATH ?? "./data/course-demo.sqlite",
  },
  typeorm: {
    allowExecuteMigrations: true,
    dataSource: {
      default: {
        type: "better-sqlite3" as const,
        database: databasePath,
        entities: [User, Team, Match, Prediction, Favorite, Comment],
        migrations: [Init1783987200000],
        synchronize: false,
        logging: false,
      },
    },
  },
} as MidwayConfig;
