import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    RESEND_API_KEY: z.string().min(1),

    EMAIL_FROM_NAME: z.string().min(1),
    EMAIL_FROM: z.string().email(),
    EMAIL_TO: z.string(),
  },
  runtimeEnv: process.env,
});
