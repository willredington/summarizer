import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { SummaryResult } from "../baml_client/types";

const CACHE_DIR = join(process.cwd(), ".cache");

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

function generateCacheKey(url: string, userProfileDescription: string): string {
  const hash = createHash("sha256");
  hash.update(url + userProfileDescription);
  return hash.digest("hex");
}

function getCachePath(cacheKey: string): string {
  return join(CACHE_DIR, `${cacheKey}.json`);
}

export function getCachedSummary(
  url: string,
  userProfileDescription: string
): SummaryResult | null {
  try {
    const cacheKey = generateCacheKey(url, userProfileDescription);
    const cachePath = getCachePath(cacheKey);

    if (!existsSync(cachePath)) {
      return null;
    }

    const cachedData = readFileSync(cachePath, "utf-8");
    return JSON.parse(cachedData) as SummaryResult;
  } catch (error) {
    console.warn("Error reading from cache:", error);
    return null;
  }
}

export function cacheSummary(
  url: string,
  userProfileDescription: string,
  summary: SummaryResult
): void {
  try {
    const cacheKey = generateCacheKey(url, userProfileDescription);
    const cachePath = getCachePath(cacheKey);

    writeFileSync(cachePath, JSON.stringify(summary, null, 2));
  } catch (error) {
    console.warn("Error writing to cache:", error);
  }
}
