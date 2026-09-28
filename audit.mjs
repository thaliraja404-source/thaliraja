import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error("Missing environment variables.");
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

const RESTAURANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const TEST_EMAIL = `test_audit_${Date.now()}@example.com`;
const TEST_PASSWORD = `P@ssw0rd_${Date.now()}`;

async function runAudit() {
  console.log("=== STARTING FULL END-TO-END AUDIT ===");

  let testUserId = null;
  const authClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Customer Menu Reads (Anonymous)
    console.log("\n[TEST 1] Customer Reads (Anonymous RLS)");
    const { data: restData, error: restError } = await anonClient.from("restaurants").select("*");
    if (restError) throw new Error("Anonymous read restaurants failed: " + restError.message);
    console.log("  PASS: Anonymous can read restaurants.");

    const { data: catData, error: catError } = await anonClient.from("categories").select("*");
    if (catError) throw new Error("Anonymous read categories failed: " + catError.message);
    console.log("  PASS: Anonymous can read categories.");

    // 2. Unauthorized Writes (Anonymous)
    console.log("\n[TEST 2] Unauthorized Writes (Anonymous RLS)");
    const { error: anonWriteError } = await anonClient.from("restaurants").update({ name: "Hacked" }).eq("id", RESTAURANT_ID);
    if (anonWriteError) {
      console.log("  PASS: Anonymous write blocked (" + anonWriteError.message + ").");
    } else {
      // Check if it was actually updated
      const { data: checkData } = await adminClient.from("restaurants").select("name").eq("id", RESTAURANT_ID).single();
      if (checkData.name === "Hacked") {
        throw new Error("FAIL: Anonymous was able to update restaurants!");
      } else {
        console.log("  PASS: Anonymous write silently ignored (0 rows updated).");
      }
    }

    // 3. Create Test User (Authenticated, Unauthorized)
    console.log("\n[TEST 3] Unauthorized Authenticated User (No Admin Row)");
    const { data: adminUser, error: adminUserError } = await adminClient.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (adminUserError) throw new Error("Admin createUser failed: " + adminUserError.message);
    testUserId = adminUser.user.id;

    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
    if (signInError) throw new Error("SignIn failed: " + signInError.message);

    console.log("  User created and logged in: " + testUserId);

    // Try to update restaurant
    const { error: authWriteError } = await authClient.from("restaurants").update({ name: "Hacked" }).eq("id", RESTAURANT_ID);
    if (authWriteError) {
      console.log("  PASS: Authenticated (non-admin) write blocked (" + authWriteError.message + ").");
    } else {
      const { data: checkData } = await adminClient.from("restaurants").select("name").eq("id", RESTAURANT_ID).single();
      if (checkData.name === "Hacked") {
        throw new Error("FAIL: Normal authenticated user was able to update restaurants!");
      } else {
        console.log("  PASS: Authenticated (non-admin) write silently ignored (0 rows updated).");
      }
    }

    // Try to escalate privileges (Add self to restaurant_admins)
    const { error: escalationError } = await authClient.from("restaurant_admins").insert({ user_id: testUserId, restaurant_id: RESTAURANT_ID });
    if (!escalationError) throw new Error("FAIL: Normal user escalated privileges!");
    console.log("  PASS: Authenticated user cannot escalate privileges (" + escalationError.message + ").");

    // 4. Authorized Admin User
    console.log("\n[TEST 4] Authorized Admin User (Has Admin Row)");
    // Grant admin using service_role
    const { error: grantError } = await adminClient.from("restaurant_admins").insert({ user_id: testUserId, restaurant_id: RESTAURANT_ID });
    if (grantError) throw new Error("Admin grant failed: " + grantError.message);

    // Now try update again
    const newName = "Thali Raja (Audit Test)";
    const { error: adminWriteError } = await authClient.from("restaurants").update({ name: newName }).eq("id", RESTAURANT_ID);
    if (adminWriteError) throw new Error("FAIL: Authorized admin could not update: " + adminWriteError.message);
    console.log("  PASS: Authorized admin can update restaurants.");

    // Revert name
    await authClient.from("restaurants").update({ name: "Thali Raja" }).eq("id", RESTAURANT_ID);

    // 5. Menu CRUD persistence
    console.log("\n[TEST 5] Menu CRUD Persistence");
    const catId = crypto.randomUUID();
    const { error: catInsertError } = await authClient.from("categories").insert({ id: catId, restaurant_id: RESTAURANT_ID, name: "Audit Category", display_order: 99 });
    if (catInsertError) throw new Error("FAIL: Admin category insert failed: " + catInsertError.message);
    console.log("  PASS: Admin can insert categories.");

    await authClient.from("categories").delete().eq("id", catId);

    // 6. Storage Policies
    console.log("\n[TEST 6] Storage Upload/Access Policies");
    const { data: bucketList, error: bucketError } = await anonClient.storage.from("menus").list();
    if (bucketError) throw new Error("FAIL: Anonymous list bucket failed: " + bucketError.message);
    console.log("  PASS: Anonymous can read from menus bucket.");

    // Try to upload as anonymous
    const dummyBlob = new Blob(["test"], { type: "text/plain" });
    const { error: anonUploadError } = await anonClient.storage.from("menus").upload("test_anon.txt", dummyBlob);
    if (!anonUploadError) {
      await adminClient.storage.from("menus").remove(["test_anon.txt"]);
      throw new Error("FAIL: Anonymous user was able to upload!");
    }
    console.log("  PASS: Anonymous upload blocked (" + anonUploadError.message + ").");

    // Try to upload as authorized admin
    const { error: adminUploadError } = await authClient.storage.from("menus").upload("test_admin.txt", dummyBlob);
    if (adminUploadError) throw new Error("FAIL: Authorized admin upload failed: " + adminUploadError.message);
    console.log("  PASS: Authorized admin can upload to menus bucket.");

    // Clean up storage
    await adminClient.storage.from("menus").remove(["test_admin.txt"]);

  } catch (err) {
    console.error("\nâŒ AUDIT FAILED:", err.message);
  } finally {
    // 7. Clean up
    console.log("\n[CLEANUP] Removing test user and admin grant...");
    if (testUserId) {
      await adminClient.from("restaurant_admins").delete().eq("user_id", testUserId);
      await adminClient.auth.admin.deleteUser(testUserId);
      console.log("  PASS: Cleanup completed.");
    }
  }
}

runAudit();
