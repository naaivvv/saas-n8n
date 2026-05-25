const fs = require('fs');

const workflowPath = './n8n/workflow.json';
const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

const switchNode = {
  id: "route-by-intent",
  name: "Route by Intent Score",
  type: "n8n-nodes-base.if",
  typeVersion: 1,
  position: [ 1450, 300 ],
  parameters: {
    conditions: {
      number: [
        {
          value1: "={{ $json.intent_score }}",
          operation: "larger",
          value2: 80
        }
      ]
    }
  }
};

const telegramNode = {
  id: "telegram-alert",
  name: "Telegram Alert — Hot Lead",
  type: "n8n-nodes-base.httpRequest",
  typeVersion: 3,
  position: [ 1650, 200 ],
  parameters: {
    method: "POST",
    url: "=https://api.telegram.org/bot{{ $env.TELEGRAM_BOT_TOKEN }}/sendMessage",
    sendBody: true,
    specifyBody: "json",
    jsonBody: "={\n  \"chat_id\": \"{{ $env.TELEGRAM_CHAT_ID }}\",\n  \"text\": \"🔥 *Hot Lead Alert* — Score: {{ $json.intent_score }}\\n\\n*Name:* {{ $json.name }}\\n*Email:* {{ $json.email }}\\n*Company:* {{ $json.company_name }}\\n*Employees:* {{ $json.employee_count }}\\n*Industry:* {{ $json.industry }}\\n*Revenue:* {{ $json.estimated_revenue }}\\n\\n*AI Reasoning:* {{ $json.reasoning_summary }}\",\n  \"parse_mode\": \"Markdown\"\n}",
    options: {}
  }
};

const gmailNode = {
  id: "gmail-auto-reply",
  name: "Gmail — Warm Auto-Reply",
  type: "n8n-nodes-base.gmail",
  typeVersion: 2,
  position: [ 1650, 400 ],
  parameters: {
    resource: "message",
    operation: "send",
    sendTo: "={{ $json.email }}",
    subject: "Thanks for your interest in SaaS Lead Intelligence!",
    message: "Hi {{ $json.name }},<br><br>Thanks for your interest. Check out our <a href=\"#\">Self-serve Docs</a> or explore our Starter and Pro tiers. If your needs change, feel free to reply to schedule a follow-up.<br><br>Best,<br>The Team"
  }
};

const mergeNode = {
  id: "merge-paths",
  name: "Merge Paths",
  type: "n8n-nodes-base.merge",
  typeVersion: 2,
  position: [ 1850, 300 ],
  parameters: {
    mode: "append"
  }
};

const setStatusNode = {
  id: "set-status",
  name: "Set Status",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [ 2050, 300 ],
  parameters: {
    mode: "runOnceForEachItem",
    jsCode: "const score = $input.item.json.intent_score || 50;\nlet status = \"Cold\";\nif (score > 80) status = \"Hot Lead\";\nelse if (score >= 50) status = \"Warm\";\n$input.item.json.status = status;\nreturn $input.item;"
  }
};

const supabaseNode = {
  id: "supabase-insert",
  name: "Upsert Lead to Database",
  type: "n8n-nodes-base.supabase",
  typeVersion: 1,
  position: [ 2250, 300 ],
  parameters: {
    operation: "insert",
    table: "leads",
    dataMode: "defineBelow",
    valuesToSend: {
      values: [
        { name: "name", value: "={{ $json.name }}" },
        { name: "email", value: "={{ $json.email }}" },
        { name: "company_name", value: "={{ $json.company_name }}" },
        { name: "company_domain", value: "={{ $json.company_domain }}" },
        { name: "employee_count", value: "={{ $json.employee_count }}" },
        { name: "industry", value: "={{ $json.industry }}" },
        { name: "estimated_revenue", value: "={{ $json.estimated_revenue }}" },
        { name: "original_message", value: "={{ $json.original_message }}" },
        { name: "intent_score", value: "={{ $json.intent_score }}" },
        { name: "reasoning_summary", value: "={{ $json.reasoning_summary }}" },
        { name: "status", value: "={{ $json.status }}" }
      ]
    }
  },
  credentials: {
    supabaseApi: {
      id: "1",
      name: "Supabase account"
    }
  }
};

workflow.nodes.push(switchNode, telegramNode, gmailNode, mergeNode, setStatusNode, supabaseNode);

workflow.connections["Validate LLM Output"] = {
  main: [
    [
      {
        node: "Route by Intent Score",
        type: "main",
        index: 0
      }
    ]
  ]
};

workflow.connections["Route by Intent Score"] = {
  main: [
    [
      {
        node: "Telegram Alert — Hot Lead",
        type: "main",
        index: 0
      }
    ],
    [
      {
        node: "Gmail — Warm Auto-Reply",
        type: "main",
        index: 0
      }
    ]
  ]
};

workflow.connections["Telegram Alert — Hot Lead"] = {
  main: [
    [
      {
        node: "Merge Paths",
        type: "main",
        index: 0
      }
    ]
  ]
};

workflow.connections["Gmail — Warm Auto-Reply"] = {
  main: [
    [
      {
        node: "Merge Paths",
        type: "main",
        index: 1
      }
    ]
  ]
};

workflow.connections["Merge Paths"] = {
  main: [
    [
      {
        node: "Set Status",
        type: "main",
        index: 0
      }
    ]
  ]
};

workflow.connections["Set Status"] = {
  main: [
    [
      {
        node: "Upsert Lead to Database",
        type: "main",
        index: 0
      }
    ]
  ]
};

fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
console.log("Updated workflow.json");
