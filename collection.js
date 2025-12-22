import { Client, Databases, Permission, Role } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6941607000385a4e80e2")
  .setKey("standard_29f1bfa222f95dbc8232449e5cafb7d68c0a645127bb23bcc6108a576f057f5c002be3ba487690fa1dcdb4a2a4a76bc9797c4222b95ddc5e959877107f3aad8dfab5a85fb5cdd7ba556ac26f678be432a6bc701cf8e829144454bb073483a91aa2c397742d3fa59f8100224facd290aa0c4a3c75355693bceeda74809a032b92"); // 🔴 REQUIRED 

const databases = new Databases(client);

const DATABASE_ID = "6941625a001b5bd4a18e";
const PATIENT_COLLECTION_ID = "patients";

async function createPatientCollection() {
  try {
    // 1️⃣ Create Collection
    await databases.createCollection(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "Patients",
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
      ]
    );

    console.log("✅ Patient collection created");

    // 2️⃣ Create Attributes
    const attributes = [
      ["userId", "string", true],
      ["name", "string", true],
      ["email", "email", true],
      ["phone", "string", true],
      ["birthDate", "string", false],
      ["gender", "string", false],
      ["address", "string", false],
      ["occupation", "string", false],
      ["emergencyContactName", "string", false],
      ["emergencyContactNumber", "string", false],
      ["primaryPhysician", "string", false],
      ["insuranceProvider", "string", false],
      ["insurancePolicyNumber", "string", false],
      ["allergies", "string", false],
      ["currentMedication", "string", false],
      ["familyMedicalHistory", "string", false],
      ["pastMedicalHistory", "string", false],
      ["identificationType", "string", false],
      ["identificationNumber", "string", false],
    ];

    for (const [key, type, required] of attributes) {
      await databases.createStringAttribute(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        key,
        255,
        required
      );
    }

    // 3️⃣ Boolean attribute
    await databases.createBooleanAttribute(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "privacyConsent",
      true
    );

    // 4️⃣ Create Index on Email
    await databases.createIndex(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      "email_index",
      "key",
      ["email"]
    );

    console.log("✅ All attributes & index created successfully");
  } catch (error) {
    console.error("❌ Error creating patient collection:", error);
  }
}

createPatientCollection();
