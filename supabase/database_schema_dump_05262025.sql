

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."event_role" AS ENUM (
    'participant',
    'mentor',
    'judge',
    'organizer',
    'admin',
    'event'
);


ALTER TYPE "public"."event_role" OWNER TO "postgres";


CREATE TYPE "public"."event_visibility" AS ENUM (
    'test',
    'demo',
    'private',
    'public',
    'draft'
);


ALTER TYPE "public"."event_visibility" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_pulse"("userId" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE user_profiles 
  SET pulse = COALESCE(pulse, 0) + 1 
  WHERE id = "userId";
END;
$$;


ALTER FUNCTION "public"."increment_pulse"("userId" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO public.user_profiles (display_name, email, user_id)
  VALUES (display_name, email, uid)
  ON CONFLICT (email) DO UPDATE
  SET
      display_name = EXCLUDED.display_name,
      email=EXCLUDED.email;
END;
$$;


ALTER FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin_user"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$DECLARE
    admin_ids UUID[] := ARRAY[
        '008301c8-59fd-412f-aab7-a4fab25f88d6'::UUID, -- quest 2 learn
        'c0bb8ce8-a8cf-4db0-82d3-262535825d12'::UUID, -- Hello mentor mates
        'e4182548-e05d-4201-bc61-fe5d76a7a7ce'::UUID, -- Matthew dev
        'a91610aa-5324-4978-b75d-2994ba3e15fd'::UUID  -- Chinat dev
    ];
BEGIN
    RETURN user_id = ANY(admin_ids);
END;$$;


ALTER FUNCTION "public"."is_admin_user"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_tracks_data"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    event_record RECORD;
    prize_json jsonb;
BEGIN
    FOR event_record IN SELECT event_id, event_prizes::jsonb, scoring_config::jsonb FROM events
    LOOP
        -- For each prize in event_prizes jsonb array
        FOR prize_json IN 
            SELECT * FROM jsonb_array_elements(event_record.event_prizes)
        LOOP
            -- Insert into event_tracks
            INSERT INTO public.event_tracks (
                event_id,
                name,
                description,
                prize_amount,
                prize_description,
                scoring_criteria
            )
            VALUES (
                event_record.event_id,
                prize_json->>'track',
                prize_json->>'description',
                prize_json->>'prize',
                prize_json->>'description',
                CASE 
                    WHEN event_record.scoring_config->'tracks' IS NOT NULL THEN
                        (event_record.scoring_config->'tracks'->>(prize_json->>'track'))::jsonb
                    ELSE NULL
                END
            );
        END LOOP;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."migrate_tracks_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_score_track_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if the track_id exists in the project's tracks using the junction table
  IF NOT EXISTS (
    SELECT 1
    FROM project_tracks
    WHERE project_id = NEW.project_id
    AND track_id = NEW.track_id
  ) THEN
    RAISE EXCEPTION 'Invalid track_id: Project does not belong to this track';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_score_track_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_track_ids"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Check if any of the track_ids are not in the event's scoring config
  IF EXISTS (
    SELECT 1
    FROM unnest(NEW.track_ids) AS track_id
    WHERE track_id NOT IN (
      SELECT DISTINCT jsonb_object_keys(events.scoring_config->'tracks')
      FROM events
      WHERE event_id = NEW.event_id
    )
  ) THEN
    RAISE EXCEPTION 'Invalid track ID found in track_ids';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_track_ids"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."event_tracks" (
    "track_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "label" "text",
    "prize_amount" "text",
    "prize_description" "text",
    "scoring_criteria" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."event_tracks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "event_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_name" "text" NOT NULL,
    "event_date" "text" NOT NULL,
    "location" "text",
    "event_description" "text",
    "event_schedule" "jsonb" DEFAULT '[]'::"jsonb",
    "event_prizes" "jsonb" DEFAULT '[]'::"jsonb",
    "event_resources" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "rules" "jsonb" NOT NULL,
    "cover_image_url" "text",
    "scoring_config" "jsonb",
    "event_blurb" "text",
    "submission_time_start" timestamp with time zone DEFAULT "now"(),
    "submission_time_cutoff" timestamp with time zone DEFAULT "now"(),
    "visibility" "public"."event_visibility" DEFAULT 'draft'::"public"."event_visibility" NOT NULL,
    "role_labels" "jsonb",
    "slug" "text"
);


ALTER TABLE "public"."events" OWNER TO "postgres";


COMMENT ON COLUMN "public"."events"."scoring_config" IS 'JSON object containing scoring criteria configuration. Example:
{
  "criteria": [
    {
      "id": "technical",
      "name": "Technical Implementation",
      "description": "Quality of code and implementation",
      "weight": 1,
      "min": 1,
      "max": 10
    }
  ],
  "defaultMin": 1,
  "defaultMax": 10,
  "defaultWeight": 1
}';



