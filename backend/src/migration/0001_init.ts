import { MigrationInterface, QueryRunner } from "typeorm";
import {
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from "typeorm";

export class Init1783987200000 implements MigrationInterface {
  name = "Init1783987200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          new TableColumn({
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "username",
            type: "text",
            isUnique: true,
            isNullable: false,
          }),
          new TableColumn({
            name: "password_hash",
            type: "text",
            isNullable: false,
          }),
          new TableColumn({
            name: "role",
            type: "text",
            isNullable: false,
            default: "'user'",
          }),
          new TableColumn({
            name: "created_at",
            type: "datetime",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "teams",
        columns: [
          new TableColumn({
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "name",
            type: "text",
            isNullable: false,
          }),
          new TableColumn({
            name: "code",
            type: "text",
            isNullable: false,
          }),
          new TableColumn({
            name: "group",
            type: "text",
            isNullable: true,
          }),
          new TableColumn({
            name: "flag_url",
            type: "text",
            isNullable: true,
          }),
          new TableColumn({
            name: "created_at",
            type: "datetime",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "matches",
        columns: [
          new TableColumn({
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "home_team_id",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "away_team_id",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "stage",
            type: "text",
            isNullable: false,
          }),
          new TableColumn({
            name: "group",
            type: "text",
            isNullable: true,
          }),
          new TableColumn({
            name: "kickoff_time",
            type: "datetime",
            isNullable: false,
          }),
          new TableColumn({
            name: "home_score",
            type: "integer",
            isNullable: true,
          }),
          new TableColumn({
            name: "away_score",
            type: "integer",
            isNullable: true,
          }),
          new TableColumn({
            name: "status",
            type: "text",
            isNullable: false,
            default: "'scheduled'",
          }),
          new TableColumn({
            name: "created_at",
            type: "datetime",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["home_team_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "teams",
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            columnNames: ["away_team_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "teams",
            onDelete: "CASCADE",
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "predictions",
        columns: [
          new TableColumn({
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "user_id",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "match_id",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "home_score",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "away_score",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "points",
            type: "integer",
            isNullable: true,
          }),
          new TableColumn({
            name: "created_at",
            type: "datetime",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            columnNames: ["match_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "matches",
            onDelete: "CASCADE",
          }),
        ],
        uniques: [
          new TableUnique({
            name: "UQ_predictions_user_match",
            columnNames: ["user_id", "match_id"],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "favorites",
        columns: [
          new TableColumn({
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "user_id",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "match_id",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "created_at",
            type: "datetime",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            columnNames: ["match_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "matches",
            onDelete: "CASCADE",
          }),
        ],
        uniques: [
          new TableUnique({
            name: "UQ_favorites_user_match",
            columnNames: ["user_id", "match_id"],
          }),
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "comments",
        columns: [
          new TableColumn({
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          }),
          new TableColumn({
            name: "user_id",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "match_id",
            type: "integer",
            isNullable: false,
          }),
          new TableColumn({
            name: "content",
            type: "text",
            isNullable: false,
          }),
          new TableColumn({
            name: "created_at",
            type: "datetime",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            columnNames: ["match_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "matches",
            onDelete: "CASCADE",
          }),
        ],
        indices: [
          new TableIndex({
            name: "IDX_comments_match_id",
            columnNames: ["match_id"],
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("comments");
    await queryRunner.dropTable("favorites");
    await queryRunner.dropTable("predictions");
    await queryRunner.dropTable("matches");
    await queryRunner.dropTable("teams");
    await queryRunner.dropTable("users");
  }
}
