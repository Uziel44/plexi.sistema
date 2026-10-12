import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import type * as schema from "./schema/index.js";

export type PlexiSchema = typeof schema;
export type DrizzleDb = SqliteRemoteDatabase<PlexiSchema>;
