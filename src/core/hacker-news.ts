import HNNotification from "@/emails/hn-notification";
import { db } from "@/data/client";
import { env } from "@/env";
import { hackernews } from "@/data/schema";
import { resend } from "@/resend/client";
import { z } from "zod";

const storySchema = z
  .object({
    id: z.number(),
    title: z.string(),
    url: z.string().optional(),
    time: z.number(),
  })
  .transform((value) => ({
    id: value.id,
    title: value.title,
    url: value.url ?? `https://news.ycombinator.com/item?id=${value.id}`,
    time: value.time,
  }));

type HackerNewsStory = z.output<typeof storySchema>;

export const getAllStoryIds = async () => {
  const storyIds = await db
    .select({ postId: hackernews.postId })
    .from(hackernews);

  return storyIds.map(({ postId }) => postId);
};

export const fetchStoryIds = async () => {
  const request = await fetch(
    "https://hacker-news.firebaseio.com/v0/jobstories.json"
  );
  return z.array(z.number()).parse(await request.json());
};

export const fetchStories = async (storyIds: number[]) => {
  const stories = await Promise.all(
    storyIds.map(async (storyId: number) => {
      const request = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
      );
      return storySchema.parse(await request.json());
    })
  );

  return stories;
};

export const insertNewStories = async (stories: HackerNewsStory[]) =>
  await db
    .insert(hackernews)
    .values(
      stories
        .map(({ id, title, url, time }) => ({
          postId: id,
          title,
          url,
          publishedAt: new Date(time * 1000).toISOString(),
        }))
        .reverse()
    )
    .onConflictDoNothing({
      target: [hackernews.postId],
    });

export const sendNewStoriesEmail = async (stories: HackerNewsStory[]) =>
  await resend.emails.send({
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
    to: env.EMAIL_TO.split(","),
    subject: "[Obsidian Romeo] New Job Postings on Hacker News!",
    react: HNNotification({ stories }) as React.ReactElement,
  });
