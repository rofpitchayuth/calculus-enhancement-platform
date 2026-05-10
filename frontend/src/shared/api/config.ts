/**
 * config.ts — Central API Configuration
 * =====================================
 * This file centralizes the API base URLs for the entire frontend application.
 * It uses Vite's environment variables to switch between production and development.
 */

// Reads VITE_API_URL from .env.production or .env.development.
// Fallback to localhost for local development if the environment variable is missing.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Optional: specific base URLs for different microservices if they aren't proxied or routed via the main backend.
export const LLM_SERVICE_URL = import.meta.env.VITE_LLM_SERVICE_URL || "http://localhost:8001/api/v1";
export const KT_SERVICE_URL = import.meta.env.VITE_KT_SERVICE_URL || "http://localhost:8002/api/v1";
