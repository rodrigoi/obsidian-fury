import { emailSendTotal, httpCallsTotal } from "@/metrics/client";
import type { CamelCase, TrulyRemoteCategory } from "@/types";

import { db } from "@/data/client";
import { trulyRemote } from "@/data/schema";
import TRNotification from "@/emails/tr-notification";
import { env } from "@/env";
import { resend } from "@/resend/client";
import { TRULY_REMOTE_CATEGORIES } from "@/types";
import { z } from "zod";

export const trulyRemoteResponseSchema = z
  .object({
    records: z.array(
      z.object({
        fields: z.object({
          listingID: z.number(),
          companyName: z.array(z.string()),
          role: z.string(),
          listingSummary: z.optional(z.string()),
          roleCategory: z.array(z.string()),
          useListingRegions: z.optional(z.string()),
          roleApplyURL: z.string().url(),
          createdOn: z.string().datetime({ offset: true }),
        }),
      })
    ),
  })
  .transform((value) => {
    return value.records.map((record) => {
      return {
        listingId: record.fields.listingID,
        companyName: record.fields.companyName[0].trim(),
        title: record.fields.role.trim(),
        description: record.fields.listingSummary,
        category: record.fields.roleCategory[0].trim(),
        regions: record.fields.useListingRegions ?? "",
        url: record.fields.roleApplyURL,
        publishedAt: record.fields.createdOn,
      };
    });
  });

export type TrulyRemoteListings = z.output<typeof trulyRemoteResponseSchema>;

export const fetchListings = async (category: TrulyRemoteCategory) => {
  const response = await fetch("https://trulyremote.co/api/getListing", {
    method: "POST",
    body: JSON.stringify({ locations: [], category: [category] }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  httpCallsTotal.inc({
    worker_name: "truly-remote",
    endpoint: "getListing",
    status_code: response.status.toString(),
    date: new Date().toISOString(),
  });

  const parsedResult = trulyRemoteResponseSchema.safeParse(
    await response.json()
  );

  if (!parsedResult.success) {
    console.error(parsedResult.error);
    return [];
  }

  return parsedResult.data;
};

export const getAllListingIds = async () => {
  const listingIds = await db
    .select({ listingId: trulyRemote.listingId })
    .from(trulyRemote);

  return listingIds.map(({ listingId }) => listingId);
};

export const insertNewListings = async (listings: TrulyRemoteListings) =>
  await db
    .insert(trulyRemote)
    .values(
      listings
        .map((post) => ({
          ...post,
          publishedAt: new Date(post.publishedAt).toISOString(),
        }))
        .reverse()
    )
    .onConflictDoNothing({
      target: [trulyRemote.listingId],
    });

export const toCamelCase = <S extends string>(str: S): CamelCase<S> => {
  return str.replace(/(?:^|_)(\w)/g, (_, letter) =>
    letter.toUpperCase()
  ) as CamelCase<S>;
};

export const sendNewListingsEmail = async (listings: TrulyRemoteListings) => {
  // Group new listings by category
  const listingsByCategory = TRULY_REMOTE_CATEGORIES.reduce(
    (acc, category) => {
      acc[toCamelCase(category) as CamelCase<TrulyRemoteCategory>] =
        listings.filter(
          (listing) => listing.category.toLowerCase() === category.toLowerCase()
        );
      return acc;
    },
    {} as Record<CamelCase<TrulyRemoteCategory>, TrulyRemoteListings>
  );

  // Send email notification of new listings
  await resend.emails.send({
    from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
    to: env.EMAIL_TO.split(","),
    subject: "[Obsidian Romeo] New TrulyRemote.co Job Postings!",
    react: TRNotification(listingsByCategory) as React.ReactElement,
  });

  emailSendTotal.inc({
    worker_name: "truly-remote",
    date: new Date().toISOString().split("T")[0],
  });
};