COMMENT ON COLUMN "public"."events"."role_labels" IS 'JSON object containing custom labels for each role. Example:
{
  "participant": "Founder",
  "mentor": "Observer",
  "judge": "Investor",
  "organizer": "Organizer"
}';



CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "mentor_name" "text",
    "mentor_email" "text",
    "feedback_text" "text",
    "created_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mentor_id" "uuid",
    "project_id" "uuid",
    "modifier_field" "text"[],
    "specific_ai_suggestion" "text",
    "positive_ai_suggestion" "text",
    "actionable_ai_suggestion" "text",
    "original_feedback_text" "text",
    "event_id" "uuid"
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


COMMENT ON COLUMN "public"."feedback"."modifier_field" IS 'parameter used to augment feedback with AI or ''original'' if no AI suggestions were accepted';



CREATE TABLE IF NOT EXISTS "public"."platform_engagement" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "display_name" "text",
    "status" "text" DEFAULT 'in_progress'::"text",
    "is_private" boolean DEFAULT false,
    "tags" "text"[],
    CONSTRAINT "platform_engagement_status_check" CHECK (("status" = ANY (ARRAY['in_progress'::"text", 'completed'::"text"]))),
    CONSTRAINT "platform_engagement_type_check" CHECK (("type" = ANY (ARRAY['goal'::"text", 'journal'::"text"])))
);


ALTER TABLE "public"."platform_engagement" OWNER TO "postgres";


COMMENT ON COLUMN "public"."platform_engagement"."tags" IS 'only for journal entries';



CREATE TABLE IF NOT EXISTS "public"."prizes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "track_id" "uuid" NOT NULL,
    "prize_amount" "text" NOT NULL,
    "prize_description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."prizes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "judge_id" "uuid" NOT NULL,
    "scores" "jsonb" NOT NULL,
    "comments" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "track_id" "uuid",
    "event_id" "uuid"
);


