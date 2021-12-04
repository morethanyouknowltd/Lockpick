import { MigrationInterface, QueryRunner } from 'typeorm'

export class Initial1616748420591 implements MigrationInterface {
  name = 'Initial1616748420591'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ProjectTrack" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "project_id" integer NOT NULL, "scroll" integer NOT NULL, "data" text NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_6bbb9f75797074e8c848381ccf" ON "ProjectTrack" ("project_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ebda2ec7d818446c2e085896b8" ON "ProjectTrack" ("name") `
    )
    await queryRunner.query(
      `CREATE TABLE "Project" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "data" text NOT NULL)`
    )
    await queryRunner.query(`CREATE INDEX "IDX_966e2b9904b88ebc9da7bee728" ON "Project" ("name") `)
    await queryRunner.query(
      `CREATE TABLE "Setting" ("key" varchar PRIMARY KEY NOT NULL, "value" varchar NOT NULL, "mod" varchar, "type" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`
    )
    await queryRunner.query(`CREATE INDEX "IDX_200c76efbc3649d3aecce87063" ON "Setting" ("type") `)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ce8621b5537eda5fed89d9e5b7" ON "Setting" ("key", "mod") `
    )
    await queryRunner.query(`DROP INDEX "IDX_6bbb9f75797074e8c848381ccf"`)
    await queryRunner.query(`DROP INDEX "IDX_ebda2ec7d818446c2e085896b8"`)
    await queryRunner.query(
      `CREATE TABLE "temporary_ProjectTrack" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "project_id" integer NOT NULL, "scroll" integer NOT NULL, "data" text NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_6bbb9f75797074e8c848381ccf6" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`
    )
    await queryRunner.query(
      `INSERT INTO "temporary_ProjectTrack"("id", "project_id", "scroll", "data", "name", "created_at", "updated_at") SELECT "id", "project_id", "scroll", "data", "name", "created_at", "updated_at" FROM "ProjectTrack"`
    )
    await queryRunner.query(`DROP TABLE "ProjectTrack"`)
    await queryRunner.query(`ALTER TABLE "temporary_ProjectTrack" RENAME TO "ProjectTrack"`)
    await queryRunner.query(
      `CREATE INDEX "IDX_6bbb9f75797074e8c848381ccf" ON "ProjectTrack" ("project_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_ebda2ec7d818446c2e085896b8" ON "ProjectTrack" ("name") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ebda2ec7d818446c2e085896b8"`)
    await queryRunner.query(`DROP INDEX "IDX_6bbb9f75797074e8c848381ccf"`)
    await queryRunner.query(`ALTER TABLE "ProjectTrack" RENAME TO "temporary_ProjectTrack"`)
    await queryRunner.query(
      `CREATE TABLE "ProjectTrack" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "project_id" integer NOT NULL, "scroll" integer NOT NULL, "data" text NOT NULL, "name" varchar NOT NULL, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')))`
    )
    await queryRunner.query(
      `INSERT INTO "ProjectTrack"("id", "project_id", "scroll", "data", "name", "created_at", "updated_at") SELECT "id", "project_id", "scroll", "data", "name", "created_at", "updated_at" FROM "temporary_ProjectTrack"`
    )
    await queryRunner.query(`DROP TABLE "temporary_ProjectTrack"`)
    await queryRunner.query(
      `CREATE INDEX "IDX_ebda2ec7d818446c2e085896b8" ON "ProjectTrack" ("name") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_6bbb9f75797074e8c848381ccf" ON "ProjectTrack" ("project_id") `
    )
    await queryRunner.query(`DROP INDEX "IDX_ce8621b5537eda5fed89d9e5b7"`)
    await queryRunner.query(`DROP INDEX "IDX_200c76efbc3649d3aecce87063"`)
    await queryRunner.query(`DROP TABLE "Setting"`)
    await queryRunner.query(`DROP INDEX "IDX_966e2b9904b88ebc9da7bee728"`)
    await queryRunner.query(`DROP TABLE "Project"`)
    await queryRunner.query(`DROP INDEX "IDX_ebda2ec7d818446c2e085896b8"`)
    await queryRunner.query(`DROP INDEX "IDX_6bbb9f75797074e8c848381ccf"`)
    await queryRunner.query(`DROP TABLE "ProjectTrack"`)
  }
}
