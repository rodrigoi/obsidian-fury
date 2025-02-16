import {
  fetchStories,
  fetchStoryIds,
  getAllStoryIds,
  insertNewStories,
  sendNewStoriesEmail,
} from "@/core/hacker-news";

export default async () => {
  // Get all story IDs from the database
  const storyIds = new Set(await getAllStoryIds());

  // Fetch all story IDs from the Hacker News API
  let newStoryIds = await fetchStoryIds();

  // Filter out any stories that already exist in the database
  newStoryIds = newStoryIds.filter((postId) => !storyIds.has(postId));

  // Bail if there are no new stories
  if (newStoryIds.length === 0) {
    console.log("[Hacker News] No new stories found.");
    process.exit(0);
  }

  // Fetch all new stories from the Hacker News API
  const stories = await fetchStories(newStoryIds);

  console.log(`[Hacker News] Found ${stories.length} new stories.`);

  // Insert new stories into the database
  await insertNewStories(stories);

  // Send email notification of new stories
  await sendNewStoriesEmail(stories);
};
