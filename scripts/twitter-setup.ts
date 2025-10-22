/* NOTE: Run once - creates new entries if run more than once */

// TODO: Maybe add something that checks if an entry already exists!
import { createSocialMedia } from "../db/social-media";
import { closePrisma } from "../db/social-media";

await createSocialMedia({
  provider: "TWITTER",
  userId: "sowma",
  username: "SOWMA",
  displayName: "School on Wheels",
  profileUrl: "https://x.com/sowma",
  email: "<optional-email>",
});
await closePrisma();
