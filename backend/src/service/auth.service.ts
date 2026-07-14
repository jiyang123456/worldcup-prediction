import { Config, Provide } from "@midwayjs/core";
import { InjectDataSource } from "@midwayjs/typeorm";
import { DataSource } from "typeorm";
import { User } from "../entity/user.entity";
import { signJwt, verifyJwt } from "../util/jwt";
import { hashPassword, verifyPassword } from "../util/password";
import { invalidCredentialsError, usernameTakenError } from "../util/error";
import {
  findUserById,
  loginUser,
  registerUser,
  verifyToken,
  type AuthDeps,
  type UserRepo,
  type UserRow,
} from "./auth-logic";
import type {
  AuthResult,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "../dto/auth.dto";
import type { JwtPayload } from "../util/jwt";

@Provide()
export class AuthService {
  @InjectDataSource()
  dataSource: DataSource;

  @Config("jwt.secret")
  jwtSecret: string;

  private readonly deps: AuthDeps = {
    signJwt,
    verifyJwt,
    hashPassword,
    verifyPassword,
    duplicateUsernameError: usernameTakenError,
    invalidCredentialsError: invalidCredentialsError,
  };

  private createRepo(): UserRepo {
    const userRepo = this.dataSource.getRepository(User);
    return {
      async findByUsername(username: string): Promise<UserRow | null> {
        const user = await userRepo.findOne({ where: { username } });
        if (!user) {
          return null;
        }
        return {
          id: user.id,
          username: user.username,
          password_hash: user.passwordHash,
          role: user.role,
        };
      },
      async insert(
        username: string,
        passwordHash: string,
        role: string,
      ): Promise<UserRow> {
        const user = new User();
        user.username = username;
        user.passwordHash = passwordHash;
        user.role = role as "user" | "admin";
        const saved = await userRepo.save(user);
        return {
          id: saved.id,
          username: saved.username,
          password_hash: saved.passwordHash,
          role: saved.role,
        };
      },
      async findById(id: number): Promise<UserRow | null> {
        const user = await userRepo.findOne({ where: { id } });
        if (!user) {
          return null;
        }
        return {
          id: user.id,
          username: user.username,
          password_hash: user.passwordHash,
          role: user.role,
        };
      },
    };
  }

  register(input: RegisterInput): Promise<AuthResult> {
    return registerUser(this.deps, this.createRepo(), this.jwtSecret, input);
  }

  login(input: LoginInput): Promise<AuthResult> {
    return loginUser(this.deps, this.createRepo(), this.jwtSecret, input);
  }

  verifyToken(token: string): JwtPayload | null {
    return verifyToken(this.deps, token, this.jwtSecret);
  }

  findById(id: number): Promise<AuthUser | null> {
    return findUserById(this.createRepo(), id);
  }
}
