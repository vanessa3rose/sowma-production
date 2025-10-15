import {
 createSocialMedia,
 getAllSocialMedia,
 updateSocialMedia,
 deleteSocialMedia,
 closePrisma,
} from "../social-media";
import { Provider } from "../../src/generated/prisma";

async function testCRUD() {
 try {
   console.log("----CREATE----");
   const created = await createSocialMedia({
     provider: Provider.TWITTER,
     userId: "test-user",
     username: "user-name",
     displayName: "User Name",
     profileUrl: "https://fake.com/username",
     email: "fake@example.com",
   });
   console.log("Created:", created);

   console.log("\n----GET ALL----");
   const all = await getAllSocialMedia();
   console.log("Get all:", all);

   console.log("\n----UPDATE----");
   const updated = await updateSocialMedia(created.id, {
     displayName: "Dummy user",
     username: "new_user",
   });
   console.log("Update all: ", updated);

   console.log("\n----DELETE----");
   const deleted = await deleteSocialMedia(created.id);
   console.log("Deleted: ", deleted);

   console.log("\n----FINAL----");
   const final = await getAllSocialMedia();
   console.log("Final: ", final);
 } catch (error) {
   console.error("CRUD test error: ", error);
 } finally {
   await closePrisma();
 }
}

testCRUD();


