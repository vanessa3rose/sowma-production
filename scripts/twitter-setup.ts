/* NOTE: Run once - creates new entries if run more than once */

// TODO: Maybe add something that checks if an entry already exists!
import { createSocialMedia } from '../db/social-media';
import { closePrisma } from '../db/social-media';

await createSocialMedia({
  provider: "TWITTER",
  userId: "<user-id-if-applicable>",
  username: "SOWMA",
  displayName: "School on Wheels",
  profileUrl: "<profile-url-if-any>",
  email: "<optional-email>",
});
await closePrisma();