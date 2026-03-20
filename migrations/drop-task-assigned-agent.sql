-- Remove legacy task assignment column; use assigned_to only.
alter table tasks drop column if exists assigned_agent;
