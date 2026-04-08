/**
 * Supabase Client Setup
 *
 * This module initializes the Supabase client with proper environment variable handling.
 * Secrets are never exposed to the browser through this configuration.
 *
 * Required Environment Variables (set in .env.local and Vercel):
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL (https://your-project.supabase.co)
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key (from API Settings)
 *
 * These are "NEXT_PUBLIC_" prefixed because they're safe to expose in the browser
 * (the anon key only allows operations defined in your RLS policies).
 */

import { createClient } from "@supabase/supabase-js";

// ============================================================================
// Environment Variable Validation
// ============================================================================

function sanitizeEnvValue(value: string | undefined): string {
  if (!value) return "";
  return value.trim().replace(/^['\"]|['\"]$/g, "");
}

const supabaseUrl = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = sanitizeEnvValue(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// ============================================================================
// Validation & Error Detection
// ============================================================================

type ConfigValidationResult =
  | { valid: true }
  | { valid: false; error: string; missingVars: string[] };

function validateConfig(): ConfigValidationResult {
  const missingVars: string[] = [];

  if (!supabaseUrl) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (missingVars.length > 0) {
    const vars = missingVars.join(", ");
    return {
      valid: false,
      error: `Missing required environment variables: ${vars}. Set these in .env.local and in Vercel Project Settings → Environment Variables.`,
      missingVars,
    };
  }

  // Validate URL format
  try {
    const parsed = new URL(supabaseUrl);
    if (!["https:", "http:"].includes(parsed.protocol)) {
      return {
        valid: false,
        error: `Invalid NEXT_PUBLIC_SUPABASE_URL protocol. Expected https or http, got: ${parsed.protocol}`,
        missingVars: [],
      };
    }
  } catch {
    return {
      valid: false,
      error: `Invalid NEXT_PUBLIC_SUPABASE_URL format. Expected a full URL like https://your-project.supabase.co`,
      missingVars: [],
    };
  }

  // Validate anon key looks like a JWT
  if (!supabaseAnonKey.includes(".")) {
    return {
      valid: false,
      error: `Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY format. Expected a JWT token from Supabase API Settings.`,
      missingVars: [],
    };
  }

  return { valid: true };
}

// ============================================================================
// Development Logging (stripped in production build)
// ============================================================================

function logConfigStatus() {
  if (process.env.NODE_ENV !== "development") return;
  if (typeof window !== "undefined") return; // Only log on server

  const validation = validateConfig();

  if (validation.valid) {
    console.log(
      "[Supabase] Configuration loaded successfully. URL:",
      supabaseUrl.replace(/https?:\/\//, "").split(".")[0],
    );
  } else {
    console.warn("[Supabase] Configuration error:", validation.error);
  }
}

logConfigStatus();

// ============================================================================
// Client Initialization
// ============================================================================

const validation = validateConfig();

export const supabaseConfigError: string = validation.valid
  ? ""
  : validation.error;

export const supabase = validation.valid
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
