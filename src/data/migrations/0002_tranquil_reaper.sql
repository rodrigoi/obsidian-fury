CREATE TABLE `hackernews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`postid` integer NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`publishedat` text NOT NULL,
	`createdat` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
