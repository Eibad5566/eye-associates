import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const SUPABASE_URL = "https://drybyijuwbacrkdseqid.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeWJ5aWp1d2JhY3JrZHNlcWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4ODI1MzksImV4cCI6MjA4MDQ1ODUzOX0.-czxPVRpuCNzMzLauJ_Oq3JJfFCj4CxdasUyChNNTf0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
