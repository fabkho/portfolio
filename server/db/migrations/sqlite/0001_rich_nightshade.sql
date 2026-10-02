CREATE TABLE `view_salts` (
	`day` text PRIMARY KEY NOT NULL,
	`salt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `view_visits` (
	`hash` text PRIMARY KEY NOT NULL,
	`day` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `view_visits_day_idx` ON `view_visits` (`day`);