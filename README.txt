Digital Competency 2027 v7.8 - Supabase-only leaderboard

UPLOAD TO GITHUB (replace existing):  index.html, app.js, live-leaderboard.js
DELETE FROM GITHUB:                    leaderboard.js, standalone.html, export-test.json, download
KEEP AS-IS ON GITHUB:                  supabase-config.js (your URL/key), questions.js, styles.css, osd-logo.png
RUN ONCE IN SUPABASE SQL EDITOR:       supabase-migration-v7.8.sql (do NOT upload to GitHub)

Changes
- Supabase is the only permanent store. All legacy local saves are deleted on first load.
- Removed: local leaderboard, resume-a-saved-run, static host entry, JSON-email workflow.
- Browser keeps only unsent results waiting to retry; cleared once saved.
- Leaderboard sorted by points from Supabase; Refresh button; auto-refresh every 30s.
- Backup download + Retry appear only if a save fails.
- Warns before leaving mid-quest, since progress is no longer saved on the device.
- Footer removed, pitch removed from final popup. Questions and scoring unchanged.
