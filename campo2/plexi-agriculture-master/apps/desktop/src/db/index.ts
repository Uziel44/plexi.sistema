// Copyright 2024 TPT Solutions Ltd. // SPDX-License-Identifier: Apache-2.0
function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function getDb() {
  if (isTauri()) {
    const { plexiDb } = await import("./adapter-tauri.js");
    return plexiDb;
  }
  const { plexiDb } = await import("./adapter-web.js");
  return plexiDb;
}

