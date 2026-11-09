# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Repliz Chat**: `Send Message` has a `Reply To Message ID` field (`replyToMessageId`). Put the `messageId` of a message in the chat, from `Get Messages`, to send the message as a reply that shows it quoted. Works with every message type on Facebook, Instagram and Telegram; TikTok replies are `Text` only. A `messageId` that isn't in the chat fails with `message to reply not found`. Messages from `Get Messages` and the `chat` webhook event that reply to another one have `quoted`, a copy of the message they answer.
- Updated `api.json` with `replyToMessageId` on `BodySendMessageDTO`, a `Reply to a Message` example, the `message to reply not found` response, and `quoted` in the `GET /public/chat/{chatId}/message` example.
- **Repliz Addon**: `Get Instagram Profile` returns the profile of an Instagram user who has messaged a connected Instagram account: `name`, `username`, `picture`, `followerCount`, `isFollower` (the user follows the account) and `isFollowing` (the account follows the user). Pass the `Sender ID`, the `senderId` of a chat from Repliz Chat, for example to only send a link to followers. Instagram only returns users who have sent a message to the account; anyone else fails with the error from Instagram.
- Updated `api.json` with `GET /public/addon/instagram/profile`.
- **Repliz Chat**: `Send Message` has two new message types, `Carousel` (`Cards (JSON)`, 1 to 10 cards sent as `carousel.elements`, each with up to 3 buttons) and `Quick Reply` (`Quick Reply Text` and 1 to 13 `Quick Replies` with a title and payload). Facebook and Instagram only.
- **Repliz Chat** and **Repliz Content**: a `Postback` button now has a `Payload` field, sent as `payload`. Before, Repliz only accepted `web_url` buttons, so a postback button was rejected. When the person taps it, your Repliz webhook gets a `postback` event with the value in `message.payload`. A tapped quick reply arrives as a `chat` event with its value in `message.payload`.
- **Repliz Content**: `Message Comment Author` has the same `Carousel` and `Quick Reply` message types as Repliz Chat. `Message Text` is not shown for `Carousel`.
- Updated `api.json` with `postback` and `payload` on `Button`, the `carousel` and `quick_reply` types and `carousel` / `quickReply` fields on `BodySendMessageDTO`, `carousel` / `quickReply` on `BodyMessageCommentDTO` (`ObjectCarousel`, `CarouselElement`, `ObjectQuickReply`, `QuickReplyButton`), and their examples.
- **Repliz Addon**: `Create Pinterest Board`, `Update Pinterest Board` and `Delete Pinterest Board` manage the boards of a connected Pinterest account without opening Pinterest. A new board is public, and `Create Pinterest Board` returns it ready to pass as the schedule board. `Update Pinterest Board` keeps the fields you leave out; an empty `Description` clears it. `Delete Pinterest Board` also deletes every pin in the board, and schedules that still post to it fail.
- **Repliz Addon**: `Get Pinterest Boards` also returns each board's `description` and `pinCount`.
- Updated `api.json` with `POST /public/addon/pinterest/board`, `PUT` and `DELETE /public/addon/pinterest/board/{boardId}` (`BodyCreateUpdatePinterestBoardDTO`), and `description` and `pinCount` on `GET /public/addon/pinterest/board`.
- **Repliz Automation**, **Repliz Account** and **Repliz Template Automation**: an opening's Follow-up Message takes `isTrackLink` (`opening.webUrl.isTrackLink`). With `true`, the links of its buttons and cards are sent as `rplz.link` short links, so their clicks, and who clicked, show up in Repliz under Report → Link Clicks. Instagram and Facebook only.
- Updated `api.json` with `isTrackLink` on `ConfigOpeningWebUrl`.
- **Repliz Account Facebook**: `Get Pages` has a `Next Token` field (`nextToken`). Facebook returns Pages in batches; when the response has a non-empty `nextToken`, run it again with that value to get the next Pages.
- Updated `api.json` with `nextToken` on `GET /public/account/facebook/page`.
- **Repliz Contact** (new node, Standard+): the contacts Repliz creates from everyone who comments on or messages your accounts, as a light CRM. Operations: `Get All` (filter by stage, tag, follow-up, accounts and search), `Count` (per stage, plus due follow-ups), `Get Tags`, `Get`, `Get by Comment`, `Get by Chat`, `Update` (stage, tags and note; fields left out keep their value), `Set Follow-up` (with an optional drafted `Follow-up Message`), `Remove Follow-up` and `Delete`. Follow-ups are reminders in Repliz and send nothing to the contact.
- Updated `api.json` with the Contact API (`/public/contact`).
- **Repliz Schedule**: Added `Privacy (YouTube)` (`additionalInfo.privacy`) field with `Public`, `Unlisted` and `Private`, shown for post type `video` and applied to YouTube schedules. Defaults to `Public`.
- Updated `api.json` with `privacy` on `ScheduleAdditionalInfo` and a `Post with Additional Info Privacy (YouTube)` example, and `README.md` with the new field.
- **Repliz Schedule**: Added `Trial Reel (Instagram)` (`additionalInfo.trialParams.graduationStrategy`) field with `Off`, `Manual` (`MANUAL`) and `Automatic (Performance)` (`SS_PERFORMANCE`), shown for post type `video` and applied to Instagram schedules. A trial reel is shown to non-followers first. Defaults to `Off`.
- Updated `api.json` with `trialParams` on `ScheduleAdditionalInfo` (`ScheduleAdditionalInfoTrialParams`) and a `Post with Additional Info Trial Params (Instagram)` example, and `README.md` with the new field.
- **Repliz Schedule**: Added `Text Attachment (Threads)` (`additionalInfo.textAttachment.text`) and `Text Attachment Link (Threads)` (`additionalInfo.textAttachment.link`) fields, shown for post type `text` and applied to Threads schedules. The text, up to 10,000 characters, is attached under the post and opens like an article. Left empty, no attachment is sent.
- Updated `api.json` from the Public API: `textAttachment` on `ScheduleAdditionalInfo` (`ScheduleAdditionalInfoTextAttachment`), a `Post with Additional Info Text Attachment (Threads)` example, and the field descriptions now shown on every request. Updated `README.md` with the new fields.
- **Repliz Schedule**: each item of `Replies (JSON)` takes `delay`, the minutes it waits after the post before it, so the replies of a Threads or X thread can go out spread over time. `0` or left out posts it right away, as before. A `delay` can't be less than the one of the reply before it, and all of them together can't exceed `1440` (24 hours).
- **Repliz Schedule**: `Retry` on a thread whose main post is published but a reply failed posts only that reply and the ones after it. `Update` and `Retry` fail while a reply is still waiting for its `delay`.
- Updated `api.json` with `delay` on `ScheduleReply`, and `README.md` with a `Replies` example that uses it.
- **Repliz Schedule**: each Threads `text` reply in `Replies (JSON)` can take its own `textAttachment` (`{ "text": "...", "link": "..." }`), like `Text Attachment (Threads)` of the main post. X ignores it.
- Updated `api.json` with `textAttachment` on `ScheduleReply`, and `README.md` with a reply that has one.
- **Repliz Schedule**: `isAiGenerated` in `Additional Info (JSON)` also applies to Threads, for every post type, adding Threads' AI info label to the post and every reply of the thread. The field's description lists the platforms that read it.
- Updated `api.json` with the new `isAiGenerated` description.
- **Repliz Account**: `Get All` has a `Status` filter with `All`, `Connected` and `Disconnected` (`status`), to list only the accounts Repliz can use or only the ones that have to be reconnected.
- **Repliz Account**: `Get Statistics` supports YouTube channels: lifetime subscribers, views, videos and likes (`likesCount`), plus the last 28 days of YouTube Analytics (views, watch time, average view duration, subscribers gained and lost, likes, dislikes, comments, shares) as `summary` and per day in `metrics`. If YouTube Analytics fails, the node fails with YouTube's error.
- Updated `api.json` with `status` on `GET /public/account` and a `YouTube` example on `GET /public/account/{accountId}/statistic`.
- **Repliz Content**: `Get Statistics` of a YouTube video returns `insight` from YouTube Analytics: watch time, average view duration, average percentage viewed, subscribers gained and lost, and shares since upload, daily views and watch time of the last 28 days (`metrics`), and views per traffic source (`trafficSources`). If YouTube Analytics fails, the node fails with YouTube's error.
- Updated `api.json` with a YouTube `insight` example and description on `GET /public/content/{contentId}/statistic`.
- **Repliz Account**: `Get Statistics` of an Instagram account covers the last 30 days instead of the last 24 hours, which were mostly `0`. It also returns `followersCount`, `followingCount`, `mediaCount`, `newFollows`, `unfollows`, the daily reach in `metrics`, and the followers' age, gender, country and city (`audienceAges`, `audienceGenders`, `audienceCountries`, `audienceCities`, as 0-1 shares). Instagram only gives follows and demographics for accounts with at least 100 followers.
- **Repliz Content**: `Get Statistics` of an Instagram post returns `mediaProductType` (`FEED`, `REELS` or `STORY`) and the metrics of that type: `follows`, `profileVisits` and `profileActivity` for posts, `averageWatchTime`, `watchTime` (seconds) and `skipRate` for reels, and `replies` and `navigation` for stories. Stories no longer fail.
- Updated `api.json` with the new Instagram examples and descriptions on `GET /public/account/{accountId}/statistic` and `GET /public/content/{contentId}/statistic`.
- **Repliz Account**: `Get Statistics` of a Threads profile with at least 100 followers returns the followers' age, gender, country and city (`audienceAges`, `audienceGenders`, `audienceCountries`, `audienceCities`, as 0-1 shares). Below 100 followers they are empty.
- **Repliz Account**: `Get Statistics` of a TikTok account covers the last 30 days up to yesterday instead of TikTok's default range.
- **Repliz Account** and **Repliz Content**: the YouTube Analytics numbers of `Get Statistics` are cached for 6 hours, so they can be up to 6 hours old. The channel's and video's own counts stay live.
- Updated `api.json` with a Threads audience example and the Threads, TikTok and YouTube cache descriptions.

### Changed

- **Repliz Automation**, **Repliz Account** and **Repliz Template Automation**: in `Automation Config (JSON)` and `Template Config (JSON)`, each item in `message.keyword.values`, `story.keyword.values` and `chat.keyword.values` can take `"type": "opening"` with its own `opening` flow, to answer that keyword with buttons. `chat` buttons work on Facebook and Instagram. Repliz sets the keyword's `id` and button payloads on save; send `id` back unchanged on update.
- The description of `Automation Config (JSON)` and `Template Config (JSON)` explains keywords with buttons and links to [Keyword with Buttons](https://docs.repliz.com/api/guides/automation-config#keyword-with-buttons).
- Updated `api.json` with `ConfigMessageKeyword` and `ConfigMessageKeywordValue` on `ConfigAutomationMessage`, `ConfigAutomationStory` and `ConfigAutomationChat`, and the `payload` note on `ConfigOpeningButton`.

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
