# n8n-nodes-repliz

An n8n community node package for the [Repliz](https://repliz.com) API.

Repliz is a social media management platform that centralizes comment moderation, live chat, post scheduling, and analytics across multiple platforms in one dashboard.

---

## Nodes

This package provides 21 nodes, each mapped to a specific Repliz API group:

### Account Management

**Repliz Account** `Standard+`
Manage connected workspace accounts. Operations: Get All, Count, Get, Get Statistics, Update Automation, Delete.

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

**Repliz Account Twitter** `Gold+`
Connect and authenticate Twitter/X accounts. Operations: Authorize, Connect, Reconnect.

**Repliz Account WhatsApp** `Gold+`
Connect and authenticate WhatsApp accounts via QR code. Operations: Create Session, Get Session, Connect, Reconnect.

**Repliz Account Telegram** `Gold+`
Connect and authenticate Telegram accounts via QR code, including two-step verification. Operations: Create Session, Get Session, Send Password, Connect, Reconnect.

**Repliz Account Pinterest** `Gold+`
Connect and authenticate Pinterest accounts. Operations: Authorize, Connect, Reconnect. Boards are not separate accounts: pick one per schedule.

---

### Comment & Chat

**Repliz Comment** `Standard+`
Manage and moderate comments collected by Repliz. Operations: Get All, Get, Delete, Reply, Update Status. Reply can send an image along with the text (`Image URL` and `Image MIME Type`) on Facebook, Threads, TikTok, LinkedIn, and X (Twitter).

**Repliz Chat** `Gold+`
Manage live chat conversations and messages. Operations: Get All, Get, Get Messages, Send Message, Mark as Read.

---

### Content, Scheduling & Automation

**Repliz Content** `Gold+`
Retrieve and interact with published social media content. Operations: Get All, Get, Delete, Get Comments, Create Comment, Delete Comment, Like Comment, Get Statistics, Message Comment Author. For WhatsApp and Telegram accounts, Get All needs a `Channel ID` from `Repliz Addon`. Create Comment can send an image along with the text on Facebook, Threads, TikTok, LinkedIn, and X (Twitter).

**Repliz Schedule** `Premium+`
Create and manage scheduled posts across platforms.
Operations: Get All, Get, Create, Update, Delete, Delete Many, Retry.

Supported post types: Text, Image, Video, Reel, Album, Link, Story.

**Repliz Automation** `Gold+`
Create and manage content automation rules. Operations: Get All, Create, Get, Update, Delete.

**Repliz Template Automation** `Gold+`
Create and manage reusable automation templates. Operations: Get All, Create, Get, Update, Delete.

---

### Research & Reports

**Repliz Research** `Gold+`
Discover and analyze social media content and profiles from external accounts. Useful for competitor research, trend monitoring, and audience insights.
Operations: Search Threads Content by Keyword (with sort, mode, media type, date range, and author filters), Search Threads Content by User, Search Threads User.

**Repliz Report** `Gold+`
View and retry background job execution reports. Operations: Get All, Get, Retry.

---

### Storage

**Repliz Storage** `Storage+`
Manage files in Repliz cloud storage. Upload media assets for use in scheduled posts, retrieve file info, and free up space by deleting unused files.
Operations: Get Statistics, Get All Files, Get File, Delete File, Initialize Upload, Complete Upload.

---

### Addons

**Repliz Addon** `Premium+`
Access premium platform features. Operations: Get Addon Allocation, Get TikTok Trending Music, Get Shopee Products, Get WhatsApp Channels, Get Telegram Channels, Get Pinterest Boards, Get Link Metadata.

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

| Field        | Required | Description                          |
| ------------ | -------- | ------------------------------------ |
| Access Key   | Yes      | Your Repliz API access key           |
| Secret Key   | Yes      | Your Repliz API secret key           |
| API Base URL | No       | Defaults to `https://api.repliz.com` |

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

**Additional Info** — Tags, mentions, music, products, collaborators, Instagram share-to-feed and trial reel options, and YouTube privacy:

```json
{
  "isAiGenerated": false,
  "isDraft": false,
  "isShareToFeed": false,
  "privacy": "public",
  "trialParams": { "graduationStrategy": "" },
  "tags": ["marketing"],
  "mentions": ["replizofficial"],
  "collaborators": [],
  "products": [],
  "music": {
    "id": "",
    "artist": "",
    "name": "",
    "thumbnail": "",
    "volume": { "video": 50, "music": 100 }
  },
  "link": ""
}
```

**WhatsApp / Telegram Channel / Pinterest Board** — For WhatsApp and Telegram (Text, Image, Video), pass an item from `Repliz Addon` → **Get WhatsApp Channels** or **Get Telegram Channels** to post to that channel or group; it is sent as `additionalInfo.channel`. Leave it `{}` to post as a WhatsApp Status or Telegram Story. To post to several channels or groups, create one schedule per item (e.g. `Split Out` the `docs` field first). Keep `type` for Telegram: its channel and group IDs (`-100...`) look the same.

```json
{
  "id": "120363413774168194@newsletter",
  "name": "Boom",
  "picture": "https://pps.whatsapp.net/...",
  "type": "channel"
}
```

**Pinterest Board** — Pinterest schedules (Image, Video, Album) always need a board. Pass an item from `Repliz Addon` → **Get Pinterest Boards** in the same **WhatsApp / Telegram Channel / Pinterest Board** field, with `"type": "board"`; create one schedule per board. The **Title** is the pin title (max 100 characters), the caption max 800 characters, `medias[0].alt` the alt text, and `link` in **Additional Info** the destination URL the pin opens. An album is a carousel of 2 to 5 images.

```json
{
  "id": "1006921296753698211",
  "name": "Social Media Tips",
  "picture": "https://i.pinimg.com/400x300/...",
  "type": "board"
}
```

**YouTube Privacy** — For YouTube videos, the **Privacy (YouTube)** field sets who can watch the video: `Public` (default), `Unlisted` (only people with the link), or `Private` (only the channel owner). It is sent as `additionalInfo.privacy`. Private videos are not listed in Repliz Content, so their automation and statistics do not run.

**Instagram Trial Reel** — For Instagram videos (Reels), the **Trial Reel (Instagram)** field posts the Reel as a trial reel, shown to non-followers first: `Manual` (`MANUAL`, you share it with your followers from the Instagram app) or `Automatic (Performance)` (`SS_PERFORMANCE`, Instagram shares it with your followers if it performs well). It is sent as `additionalInfo.trialParams.graduationStrategy`. `Off` (default) posts a regular Reel.

**Threads Text Attachment** — For Threads text posts, the **Text Attachment (Threads)** field attaches a long text, up to 10,000 characters, under the post. It opens like an article, so the post can say more than the 500-character caption. **Text Attachment Link (Threads)** adds an optional link at its end. They are sent as `additionalInfo.textAttachment.text` and `additionalInfo.textAttachment.link`, on the main post only, and the text is posted without styles. Leave the text empty for no attachment.

### WhatsApp — QR Code Connection Flow

WhatsApp uses a QR code session instead of an OAuth redirect. Build the flow with `Repliz Account WhatsApp`:

1. **Create Session** — creates a new session and returns `{ "token": "..." }`. This session token is used by every following step.
2. **Get Session** (loop) — call it with the session token, then `IF` `isConnected` is `true` go to step 3, otherwise `Wait` a few seconds and run Get Session again. Each run returns the latest `qrcode` (base64 PNG) to scan from WhatsApp > Linked Devices; use n8n's `Convert to File` node to turn it into an image. Cap the number of loops and start a new session if it never connects.
3. **Connect** / **Reconnect** — pass the session token. Connect returns `{ "accountId": "..." }`. Reconnect re-authenticates an existing Repliz `Account ID`; the scanned WhatsApp number must be the same one.

Channels and groups are not connected as separate accounts. To post to one, use the **WhatsApp / Telegram Channel / Pinterest Board** field of `Repliz Schedule` (see above).

### Telegram — QR Code Connection Flow

Telegram follows the same session flow with `Repliz Account Telegram`, plus a password step for accounts with two-step verification:

1. **Create Session** — returns `{ "token": "..." }`, the session token for every following step.
2. **Get Session** (loop) — same loop as WhatsApp until `isConnected` is `true`. Scan the `qrcode` from Telegram > Settings > Devices > Link Desktop Device; it changes every 30 seconds.
3. **Send Password** — only when Get Session returns `isPasswordRequired: true`. Send the account's two-step verification password (`passwordHint` is its hint), then keep looping Get Session. A wrong password returns `400`.
4. **Connect** / **Reconnect** — pass the session token. Connect returns `{ "accountId": "..." }`; Reconnect needs the same Telegram account as the existing Repliz `Account ID`.

Like WhatsApp, Telegram channels and groups are chosen per schedule with the **WhatsApp / Telegram Channel / Pinterest Board** field.

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

## Publishing

Untuk panduan cara mempublikasikan versi baru package ke NPM secara manual, silakan baca [PUBLISHING.md](PUBLISHING.md).

---

## License

[MIT](LICENSE)
