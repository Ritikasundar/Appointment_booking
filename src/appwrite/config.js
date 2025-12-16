import { Client, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("6941607000385a4e80e2");

export const databases = new Databases(client);

export const DATABASE_ID = "6941625a001b5bd4a18e";
export const USER_COLLECTION_ID = "users";
export const DOCTOR_COLLECTION_ID = "doctors";
export const APPOINTMENT_COLLECTION_ID = "appointments";

