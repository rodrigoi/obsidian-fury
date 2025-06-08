import {
  fetchListings,
  getAllListingIds,
  insertNewListings,
  sendNewListingsEmail,
} from "@/core/truly-remote";
import {
  newStoriesFound,
  workerErrorsTotal,
  workerExecutionDuration,
  workerExecutionTotal,
} from "@/metrics/client";

import { TRULY_REMOTE_CATEGORIES } from "@/types";

const workerName = "truly-remote";

export default async () => {
  const duration = workerExecutionDuration.startTimer();
  workerExecutionTotal.inc({ worker_name: workerName });

  try {
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
      console.log(new Date(), "[Truly Remote] No new listings found.");
      return;
    }

    newStoriesFound.inc({ worker_name: workerName }, newListings.length);

    console.log(
      new Date(),
      `[Truly Remote] Found ${newListings.length} new listings.`
    );

    // Insert new listings into the database
    await insertNewListings(newListings);

    // Send email notification of new listings
    await sendNewListingsEmail(newListings);
  } catch (error) {
    console.error(error);
    workerErrorsTotal.inc({ worker_name: workerName });
  }

  duration();
};
