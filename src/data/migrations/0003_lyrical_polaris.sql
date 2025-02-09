ALTER TABLE `trulyRemote` RENAME TO `truly-remote`;--> statement-breakpoint
DROP INDEX `trulyRemote_listingId_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `truly-remote_listingId_unique` ON `truly-remote` (`listingId`);