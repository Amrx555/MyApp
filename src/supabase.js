import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yaqdqwvsvyebncbwltgj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcWRxd3ZzdnllYm5jYndsdGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczODM0OTEsImV4cCI6MjA5Mjk1OTQ5MX0.4s4dTLt-ZXDCXIPfRXZqVQtnfu7MApaOlLRgQs9NNE8";

export const supabase = createClient(supabaseUrl, supabaseKey);
