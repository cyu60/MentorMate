-- Start a transaction
BEGIN;

-- Set up the environment
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

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- Comment on schema
COMMENT ON SCHEMA "public" IS 'standard public schema';

-- Create functions
CREATE OR REPLACE FUNCTION "public"."increment_pulse"("userId" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE user_profiles 
  SET pulse = COALESCE(pulse, 0) + 1 
  WHERE uid = "userId";
END;
$$;

ALTER FUNCTION "public"."increment_pulse"("userId" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO public.user_profiles (display_name, email, uid)
  VALUES (display_name, email, uid)
  ON CONFLICT (email) DO UPDATE
  SET
      display_name = EXCLUDED.display_name,
      email=EXCLUDED.email;
END;
$$;

ALTER FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") OWNER TO "postgres";

-- Set default tablespace and table access method
SET default_tablespace = '';
SET default_table_access_method = "heap";

-- Create tables
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
    PRIMARY KEY ("event_id")  -- Primary key defined here
);

ALTER TABLE "public"."events" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "mentor_name" "text",
    "mentor_email" "text",
    "feedback_text" "text",
    "created_at" timestamp without time zone DEFAULT now(),
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mentor_id" "uuid",
    "project_id" "uuid",
    "modifier_field" "text"[],
    "specific_ai_suggestion" "text",
    "positive_ai_suggestion" "text",
    "actionable_ai_suggestion" "text",
    "original_feedback_text" "text",
    "event_id" "uuid" NOT NULL,
    PRIMARY KEY ("id")  -- Primary key defined here
);

ALTER TABLE "public"."feedback" OWNER TO "postgres";

COMMENT ON COLUMN "public"."feedback"."modifier_field" IS 'parameter used to augment feedback with AI or ''original'' if no AI suggestions were accepted';

CREATE TABLE IF NOT EXISTS "public"."platform_engagement" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    "display_name" "text",
    "status" "text" DEFAULT 'in_progress'::"text",
    "is_private" boolean DEFAULT false,
    "tags" "text"[],
    PRIMARY KEY ("id"),  -- Primary key defined here
    CONSTRAINT "platform_engagement_status_check" CHECK (("status" = ANY (ARRAY['in_progress'::"text", 'completed'::"text"]))),
    CONSTRAINT "platform_engagement_type_check" CHECK (("type" = ANY (ARRAY['goal'::"text", 'journal'::"text"])))
);

ALTER TABLE "public"."platform_engagement" OWNER TO "postgres";

COMMENT ON COLUMN "public"."platform_engagement"."tags" IS 'only for journal entries';

CREATE TABLE IF NOT EXISTS "public"."projects" (
    "lead_name" "text" NOT NULL,
    "lead_email" "text",
    "project_description" "text",
    "created_at" timestamp without time zone DEFAULT now(),
    "project_name" "text",
    "teammates" "text"[],
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_url" "text",
    "additional_materials_url" "text",
    "event_id" "uuid",
    PRIMARY KEY ("id")
);

ALTER TABLE "public"."projects" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "uid" uuid DEFAULT gen_random_uuid() NOT NULL,
    "display_name" text,
    "email" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "events" uuid[],
    "pulse" bigint DEFAULT 0 NOT NULL,
    PRIMARY KEY ("uid"),
    UNIQUE ("email")
);

ALTER TABLE "public"."user_profiles" OWNER TO "postgres";

COMMENT ON COLUMN "public"."user_profiles"."events" IS 'events user has joined';

-- Add constraints
ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id");

ALTER TABLE ONLY "public"."platform_engagement"
    ADD CONSTRAINT "platform_engagement_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("event_id");

ALTER TABLE ONLY "public"."platform_engagement"
    ADD CONSTRAINT "platform_engagement_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("uid");

-- Create policies
CREATE POLICY "Enable read access for all users" ON "public"."events" FOR SELECT USING (true);

CREATE POLICY "Users can delete their own entries" ON "public"."platform_engagement" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can insert their own entries" ON "public"."platform_engagement" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can update their own entries" ON "public"."platform_engagement" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Users can view their own entries and entries for events they're" ON "public"."platform_engagement" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."event_id" = "platform_engagement"."event_id") AND ("projects"."lead_email" = "auth"."email"()))))));

-- Alter publication
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

-- Grant usage on schema
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

-- Grant permissions on functions
GRANT ALL ON FUNCTION "public"."increment_pulse"("userId" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_pulse"("userId" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_pulse"("userId" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert"("display_name" "text", "email" "text", "uid" "uuid", "full_name" "text") TO "service_role";

-- Grant permissions on tables
GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";

GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";

GRANT ALL ON TABLE "public"."platform_engagement" TO "anon";
GRANT ALL ON TABLE "public"."platform_engagement" TO "authenticated";
GRANT ALL ON TABLE "public"."platform_engagement" TO "service_role";

GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";

GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";

-- Alter default privileges
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

-- Commit the transaction
COMMIT;

-- Reset all settings
RESET ALL;