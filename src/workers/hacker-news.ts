import {
  fetchStories,
  fetchStoryIds,
  getAllStoryIds,
  insertNewStories,
  sendNewStoriesEmail,
} from "@/core/hacker-news";
import {
  dbOperationDuration,
  emailSendDuration,
  emailSendErrors,
  emailSendTotal,
  newStoriesFound,
  workerErrorsTotal,
  workerExecutionDuration,
  workerExecutionTotal,
} from "@/metrics/client";

const workerName = "hacker-news";

export default async () => {
  const duration = workerExecutionDuration.startTimer();
  workerExecutionTotal.inc({ worker_name: workerName });
  try {
    // Get all story IDs from the database
    const storyIds = new Set(await getAllStoryIds());

    // Fetch all story IDs from the Hacker News API
    let newStoryIds = await fetchStoryIds();

    // Filter out any stories that already exist in the database
    newStoryIds = newStoryIds.filter((postId) => !storyIds.has(postId));

    // Bail if there are no new stories
    if (newStoryIds.length === 0) {
      console.log(new Date(), "[Hacker News] No new stories found.");
      return;
    }

    // Fetch all new stories from the Hacker News API
    const stories = await fetchStories(newStoryIds);

    console.log(
      new Date(),
      `[Hacker News] Found ${stories.length} new stories.`
    );

    newStoriesFound.inc({ worker_name: workerName }, stories.length);

    // Insert new stories into the database
    await insertNewStories(stories);

    // Send email notification of new stories
    await sendNewStoriesEmail(stories);
  } catch (error) {
    console.error(error);
    workerErrorsTotal.inc({ worker_name: workerName });
  }

  duration({ worker_name: workerName });
};
