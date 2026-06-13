# n8n-nodes-repliz

An n8n community node package for the [Repliz](https://repliz.com) API.

Repliz is a social media management platform that centralizes comment moderation, live chat, post scheduling, and analytics across multiple platforms in one dashboard.

---

## Nodes

This package provides 14 nodes, each mapped to a specific Repliz API group:

### Account Management

**Repliz Account** `Standard+`
Manage connected workspace accounts. Operations: Get All, Count, Get, Delete.

**Repliz Account Facebook** `Gold+`
Connect and authenticate Facebook pages. Operations: Authorize, Get Pages, Exchange Token, Connect, Reconnect.

**Repliz Account Instagram** `Gold+`
Connect and authenticate Instagram accounts. Operations: Authorize, Connect, Reconnect.

**Repliz Account Threads** `Gold+`
Connect and authenticate Threads accounts. Operations: Authorize, Connect, Reconnect.

**Repliz Account YouTube** `Gold+`
Connect and authenticate YouTube channels. Operations: Authorize, Get Channels, Exchange Token, Connect, Reconnect.

**Repliz Account LinkedIn** `Gold+`
Connect and authenticate LinkedIn organizations. Operations: Authorize, Get Organization, Exchange Token, Connect, Reconnect.

**Repliz Account TikTok** `Gold+`
Connect and authenticate TikTok accounts. Operations: Authorize, Connect, Reconnect.

**Repliz Account Shopee** `Gold+`
Connect and authenticate Shopee shops. Operations: Authorize, Connect, Reconnect.

---

### Comment & Chat

**Repliz Comment** `Standard+`
Manage and moderate comments collected by Repliz. Operations: Get All, Get, Reply, Update Status.

**Repliz Chat** `Gold+`
Manage live chat conversations and messages. Operations: Get All, Get, Get Messages, Send Message, Mark as Read.

---

### Content & Scheduling

**Repliz Content** `Gold+`
Retrieve and interact with published social media content. Operations: Get All, Get, Get Comments, Create Comment, Delete Comment, Get Statistics, Message Comment Author.

**Repliz Schedule** `Premium+`
Create and manage scheduled posts across platforms.
Operations: Get All, Get, Create, Update, Delete, Delete Many, Retry.

Supported post types: Text, Image, Video, Reel, Album, Link, Story.

---

### Research

**Repliz Research** `Gold+`
Discover and analyze social media content and profiles from external accounts. Useful for competitor research, trend monitoring, and audience insights.
Operations: Search Threads Content by Keyword, Search Threads Content by User, Search Threads User.

---

### Addons

**Repliz Addon** `Premium+`
Access premium platform features. Operations: Get TikTok Trending Music, Get Shopee Products, Get Link Metadata.

---

## Installation

### Via n8n UI (Self-Hosted)

1. Go to **Settings > Community Nodes**.
2. Click **Install a new node**.
3. Enter `n8n-nodes-repliz` and click **Install**.
4. Restart n8n if prompted.

### Manual

```bash
npm install n8n-nodes-repliz
```

---

## Credentials

All nodes require a **Repliz API** credential with the following fields:

| Field | Required | Description |
|---|---|---|
| Access Key | Yes | Your Repliz API access key |
| Secret Key | Yes | Your Repliz API secret key |
| API Base URL | No | Defaults to `https://api.repliz.com` |

To obtain your API keys, log in to your Repliz dashboard and navigate to **Settings > API**.

---

## Usage Notes

### Schedule — Payload Fields

The **Create** and **Update** operations on `Repliz Schedule` accept several JSON fields:

**Medias** — Array of media objects to attach:
```json
[
  {
    "type": "image",
    "url": "https://storage.repliz.com/image.png",
    "thumbnail": "https://storage.repliz.com/thumb.png",
    "alt": ""
  }
]
```

**Replies** — Array of auto-comments to post after publishing:
```json
[
  {
    "type": "text",
    "description": "Thanks for watching!"
  }
]
```

**Additional Info** — Tags, mentions, music, products, and collaborators:
```json
{
  "isAiGenerated": false,
  "isDraft": false,
  "tags": ["marketing"],
  "mentions": ["replizofficial"],
  "collaborators": [],
  "products": [],
  "music": { "id": "", "artist": "", "name": "", "thumbnail": "" },
  "link": ""
}
```

---

## Local Development

```bash
git clone https://github.com/azickri/repliz-n8n.git
cd n8n-nodes-repliz
npm install
npm run build
```

To test locally with an n8n instance:

```bash
npm link
# In your n8n directory:
npm link n8n-nodes-repliz
```

---

## License

[MIT](LICENSE)
