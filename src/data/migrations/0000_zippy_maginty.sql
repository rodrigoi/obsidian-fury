CREATE TABLE `trulyRemote` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`listingId` integer NOT NULL,
	`companyName` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`regions` text,
	`url` text NOT NULL,
	`publishedAt` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
