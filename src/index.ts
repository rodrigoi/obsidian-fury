import {
  fetchListings,
  getAllListingIds,
  insertNewListings,
  sendNewListingsEmail,
} from "@/core/truly-remote";

import { TRULY_REMOTE_CATEGORIES } from "./types";

// Fetch all listings for each category
const categoryListings = await Promise.all(
  TRULY_REMOTE_CATEGORIES.map((category) => fetchListings(category))
);

// Get all listing IDs from the database
const listingIds = new Set(await getAllListingIds());

// Filter out any listings that already exist in the database
const newListings = categoryListings
  .flat()
  .filter(({ listingId }) => !listingIds.has(listingId));

// Bail if there are no new listings
if (newListings.length === 0) {
  console.log("No new listings found.");
  process.exit(0);
}

// Insert new listings into the database
await insertNewListings(newListings);

// Send email notification of new listings
await sendNewListingsEmail(newListings);
