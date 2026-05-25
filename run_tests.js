const { createClient } = require('@supabase/supabase-js');


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pgscqbzdnmrbmtaxejdd.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_hklL7X1Lxc6lFd4yyuY8Vg_OugA7UFy';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const testLeads = [
  {
    name: "Enterprise Buyer",
    email: "cto@stripe.com",
    message: "CTO at Fortune 500, need deployment for 2000 seats by Q3"
  },
  {
    name: "Mid-Market",
    email: "founder@linear.app",
    message: "We're a 50-person startup evaluating workflow tools"
  },
  {
    name: "Student",
    email: "student@university.edu",
    message: "Hi, I'm doing a school project on SaaS tools"
  },
  {
    name: "Spam",
    email: "spam@cheapwatches.com",
    message: "Buy cheap watches at www.spam.com"
  },
  {
    name: "Competitor",
    email: "dev@competitor.com",
    message: "We build similar software, curious about your architecture"
  }
];

async function submitLead(lead) {
  try {
    const response = await fetch('http://localhost:3000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    
    const text = await response.text();
    console.log(`[POST] ${lead.name} (${lead.email}) -> Status: ${response.status}, Body: ${text}`);
  } catch (error) {
    console.error(`[POST ERROR] ${lead.name} -> ${error.message}`);
  }
}

async function verifySupabase() {
  console.log("\n--- Checking Supabase Database ---");
  const { data, error } = await supabase
    .from('leads')
    .select('name, email, intent_score, status, reasoning_summary')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) {
    console.error("Supabase Error:", error);
    return;
  }
  
  console.log(`Found ${data.length} recent leads in database.`);
  console.table(data);
}

async function runTests() {
  console.log("Submitting test leads...");
  for (const lead of testLeads) {
    await submitLead(lead);
    // Add small delay to avoid rate limits or overlap
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log("\nWaiting 5 seconds for n8n to process...");
  await new Promise(r => setTimeout(r, 5000));
  
  await verifySupabase();
}

runTests();