ALTER TABLE "public"."project_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_tracks" (
    "project_id" "uuid" NOT NULL,
    "track_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."project_tracks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "lead_name" "text" NOT NULL,
    "lead_email" "text",
    "project_description" "text",
    "created_at" timestamp without time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "project_name" "text",
    "teammates" "text"[],
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_url" "text",
    "additional_materials_url" "text",
    "event_id" "uuid",
    "cover_image_url" "text"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_passwords" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "role" "public"."event_role" NOT NULL,
    "password_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."role_passwords" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_event_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "role" "public"."event_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_event_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "uid" "uuid" NOT NULL,
    "display_name" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "pulse" bigint DEFAULT 0 NOT NULL,
    "links" "json"
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."event_tracks"
    ADD CONSTRAINT "event_tracks_pkey" PRIMARY KEY ("track_id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("event_id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."platform_engagement"
    ADD CONSTRAINT "platform_engagement_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prizes"
    ADD CONSTRAINT "prizes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_scores"
    ADD CONSTRAINT "project_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_scores"
    ADD CONSTRAINT "project_scores_project_id_judge_id_track_id_key" UNIQUE ("project_id", "judge_id", "track_id");



ALTER TABLE ONLY "public"."project_tracks"
    ADD CONSTRAINT "project_tracks_pkey" PRIMARY KEY ("project_id", "track_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_iiddd_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_passwords"
    ADD CONSTRAINT "role_passwords_event_id_role_key" UNIQUE ("event_id", "role");



ALTER TABLE ONLY "public"."role_passwords"
    ADD CONSTRAINT "role_passwords_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_event_roles"
    ADD CONSTRAINT "user_event_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_event_roles"
    ADD CONSTRAINT "user_event_roles_user_id_event_id_key" UNIQUE ("user_id", "event_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("uid");



CREATE INDEX "idx_event_tracks_event_id" ON "public"."event_tracks" USING "btree" ("event_id");



CREATE INDEX "idx_events_role_labels" ON "public"."events" USING "gin" ("role_labels");



CREATE INDEX "idx_events_scoring_config" ON "public"."events" USING "gin" ("scoring_config");



CREATE INDEX "idx_prizes_track_id" ON "public"."prizes" USING "btree" ("track_id");



CREATE INDEX "idx_project_scores_event_id" ON "public"."project_scores" USING "btree" ("event_id");



CREATE INDEX "idx_project_scores_judge_id" ON "public"."project_scores" USING "btree" ("judge_id");



CREATE INDEX "idx_project_scores_project_id" ON "public"."project_scores" USING "btree" ("project_id");



CREATE INDEX "idx_project_scores_scores" ON "public"."project_scores" USING "gin" ("scores");



CREATE INDEX "idx_project_tracks_project_id" ON "public"."project_tracks" USING "btree" ("project_id");



CREATE INDEX "idx_project_tracks_track_id" ON "public"."project_tracks" USING "btree" ("track_id");



CREATE INDEX "idx_role_passwords_event_role" ON "public"."role_passwords" USING "btree" ("event_id", "role");



CREATE INDEX "idx_user_event_roles_event_id" ON "public"."user_event_roles" USING "btree" ("event_id");



CREATE INDEX "idx_user_event_roles_role" ON "public"."user_event_roles" USING "btree" ("role");



CREATE INDEX "idx_user_event_roles_user_id" ON "public"."user_event_roles" USING "btree" ("user_id");



CREATE INDEX "platform_engagement_event_id_idx" ON "public"."platform_engagement" USING "btree" ("event_id");



CREATE INDEX "platform_engagement_type_idx" ON "public"."platform_engagement" USING "btree" ("type");



CREATE INDEX "platform_engagement_user_id_idx" ON "public"."platform_engagement" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_event_tracks_updated_at" BEFORE UPDATE ON "public"."event_tracks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "validate_score_track_id" BEFORE INSERT OR UPDATE ON "public"."project_scores" FOR EACH ROW EXECUTE FUNCTION "public"."validate_score_track_id"();



ALTER TABLE ONLY "public"."event_tracks"
    ADD CONSTRAINT "event_tracks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id");



ALTER TABLE ONLY "public"."project_scores"
    ADD CONSTRAINT "fk_event_id" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_scores"
    ADD CONSTRAINT "fk_project_scores_track" FOREIGN KEY ("track_id") REFERENCES "public"."event_tracks"("track_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."platform_engagement"
    ADD CONSTRAINT "platform_engagement_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id");



ALTER TABLE ONLY "public"."prizes"
    ADD CONSTRAINT "prizes_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."event_tracks"("track_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_scores"
    ADD CONSTRAINT "project_scores_judge_id_fkey" FOREIGN KEY ("judge_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_scores"
    ADD CONSTRAINT "project_scores_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_tracks"
    ADD CONSTRAINT "project_tracks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_tracks"
    ADD CONSTRAINT "project_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "public"."event_tracks"("track_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_passwords"
    ADD CONSTRAINT "role_passwords_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_event_roles"
    ADD CONSTRAINT "user_event_roles_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_event_roles"
    ADD CONSTRAINT "user_event_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_event_roles"
    ADD CONSTRAINT "user_event_roles_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("uid");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow full access for project owners and teammates" ON "public"."project_tracks" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."projects" "p"
  WHERE (("p"."id" = "project_tracks"."project_id") AND (("p"."lead_email" = ("auth"."jwt"() ->> 'email'::"text")) OR ("p"."teammates" @> ARRAY[("auth"."jwt"() ->> 'email'::"text")]))))));



CREATE POLICY "Allow full access for service_role" ON "public"."event_tracks" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow read access for all authenticated users" ON "public"."event_tracks" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow read access for all authenticated users" ON "public"."project_tracks" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."events" FOR SELECT USING (true);



CREATE POLICY "Users can delete their own entries" ON "public"."platform_engagement" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own entries" ON "public"."platform_engagement" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own entries" ON "public"."platform_engagement" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own entries and entries for events they're" ON "public"."platform_engagement" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."event_id" = "platform_engagement"."event_id") AND ("projects"."lead_email" = "auth"."email"()))))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."increment_pulse"("userId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_pulse"("userId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_pulse"("userId" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_tracks_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_tracks_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_tracks_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_score_track_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_score_track_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_score_track_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_track_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_track_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_track_ids"() TO "service_role";


















GRANT ALL ON TABLE "public"."event_tracks" TO "anon";
GRANT ALL ON TABLE "public"."event_tracks" TO "authenticated";
GRANT ALL ON TABLE "public"."event_tracks" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON TABLE "public"."platform_engagement" TO "anon";
GRANT ALL ON TABLE "public"."platform_engagement" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_engagement" TO "service_role";



GRANT ALL ON TABLE "public"."prizes" TO "anon";
GRANT ALL ON TABLE "public"."prizes" TO "authenticated";
GRANT ALL ON TABLE "public"."prizes" TO "service_role";



GRANT ALL ON TABLE "public"."project_scores" TO "anon";
GRANT ALL ON TABLE "public"."project_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."project_scores" TO "service_role";



GRANT ALL ON TABLE "public"."project_tracks" TO "anon";
GRANT ALL ON TABLE "public"."project_tracks" TO "authenticated";
GRANT ALL ON TABLE "public"."project_tracks" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."role_passwords" TO "anon";
GRANT ALL ON TABLE "public"."role_passwords" TO "authenticated";
GRANT ALL ON TABLE "public"."role_passwords" TO "service_role";



GRANT ALL ON TABLE "public"."user_event_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_event_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_event_roles" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
