import json

workflow_path = r'c:\saas-n8n\n8n\workflow.json'
with open(workflow_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Modify nodes
for node in data['nodes']:
    if node['name'] == 'Set Default Values':
        if 'boolean' not in node['parameters']['values']:
            node['parameters']['values']['boolean'] = []
        node['parameters']['values']['boolean'].append({'name': 'is_freemium_domain', 'value': True})
    
    if node['name'] == 'Normalize Enrichment':
        if 'boolean' not in node['parameters']['values']:
            node['parameters']['values']['boolean'] = []
        node['parameters']['values']['boolean'].append({'name': 'is_freemium_domain', 'value': False})
        
    if node['name'] == 'Route by Intent Score':
        node['name'] = 'Route by Score'
        node['type'] = 'n8n-nodes-base.switch'
        node['parameters'] = {
            "dataType": "string",
            "value1": "={{ ($json.final_score < 50 || $json.is_freemium_domain) ? 'tier3' : ($json.final_score >= 80 ? 'tier1' : 'tier2') }}",
            "rules": {
              "rules": [
                {
                  "operation": "equal",
                  "value2": "tier1"
                },
                {
                  "operation": "equal",
                  "value2": "tier2"
                },
                {
                  "operation": "equal",
                  "value2": "tier3"
                }
              ]
            }
        }

    if node['name'] == 'Gmail — Warm Auto-Reply':
        node['parameters']['message'] = 'Hi {{ $json.name }},<br><br>Thanks for your interest. We help many companies in {{ $json.industry }} optimize their lead generation. Let\'s schedule a call to discuss how our platform can fit your specific needs.<br><br>Best,<br>The Team'

    if node['name'] == 'Set Status':
        node['parameters']['jsCode'] = """const item = $input.item;
const score = Number(item.json.final_score ?? item.json.intent_score) || 50;
const isFreemium = item.json.is_freemium_domain;

let status = "PLG";
if (score >= 80 && !isFreemium) status = "Hot Lead";
else if (score >= 50 && !isFreemium) status = "Nurture";

item.json.status = status;

delete item.json.current_technologies;
delete item.json.intent_reasoning;
delete item.json.is_freemium_domain;

return item;"""

    if node['name'] == 'Upsert Lead to Database':
        node['parameters']['operation'] = 'upsert'
        node['parameters']['matchColumns'] = 'email'

# Add new Gmail node
new_node = {
  "parameters": {
    "sendTo": "={{ $json.email }}",
    "subject": "Thanks for your interest in SaaS Lead Intelligence!",
    "message": "Hi {{ $json.name }},<br><br>Thanks for your interest. Check out our free community edition to get started right away. If your needs change, feel free to reply.<br><br>Best,<br>The Team",
    "options": {}
  },
  "id": "gmail-plg-auto-reply-new-id",
  "name": "Gmail — PLG Auto-Reply",
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2,
  "position": [
    560,
    256
  ],
  "credentials": {
    "gmailOAuth2": {
      "id": "H9wmuBRqVkCi7hB6",
      "name": "Gmail account"
    }
  }
}
data['nodes'].append(new_node)

# Update connections
data['connections']['Calculate Final Combined Score'] = {
  "main": [
    [
      {
        "node": "Route by Score",
        "type": "main",
        "index": 0
      }
    ]
  ]
}

data['connections']['Route by Score'] = {
  "main": [
    [
      {
        "node": "Telegram Alert — Hot Lead",
        "type": "main",
        "index": 0
      }
    ],
    [
      {
        "node": "Gmail — Warm Auto-Reply",
        "type": "main",
        "index": 0
      }
    ],
    [
      {
        "node": "Gmail — PLG Auto-Reply",
        "type": "main",
        "index": 0
      }
    ]
  ]
}

if 'Route by Intent Score' in data['connections']:
    del data['connections']['Route by Intent Score']

data['connections']['Gmail — PLG Auto-Reply'] = {
  "main": [
    [
      {
        "node": "Set Status",
        "type": "main",
        "index": 0
      }
    ]
  ]
}

with open(workflow_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
