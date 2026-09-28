import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ridvtqpclbwpwszhitsd.supabase.co";
const supabaseKey = "sb_publishable_sRDoOrmtFHiqU3O02t3hCw_ntGWv7-W";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  const { data, error } = await supabase.from("restaurants").select("*").limit(1);
  if (error) {
    console.error("Connection failed:", error.message);
  } else {
    console.log("Connection successful! Data:", data);
  }
}

checkConnection();
