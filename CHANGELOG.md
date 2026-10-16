# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.22] - 2026-10-16

### Added

- **Repliz Account Pinterest** node (`API Account Pinterest` Gold+), connecting Pinterest via OAuth:
  - `Authorize`: Get the Pinterest OAuth authorization URL (`GET /public/account/pinterest/authorize`).
  - `Connect`: Connect a Pinterest account (`POST /public/account/pinterest/connect`).
  - `Reconnect`: Re-authenticate an existing Pinterest account (`POST /public/account/pinterest/connect/{accountId}`).
- **Repliz Addon**: `Get Pinterest Boards` operation (`GET /public/addon/pinterest/board`) to list the boards of a connected Pinterest account.
- **Repliz Content**: `Channel ID` on `Get All` also takes a Pinterest board ID, to read only that board's pins.

### Changed

- **Repliz Schedule**: `WhatsApp / Telegram Channel (JSON)` is now `WhatsApp / Telegram Channel / Pinterest Board (JSON)` (`additionalInfo.channel`) and is also shown for `Album`. A Pinterest schedule needs a board with `"type": "board"`. `link` in `Additional Info (JSON)` is the pin's destination URL, and `Title` the pin title.
- **Repliz Account**: `Platform Types` filter on `Get All` now also lists Shopee, X (Twitter), WhatsApp, Telegram, and Pinterest.
- Updated `api.json` with the Pinterest endpoints, the `board` channel type and `link` in `ScheduleAdditionalInfo`, and Pinterest statistics on `GET /public/account/{accountId}/statistic` and `GET /public/content/{contentId}/statistic`.

## [1.0.21] - 2026-10-13

### Added

- **Repliz Comment**: `Image URL`, `Image MIME Type`, and `Image Thumbnail URL` on `Reply` to send an image along with the reply text (`image` on `POST /public/comment/{commentId}`).
- **Repliz Content**: The same image fields on `Create Comment` (`image` on `POST /public/content/{contentId}/comment`).
- Images are sent on Facebook, Threads, TikTok, LinkedIn, and X (Twitter), and ignored on other platforms.

### Changed

- Automation configs (`Repliz Automation`, `Repliz Template Automation`, and `Update Automation` on `Repliz Account`) accept `reply.image` (`{ url, mimetype, thumbnail? }`) to send an image with every automated reply on Facebook, Threads, TikTok, and LinkedIn.
- Automation configs accept `reply.isIncludeLiveComment` and `message.isIncludeLiveComment` to also reply to, or DM, comments on an Instagram Live. Off when left out, so Live comments are skipped by default. A DM is only sent while the Live is on air.
- Updated `api.json` with `image` on `BodyCreateCommentDTO`, `BodyReplyCommentDTO`, and `ConfigAutomationReply`, and `isIncludeLiveComment` on `ConfigAutomationReply` and `ConfigAutomationMessage`.

## [1.0.20] - 2026-10-12

### Added

- **Repliz Account Telegram** node (`API Account Telegram` Gold+), connecting Telegram via QR code session:
  - `Create Session`: Create a new Telegram session (`POST /public/account/telegram/session`).
  - `Get Session`: Get session status and the latest QR code (`GET /public/account/telegram/session`).
  - `Send Password`: Send the two-step verification password when `isPasswordRequired` is true (`POST /public/account/telegram/session/password`).
  - `Connect`: Connect a Telegram account (`POST /public/account/telegram/connect`).
  - `Reconnect`: Re-authenticate an existing Telegram account (`POST /public/account/telegram/connect/{accountId}`).
- **Repliz Addon**: `Get Telegram Channels` operation (`GET /public/addon/telegram/channel`) to list the channels and groups of a connected Telegram account.
- **Repliz Content**: `Channel ID` filter on `Get All` (`channelId`), required to read posts of a WhatsApp or Telegram channel.

### Changed

- **Repliz Schedule**: `WhatsApp Channel (JSON)` is now `WhatsApp / Telegram Channel (JSON)` (`additionalInfo.channel`). Leave it empty to post as a WhatsApp Status or Telegram Story. `type` is required for Telegram channels.
- Updated `api.json` with the Telegram endpoints, `channelId` on `GET /public/content`, and automation carousel cards (`ConfigOpeningElement`).

## [1.0.19] - 2026-10-05

### Added

- **Repliz Addon**: `Get WhatsApp Channels` operation (`GET /public/addon/whatsapp/channel`) to list the channels and groups of a connected WhatsApp account.
- **Repliz Schedule**: `WhatsApp Channel (JSON)` field (`additionalInfo.channel`) to post to a WhatsApp channel or group. Leave it empty to post as a WhatsApp Status.

### Changed

- **Repliz Account WhatsApp**: Connection flow is now `Create Session` → loop `Get Session` until `isConnected` → `Connect` / `Reconnect`. The connected account is the WhatsApp number; channels and groups are chosen per schedule.
  - `Connect` (`POST /public/account/whatsapp/connect`) and `Reconnect` (`POST /public/account/whatsapp/connect/{accountId}`) only take the session token. `Connect` returns `{ accountId }`.
