# n8n-nodes-repliz

This is an n8n community node that integrates with the [Repliz API](https://api.repliz.com).

Repliz is a smart comment, messaging, and post-scheduling platform designed to manage multiple social channels in one centralized dashboard. This integration allows you to automate comment moderation, direct messaging, schedule rich media posts, retrieve channel analytics, and fetch Shopee products.

---

## Features

### 👤 Account Management
- **Get Many / Get**: List and inspect connected workspace profiles.
- **Statistics**: Retrieve global usage metrics across all platforms.
- **Delete**: Unlink any platform account.
- **Social Connect & OAuth (FB, IG, YouTube, LinkedIn, Threads, TikTok, Shopee)**: 
  - Retrieve auth URLs.
  - Exchange authorization codes for long-lived tokens.
  - Connect and reconnect pages, channels, and shops.

### 💬 Live Chat
- **Get Many / Get**: Monitor live conversations.
- **Get Messages**: Fetch conversation history.
- **Send Message**: Send raw texts, media payloads (Images, Videos, Audios, Documents), and interactive buttons.
- **Mark Read**: Clear read counts programmatically.

### 📝 Comment Management
- **Get Many / Get**: Retrieve stored comments with filters (status, accounts, search).
- **Reply**: Post automated comment responses.
- **Update Status**: Set status (pending, resolved, ignored).

### 📱 Content & Analytics
- **Get Many / Get**: Track published content.
- **Get Comments**: Retrieve engagement lists for a post.
- **Create Comment**: Comment directly under a platform post.
- **Get Statistics**: Fetch view, reach, like, and share analytics.
- **Delete Comment**: Remove comments from posts.
- **Message Comment**: Direct message comment authors.

### 📅 Post Scheduling
- **Get Many / Get / Delete / Delete Many**: Manage schedules.
- **Create / Update**: Queue upcoming posts (supporting Text, Image, Video, Reels, Albums, Links, Stories) with automatic follow-up comment configurations.
- **Retry**: Force reprocessing of a failed schedule.

### 🔗 Link Metadata
- **Get Metadata**: Extract URL preview details (title, description, image) for social publishing.

### 🛍️ Shopee Integration
- **Get Products**: Fetch shop products to reference in posts.

### 🎵 TikTok Integration
- **Get Trending Music**: Find trending audio tracks by genre and country.

---

## Installation

### In n8n (UI)
1. Go to **Settings > Community Nodes**.
2. Click **Install a new node**.
3. Enter `n-nodes-repliz` or the published NPM package name.
4. Agree to terms and click **Install**.

### Manual Installation
In your self-hosted n8n installation directory, install the package:
```bash
npm install n8n-nodes-repliz
```
Restart n8n to load the node.

---

## Credentials Setup

To use the Repliz node, you need to configure your Basic Authentication credentials:
1. **Access Key**: Your Repliz API Access Key.
2. **Secret Key**: Your Repliz API Secret Key.
3. **API Base URL** (Optional): Defaults to `https://api.repliz.com`.

---

## Detailed Operations

### Post Scheduling Payload Structures
For advanced scheduling (`Create` or `Update` operations), the node uses JSON editors for nested parameters to keep the UI clean:

#### 1. Medias (JSON)
Specifies the media assets to attach to the scheduled post.
```json
[
  {
    "type": 0,
    "url": "https://storage.repliz.com/image.jpg",
    "alt": "An optional alt text for accessibility"
  }
]
```
*(Use `type: 0` for images, and `type: 1` for videos).*

#### 2. Replies (JSON)
Enables you to schedule automatic comments/replies underneath your scheduled post once it goes live.
```json
[
  {
    "title": "Welcome Reply",
    "description": "Thanks for checking out our page!",
    "topic": "Welcome",
    "type": "text",
    "medias": []
  }
]
```

#### 3. Additional Info (JSON)
Configure tags, mentions, co-authors, product attachments, and audio tracks.
```json
{
  "isAiGenerated": false,
  "isDraft": false,
  "tags": ["marketing", "ai"],
  "mentions": ["replizofficial"],
  "collaborators": [],
  "link": "https://repliz.com"
}
```

---

## Local Development & Contribution

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/repliz-n8n.git
   cd repliz-n8n
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile TypeScript files:
   ```bash
   npm run build
   ```
4. Link the node pack to your local n8n setup:
   ```bash
   npm link
   ```
   *(Then in your local n8n directory)*
   ```bash
   npm link n8n-nodes-repliz
   ```

## License
[MIT](LICENSE)
