import { ILogger, Logger, Provide } from "@midwayjs/core";
import { InjectDataSource } from "@midwayjs/typeorm";
import { DataSource } from "typeorm";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { User } from "../entity/user.entity";
import { Team } from "../entity/team.entity";
import { Match } from "../entity/match.entity";
import { seedTeams } from "./teams";
import { seedMatches } from "./matches";

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 16;

@Provide()
export class SeedService {
  @InjectDataSource()
  dataSource: DataSource;

  @Logger()
  logger: ILogger;

  async initialize() {
    await this.ensureDatabaseDirectory();
    await this.dataSource.runMigrations();
    await this.seedAdminUser();
    await this.seedTeams();
    await this.seedMatches();
    this.logger.info(
      "[SeedService] migrations executed and seed data verified",
    );
  }

  private async ensureDatabaseDirectory() {
    const database = this.dataSource.options.database;
    if (typeof database !== "string" || database === ":memory:") {
      return;
    }
    const absolutePath = resolve(process.cwd(), database);
    mkdirSync(dirname(absolutePath), { recursive: true });
  }

  private async seedAdminUser() {
    const userRepo = this.dataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { username: "admin" } });
    if (existing) {
      return;
    }
    const admin = new User();
    admin.username = "admin";
    admin.passwordHash = SeedService.hashPassword("admin123");
    admin.role = "admin";
    await userRepo.save(admin);
    this.logger.info("[SeedService] admin user seeded (admin / admin123)");
  }

  private async seedTeams() {
    const teamRepo = this.dataSource.getRepository(Team);
    const count = await teamRepo.count();
    if (count > 0) {
      return;
    }
    const teams = seedTeams.map((t) => {
      const team = new Team();
      team.name = t.name;
      team.code = t.code;
      team.group = t.group;
      team.flagUrl = t.flagUrl;
      return team;
    });
    await teamRepo.save(teams);
    this.logger.info(`[SeedService] seeded ${teams.length} teams`);
  }

  private async seedMatches() {
    const matchRepo = this.dataSource.getRepository(Match);
    const count = await matchRepo.count();
    if (count > 0) {
      return;
    }
    const teamRepo = this.dataSource.getRepository(Team);
    const allTeams = await teamRepo.find();
    const codeToTeam = new Map(allTeams.map((t) => [t.code, t]));

    const matches = seedMatches.flatMap((m) => {
      const home = codeToTeam.get(m.homeCode);
      const away = codeToTeam.get(m.awayCode);
      if (!home || !away) {
        return [];
      }
      const match = new Match();
      match.homeTeam = home;
      match.awayTeam = away;
      match.stage = m.stage;
      match.group = m.group;
      match.kickoffTime = new Date(m.kickoffTime);
      match.homeScore = m.homeScore;
      match.awayScore = m.awayScore;
      match.status = m.status;
      return match;
    });
    await matchRepo.save(matches);
    this.logger.info(`[SeedService] seeded ${matches.length} matches`);
  }

  static hashPassword(password: string): string {
    const salt = randomBytes(SCRYPT_SALT_LENGTH);
    const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
    return `${salt.toString("hex")}:${hash.toString("hex")}`;
  }

  static verifyPassword(password: string, stored: string): boolean {
    const parts = stored.split(":");
    if (parts.length !== 2) {
      return false;
    }
    const [saltHex, hashHex] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const hash = Buffer.from(hashHex, "hex");
    const computed = scryptSync(password, salt, hash.length);
    if (hash.length !== computed.length) {
      return false;
    }
    return timingSafeEqual(hash, computed);
  }
}