- **Repliz Addon**: Endpoints moved under `/public/addon`: `/public/addon/tiktok/music`, `/public/addon/shopee/product`, `/public/addon/link/metadata`.
- Regenerated `api.json` from the Repliz public API.

### Removed

- **Repliz Account WhatsApp**: `Get Channels` operation (`GET /public/account/whatsapp/channel`) and the `Channel ID` parameter of `Connect` / `Reconnect`.

## [1.0.18] - 2026-09-29

### Added

- **Repliz Account WhatsApp** node (`API Account WhatsApp` Gold+), connecting WhatsApp via QR code session:
  - `Create Session`: Create a new WhatsApp session (`POST /public/account/whatsapp/session`).
  - `Get Session`: Get session status and the latest QR code (`GET /public/account/whatsapp/session`).
  - `Get Channels`: Retrieve available WhatsApp accounts, channels, and groups for a session (`GET /public/account/whatsapp/channel`).
  - `Connect`: Connect a WhatsApp account, channel, or group (`POST /public/account/whatsapp/connect`).
  - `Reconnect`: Re-authenticate an existing WhatsApp account (`POST /public/account/whatsapp/connect/{accountId}`).
- Added WhatsApp endpoints and `BodyConnectWhatsAppDTO` schema to `api.json`.
- Documented the WhatsApp QR code connection flow in `README.md`.

## [1.0.17] - 2026-09-14

### Added

- **Repliz Schedule**: Added `Share to Feed (Instagram)` (`additionalInfo.isShareToFeed`) field, specifically enabled and applicable for Instagram schedules with post type `video`.
- Updated OpenAPI specification (`api.json`) schema and `README.md` documentation to include `additionalInfo.isShareToFeed`.

## [1.0.15] - 2026-09-11

### Added

- **Repliz Research**: Added filter and sort query parameters (`sort`, `mode`, `type`, `since`, `until`, `username`) to `Search Threads Content by Keyword` (`GET /public/research/threads/content/search`).
- Updated OpenAPI specification (`api.json`) for `API Search Content Threads` to document the new query parameters.
- Added `PUBLISHING.md` containing manual publishing instructions and disabled CI/CD automatic publishing.

## [1.0.14] - 2026-09-10

### Added

- **Repliz Schedule**: Added `volume` (`video`, `music`) object field to `additionalInfo.music`.
- Updated OpenAPI specification (`api.json`) schemas, request examples, and response examples to include `additionalInfo.music.volume`.

## [1.0.13] - 2026-08-28

### Added

- **Repliz Template Automation** node (`API Template Automation` Gold+):
  - `Get All`: Retrieve all automation templates with optional search filter and pagination.
  - `Create`: Create a new automation template with name and configuration rules.
  - `Get`: Retrieve detailed information of a specific automation template.
  - `Update`: Update an existing automation template configuration.
  - `Delete`: Delete an automation template by ID.
- Added `/public/template` and `/public/template/{templateId}` endpoints to `api.json`.

## [1.0.12] - 2026-08-14

### Added

- **Repliz Content**: Added `Like Comment` operation (`POST /public/content/{contentId}/like/{commentId}`).

## [1.0.11] - 2026-07-28

### Added

- **Repliz Automation** node (`API Automation` Gold+): Get All, Create, Get, Update, Delete.
- **Repliz Report** node (`API Report` Gold+): Get All, Get, Retry background job reports.
- **Repliz Account Twitter** node (`API Account Twitter` Gold+): Authorize, Connect, Reconnect.

## [1.0.10] - 2026-07-21

### Added

- **Repliz Account**: Added `Get Statistics` operation (`GET /public/account/{accountId}/statistic`).

## [1.0.9] - 2026-07-08

### Added

- **Repliz Storage**: Added `Delete Many Files` operation (`DELETE /public/storage/many`).

## [1.0.8] - 2026-07-07

### Added

- **Repliz Storage** node (`API Storage` Storage+): Get Statistics, Get All Files, Get File, Delete File, Initialize Upload, Complete Upload.

## [1.0.7] - 2026-06-13

### Added

- **Repliz Research** node (`API Research` Gold+): Search Threads Content by Keyword, Search Threads Content by User, Search Threads User.

## [1.0.6] - 2026-06-12

### Changed

- Added repository, bugs, and documentation links in `package.json`.

## [1.0.5] - 2026-06-12

### Changed

- Improved CI workflow triggers on push to main branch.

## [1.0.4] - 2026-06-12

### Fixed

- Fixed CI workflow configuration for npm publishing.

## [1.0.3] - 2026-06-12

### Changed

- Restored CI publishing workflow.

## [1.0.2] - 2026-06-12

### Changed

- Refactored monolithic Repliz node into modular individual nodes per API category (Account, Facebook, Instagram, Threads, YouTube, LinkedIn, TikTok, Shopee, Comment, Chat, Content, Schedule, Addon).

## [1.0.0] - 2026-06-06

### Added

- Initial release of Repliz community nodes for n8n.
