"use client";

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config'; // Relative path to root sanity.config.js

export default function AdminPage() {
  return <NextStudio config={config} />;
}
