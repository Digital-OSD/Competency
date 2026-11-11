Digital Competency 2027 v7.7 - Supabase pilot
Built from supplied v7.5 source with v7.6 footer/pitch/branch fixes reapplied.
1. Create a dedicated Supabase project. Obtain approval before using real associate data.
2. Run supabase-setup.sql once in SQL Editor.
3. Enable Anonymous Sign-Ins in Authentication settings.
4. Edit supabase-config.js: enabled true, project URL, publishable key only.
5. Upload website files to GitHub Pages. SQL/README need not be published.
6. Test completion on one device and leaderboard on another.
The GitHub account connection alone does not configure this game.
30-second polling, not Supabase Realtime. SDK loaded from CDN; internet required for cloud sync.
Standalone preview has embedded config: edit it separately or use hosted index.html.
Anonymous users are not verified employees. Anyone able to create an anonymous session can read names and scores and submit their own rows. Use test aliases until approved; add verified authentication and abuse controls before restricted production use.
Scores are client supplied, not server verified. Run IDs prevent retry duplicates, not repeat players/new runs.
Existing historical local entries are not automatically uploaded. Completing or viewing final results queues the current run.
Local/published host entries remain visible; cloud rows override same run IDs. Host 1100-point entry stays local/published, not submitted.
Pending retries require browser data and the game to be open. Clearing browser data can lose pending results.
Syntax and mock integration checks only; no live project credentials available for end-to-end verification.
