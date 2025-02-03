import TRNotification from "./emails/tr-notification";
import { db } from "./data/client";
import { env } from "@/env";
import { resend } from "./resend/client";
import { trulyRemote } from "./data/schema";
import { z } from "zod";

const trulyRemoteResponseSchema = z
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

type TrulyRemoteListings = z.output<typeof trulyRemoteResponseSchema>;

const getAllListingIds = async () => {
  const listingIds = await db
    .select({ listingId: trulyRemote.listingId })
    .from(trulyRemote);

  return listingIds.map(({ listingId }) => listingId);
};

const results = await Promise.all([
  fetch("https://trulyremote.co/api/getListing", {
    method: "POST",
    body: JSON.stringify({ locations: [], category: ["Development"] }),
    headers: {
      "Content-Type": "application/json",
    },
  }),
  fetch("https://trulyremote.co/api/getListing", {
    method: "POST",
    body: JSON.stringify({ locations: [], category: ["Marketing"] }),
    headers: {
      "Content-Type": "application/json",
    },
  }),
  fetch("https://trulyremote.co/api/getListing", {
    method: "POST",
    body: JSON.stringify({ locations: [], category: ["Product"] }),
    headers: {
      "Content-Type": "application/json",
    },
  }),
  fetch("https://trulyremote.co/api/getListing", {
    method: "POST",
    body: JSON.stringify({ locations: [], category: ["Business"] }),
    headers: {
      "Content-Type": "application/json",
    },
  }),
  fetch("https://trulyremote.co/api/getListing", {
    method: "POST",
    body: JSON.stringify({ locations: [], category: ["Sales"] }),
    headers: {
      "Content-Type": "application/json",
    },
  }),
  fetch("https://trulyremote.co/api/getListing", {
    method: "POST",
    body: JSON.stringify({
      locations: [],
      category: ["Customer Service"],
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }),
]);

const [
  developmentListings,
  marketingListings,
  productListings,
  businessListings,
  salesListings,
  customerServiceListings,
] = await Promise.all(
  results.map(async (result) => {
    const parsedResult = trulyRemoteResponseSchema.safeParse(
      await result.json()
    );

    if (!parsedResult.success) {
      console.error(parsedResult.error);
      return [];
    }

    return parsedResult.data;
  })
);

const listingIds = new Set(await getAllListingIds());

const newListings = [
  ...developmentListings,
  ...marketingListings,
  ...productListings,
  ...businessListings,
  ...salesListings,
  ...customerServiceListings,
].filter(({ listingId }) => !listingIds.has(listingId));

const [development, marketing, product, business, sales, customerService] = [
  newListings.filter(
    ({ category }) => category.toLowerCase() === "development"
  ),
  newListings.filter(({ category }) => category.toLowerCase() === "marketing"),
  newListings.filter(({ category }) => category.toLowerCase() === "product"),
  newListings.filter(({ category }) => category.toLowerCase() === "business"),
  newListings.filter(({ category }) => category.toLowerCase() === "sales"),
  newListings.filter(
    ({ category }) => category.toLowerCase() === "customer service"
  ),
] as TrulyRemoteListings[];

if (
  development.length === 0 &&
  marketing.length === 0 &&
  product.length === 0 &&
  business.length === 0 &&
  sales.length === 0 &&
  customerService.length === 0
) {
  console.log("No new listings found.");
  process.exit(0);
}

await db
  .insert(trulyRemote)
  .values(
    [
      ...development,
      ...marketing,
      ...product,
      ...business,
      ...sales,
      ...customerService,
    ]
      .map((post) => ({
        ...post,
        publishedAt: new Date(post.publishedAt).toISOString(),
      }))
      .reverse()
  )
  .onConflictDoNothing({
    target: [trulyRemote.listingId],
  });

await resend.emails.send({
  from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
  to: env.EMAIL_TO.split(","),
  subject: "[Obsidian Romeo] New TrulyRemote.co Job Postings!",
  react: TRNotification({
    development,
    marketing,
    product,
    business,
    sales,
    customerService,
  }) as React.ReactElement,
});
