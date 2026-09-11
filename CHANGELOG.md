# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
