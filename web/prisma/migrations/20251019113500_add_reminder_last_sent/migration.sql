-- SQLite: add reminderLastSentAt column
ALTER TABLE Profile ADD COLUMN reminderLastSentAt DATETIME;
