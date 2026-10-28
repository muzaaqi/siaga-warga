CREATE TYPE "public"."handling_status_enum" AS ENUM('not_forwarded', 'forwarded', 'acknowledged', 'in_progress', 'resolved', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."incident_type_enum" AS ENUM('karhutla', 'permukiman', 'industri', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."priority_enum" AS ENUM('high', 'normal', 'low');--> statement-breakpoint
CREATE TYPE "public"."verification_status_enum" AS ENUM('pending', 'needs_review', 'verified', 'insufficient_evidence', 'rejected');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracking_code" varchar(12) NOT NULL,
	"incident_type" "incident_type_enum" NOT NULL,
	"description" text NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"location_geom" geometry(point),
	"address_display" text,
	"verification_status" "verification_status_enum" DEFAULT 'pending' NOT NULL,
	"priority" "priority_enum" DEFAULT 'normal' NOT NULL,
	"handling_status" "handling_status_enum" DEFAULT 'not_forwarded' NOT NULL,
	"cluster_id" uuid,
	"is_potential_duplicate" boolean DEFAULT false NOT NULL,
	"satellite_hotspot_matched" boolean DEFAULT false NOT NULL,
	"reporter_name" varchar(100),
	"reporter_phone" varchar(20),
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_tracking_code_unique" UNIQUE("tracking_code")
);
--> statement-breakpoint
CREATE TABLE "report_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"r2_object_key" text NOT NULL,
	"media_url" text NOT NULL,
	"file_hash_sha256" varchar(64) NOT NULL,
	"exif_capture_time" timestamp with time zone,
	"file_size_bytes" integer NOT NULL,
	"mime_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "satellite_hotspots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" varchar(20) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"geom" geometry(point),
	"brightness" double precision,
	"confidence" varchar(20),
	"acquired_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"status_type" varchar(30) NOT NULL,
	"previous_value" varchar(50),
	"new_value" varchar(50) NOT NULL,
	"changed_by" varchar(100) NOT NULL,
	"reason_note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_evidence" ADD CONSTRAINT "report_evidence_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_status_history" ADD CONSTRAINT "report_status_history_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reports_geom" ON "reports" USING gist ("location_geom");--> statement-breakpoint
CREATE INDEX "idx_reports_verification" ON "reports" USING btree ("verification_status","priority");--> statement-breakpoint
CREATE INDEX "idx_reports_tracking" ON "reports" USING btree ("tracking_code");--> statement-breakpoint
CREATE INDEX "idx_hotspots_geom" ON "satellite_hotspots" USING gist ("geom");