import { type MigrationInterface, type QueryRunner } from "typeorm";

export class CreateAccounts1774466148296 implements MigrationInterface {
    name = 'CreateAccounts1774466148296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "accounts" ("id" varchar PRIMARY KEY NOT NULL, "algorithm" varchar CHECK( "algorithm" IN ('SHA1','SHA256','SHA512') ) NOT NULL DEFAULT ('SHA1'), "digits" integer NOT NULL DEFAULT (6), "encoding" varchar CHECK( "encoding" IN ('ASCII','HEX','BASE32','BASE64') ) NOT NULL DEFAULT ('ASCII'), "issuer" varchar NOT NULL DEFAULT ('unknown'), "name" varchar NOT NULL DEFAULT ('unknown'), "secret" varchar NOT NULL, "period" integer NOT NULL DEFAULT (30), "counter" integer NOT NULL DEFAULT (0), "type" varchar CHECK( "type" IN ('HOTP','TOTP') ) NOT NULL DEFAULT ('TOTP'))`);
        await queryRunner.query(`CREATE INDEX "IDX_76aa7f4c051344d8f4ac08f1aa" ON "accounts" ("issuer") `);
        await queryRunner.query(`CREATE INDEX "IDX_2db43cdbf7bb862e577b5f540c" ON "accounts" ("name") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_2db43cdbf7bb862e577b5f540c"`);
        await queryRunner.query(`DROP INDEX "IDX_76aa7f4c051344d8f4ac08f1aa"`);
        await queryRunner.query(`DROP TABLE "accounts"`);
    }

}
