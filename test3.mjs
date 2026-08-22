import { createClient } from "@supabase/supabase-js";
const url = "https://gsikqrvtdhlkyqsaccfx.supabase.co";
const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaWtxcnZ0ZGhsa3lxc2FjY2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MjkxODYsImV4cCI6MjEwMDMwNTE4Nn0.V4q_V3Fva-P-xNc1W60XSVPX0zbYiomrF8b6b_lAZ7s";
const supabase = createClient(url, anon);
const channel = supabase
  .channel("test-slot-change-4")
  .on("postgres_changes", { event: "*", schema: "public", table: "slot_change" }, (p) => {
    console.log("RECEIVED EVENT:", JSON.stringify({ type: p.eventType, new: p.new }));
    process.exit(0);
  })
  .subscribe((status) => console.log("SUBSCRIBE STATUS:", status));
setTimeout(() => { console.log("TIMEOUT"); process.exit(1); }, 20000);
