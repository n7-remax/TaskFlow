-- Hand-written: Prisma's schema language can't express column collations or CHECK constraints,
-- and neither is part of its drift detection, so they live only in this migration.

-- fractional-indexing compares keys byte-wise ("Z" < "a"). Locale-aware collations such as
-- en_US.UTF-8 don't, which would make ORDER BY rank disagree with the keys the API generates.
-- Changing the type rebuilds tasks_project_id_status_rank_idx with the new collation.
ALTER TABLE "tasks" ALTER COLUMN "rank" SET DATA TYPE TEXT COLLATE "C";

ALTER TABLE "users"
  ADD CONSTRAINT "users_email_lowercase_check" CHECK ("email" = lower("email"));

ALTER TABLE "workspaces"
  ADD CONSTRAINT "workspaces_slug_format_check" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

ALTER TABLE "projects"
  ADD CONSTRAINT "projects_key_format_check" CHECK ("key" ~ '^[A-Z][A-Z0-9]{1,9}$'),
  ADD CONSTRAINT "projects_color_format_check" CHECK ("color" ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT "projects_next_task_number_check" CHECK ("next_task_number" >= 1);

ALTER TABLE "tasks"
  ADD CONSTRAINT "tasks_number_check" CHECK ("number" >= 1),
  ADD CONSTRAINT "tasks_version_check" CHECK ("version" >= 1),
  ADD CONSTRAINT "tasks_rank_not_empty_check" CHECK ("rank" <> ''),
  ADD CONSTRAINT "tasks_completed_at_matches_status_check"
    CHECK (("status" = 'DONE') = ("completed_at" IS NOT NULL));
