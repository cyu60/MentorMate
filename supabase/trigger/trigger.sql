CREATE TRIGGER sync_user_profiles_trigger
AFTER INSERT OR UPDATE OR DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION sync_user_profiles();
