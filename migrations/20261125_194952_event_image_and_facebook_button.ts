import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" ADD COLUMN "image_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_image_id" integer;
  ALTER TABLE "calendar_page" ADD COLUMN "texts_facebook_button_label" varchar DEFAULT 'Zúčastním se';
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "_events_v_version_version_image_idx" ON "_events_v" USING btree ("version_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP CONSTRAINT "events_image_id_media_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_image_id_media_id_fk";
  
  DROP INDEX "events_image_idx";
  DROP INDEX "_events_v_version_version_image_idx";
  ALTER TABLE "events" DROP COLUMN "image_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_image_id";
  ALTER TABLE "calendar_page" DROP COLUMN "texts_facebook_button_label";`)
}
