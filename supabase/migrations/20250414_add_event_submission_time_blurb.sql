ALTER TABLE "public"."events"
ADD COLUMN "event_blurb" text,
ADD COLUMN "submission_time_start" timestamp with time zone DEFAULT now(),
ADD COLUMN "submission_time_cutoff" timestamp with time zone DEFAULT now();
