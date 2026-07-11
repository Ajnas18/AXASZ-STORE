import { createClient } from "next-sanity";
import { createImageUrlBuilder } from '@sanity/image-url';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "if1xc1so";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

// For read/write server-side operations (includes token, trimmed to prevent syntax/space errors)
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, 
  token: process.env.SANITY_API_TOKEN ? process.env.SANITY_API_TOKEN.trim() : undefined,
});

// Token-less client specifically for public catalog reads (completely immune to token typos/errors)
export const readClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

// Helper function to build image URLs from Sanity
const builder = createImageUrlBuilder(readClient);
export const urlFor = (source) => builder.image(source);
