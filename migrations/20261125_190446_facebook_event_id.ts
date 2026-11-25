import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'importFacebookEvents' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'importFacebookEvents' BEFORE 'schedulePublish';
  ALTER TABLE "events" ADD COLUMN "facebook_event_id" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_facebook_event_id" varchar;
  CREATE UNIQUE INDEX "events_facebook_event_id_idx" ON "events" USING btree ("facebook_event_id");
  CREATE INDEX "_events_v_version_version_facebook_event_id_idx" ON "_events_v" USING btree ("version_facebook_event_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'syncGoogleCalendar', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'syncGoogleCalendar', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "events_facebook_event_id_idx";
  DROP INDEX "_events_v_version_version_facebook_event_id_idx";
  ALTER TABLE "events" DROP COLUMN "facebook_event_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_facebook_event_id";`)
}
