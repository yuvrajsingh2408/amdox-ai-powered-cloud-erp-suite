/**
 * Vercel Serverless Function Entry Point
 *
 * This file wraps the Express app for Vercel's serverless runtime.
 * Vercel will route all `/api/*` requests here.
 */
import { app } from '../backend/src/app';

export default app;
