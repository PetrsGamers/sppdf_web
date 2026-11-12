import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "about_page_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "about_page_history_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_badge" varchar DEFAULT 'Kdo jsme',
  	"intro_headline" varchar DEFAULT 'O {{nás}}',
  	"intro_text" varchar DEFAULT 'Jsme Spolek přátel pedagogické fakulty — komunita studentů, absolventů a pedagogů, kteří věří v sílu vzdělávání a společného růstu.',
  	"intro_story_link_label" varchar DEFAULT 'Náš příběh',
  	"history_heading" varchar DEFAULT 'Naše {{historie}}',
  	"team_heading" varchar DEFAULT 'Náš {{tým}}',
  	"team_description" varchar DEFAULT 'Poznejte lidi, kteří stojí za chodem spolku a organizují aktivity pro celou fakultu.',
  	"cta_heading" varchar DEFAULT 'Chceš měnit fakultu s námi?',
  	"cta_text" varchar DEFAULT 'Přidej se k SPPDF a staň se součástí komunity, která formuje budoucnost pedagogické fakulty.',
  	"cta_primary_label" varchar DEFAULT 'Přidej se k nám',
  	"cta_primary_link" varchar DEFAULT '#',
  	"cta_secondary_label" varchar DEFAULT 'Prohlédnout akce',
  	"cta_secondary_link" varchar DEFAULT '/calendar',
  	"seo_title" varchar DEFAULT 'O nás | SPPDF',
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "calendar_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"texts_academic_year_label" varchar DEFAULT 'Akademický rok',
  	"texts_register_button_label" varchar DEFAULT 'Registrovat se',
  	"texts_default_registration_url" varchar DEFAULT '',
  	"texts_select_day_text" varchar DEFAULT 'Vyberte den v kalendáři pro zobrazení událostí.',
  	"texts_no_events_text" varchar DEFAULT 'Na {datum} nejsou plánovány žádné události.',
  	"seo_title" varchar DEFAULT 'Kalendář akcí | SPPDF',
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'SPPDF',
  	"logo_id" integer,
  	"favicon_id" integer,
  	"seo_default_title" varchar DEFAULT 'SPPDF | Spolek přátel pedagogické fakulty',
  	"seo_default_description" varchar DEFAULT 'Jsme komunita, která propojuje studenty a pedagogy. Tvoříme prostředí pro sdílení zkušeností a radosti z učitelského povolání.',
  	"seo_og_image_id" integer,
  	"not_found_heading" varchar DEFAULT '404',
  	"not_found_text" varchar DEFAULT 'Tato stránka neexistuje nebo byla přesunuta.',
  	"not_found_button_label" varchar DEFAULT 'Zpět na hlavní stránku',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "landing_page" ALTER COLUMN "footer_copyright" SET DEFAULT '© {rok} Spolek přátel pedagogické fakulty. Všechna práva vyhrazena.';
  ALTER TABLE "events" ADD COLUMN "registration_url" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_registration_url" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;
  ALTER TABLE "landing_page_footer_social_links" ADD COLUMN "label" varchar;
  ALTER TABLE "landing_page" ADD COLUMN "calendar_section_heading" varchar DEFAULT 'Kalendář událostí';
  ALTER TABLE "landing_page" ADD COLUMN "calendar_section_description" varchar DEFAULT 'Sledujte, co připravujeme na Pedagogické fakultě. Od neformálních setkání po odborné přednášky.';
  ALTER TABLE "landing_page" ADD COLUMN "calendar_section_end_card_title" varchar DEFAULT 'Připravujeme pro vás další akce';
  ALTER TABLE "landing_page" ADD COLUMN "calendar_section_end_card_text" varchar DEFAULT 'Těšíme se na vás příští semestr';
  ALTER TABLE "landing_page" ADD COLUMN "calendar_section_cta_heading" varchar DEFAULT 'Zajímá vás kompletní program?';
  ALTER TABLE "landing_page" ADD COLUMN "calendar_section_cta_text" varchar DEFAULT 'Podívejte se na všechny plánované akce v našem interaktivním kalendáři.';
  ALTER TABLE "landing_page" ADD COLUMN "calendar_section_cta_button_label" varchar DEFAULT 'Prohlédnout celý měsíc';
  ALTER TABLE "landing_page" ADD COLUMN "calendar_section_cta_button_link" varchar DEFAULT '/calendar';
  ALTER TABLE "landing_page" ADD COLUMN "footer_credit" varchar DEFAULT 'Design by SPPDF Creative Team';
  ALTER TABLE "landing_page" ADD COLUMN "seo_title" varchar DEFAULT 'SPPDF | Spolek přátel pedagogické fakulty';
  ALTER TABLE "landing_page" ADD COLUMN "seo_description" varchar DEFAULT 'Jsme komunita, která propojuje studenty a pedagogy. Tvoříme prostředí pro sdílení zkušeností a radosti z učitelského povolání.';
  ALTER TABLE "landing_page" ADD COLUMN "seo_image_id" integer;
  ALTER TABLE "about_page_features_items" ADD CONSTRAINT "about_page_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_history_items" ADD CONSTRAINT "about_page_history_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page" ADD CONSTRAINT "about_page_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "calendar_page" ADD CONSTRAINT "calendar_page_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "about_page_features_items_order_idx" ON "about_page_features_items" USING btree ("_order");
  CREATE INDEX "about_page_features_items_parent_id_idx" ON "about_page_features_items" USING btree ("_parent_id");
  CREATE INDEX "about_page_history_items_order_idx" ON "about_page_history_items" USING btree ("_order");
  CREATE INDEX "about_page_history_items_parent_id_idx" ON "about_page_history_items" USING btree ("_parent_id");
  CREATE INDEX "about_page_seo_seo_image_idx" ON "about_page" USING btree ("seo_image_id");
  CREATE INDEX "calendar_page_seo_seo_image_idx" ON "calendar_page" USING btree ("seo_image_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_seo_seo_og_image_idx" ON "site_settings" USING btree ("seo_og_image_id");
  ALTER TABLE "landing_page" ADD CONSTRAINT "landing_page_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "landing_page_seo_seo_image_idx" ON "landing_page" USING btree ("seo_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "about_page_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page_history_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "about_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "calendar_page" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "about_page_features_items" CASCADE;
  DROP TABLE "about_page_history_items" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "calendar_page" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  ALTER TABLE "landing_page" DROP CONSTRAINT "landing_page_seo_image_id_media_id_fk";
  
  DROP INDEX "landing_page_seo_seo_image_idx";
  ALTER TABLE "landing_page" ALTER COLUMN "footer_copyright" SET DEFAULT '© 2024 Spolek přátel pedagogické fakulty. Všechna práva vyhrazena.';
  ALTER TABLE "events" DROP COLUMN "registration_url";
  ALTER TABLE "_events_v" DROP COLUMN "version_registration_url";
  ALTER TABLE "users" DROP COLUMN "reset_password_requested_at";
  ALTER TABLE "landing_page_footer_social_links" DROP COLUMN "label";
  ALTER TABLE "landing_page" DROP COLUMN "calendar_section_heading";
  ALTER TABLE "landing_page" DROP COLUMN "calendar_section_description";
  ALTER TABLE "landing_page" DROP COLUMN "calendar_section_end_card_title";
  ALTER TABLE "landing_page" DROP COLUMN "calendar_section_end_card_text";
  ALTER TABLE "landing_page" DROP COLUMN "calendar_section_cta_heading";
  ALTER TABLE "landing_page" DROP COLUMN "calendar_section_cta_text";
  ALTER TABLE "landing_page" DROP COLUMN "calendar_section_cta_button_label";
  ALTER TABLE "landing_page" DROP COLUMN "calendar_section_cta_button_link";
  ALTER TABLE "landing_page" DROP COLUMN "footer_credit";
  ALTER TABLE "landing_page" DROP COLUMN "seo_title";
  ALTER TABLE "landing_page" DROP COLUMN "seo_description";
  ALTER TABLE "landing_page" DROP COLUMN "seo_image_id";`)
}
