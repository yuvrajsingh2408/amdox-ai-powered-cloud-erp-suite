/**
 * Vercel Serverless Function Entry Point for Backend
 *
 * This file wraps the Express app for Vercel's serverless runtime.
 * Vercel will route all requests here.
 */
import { app } from '../src/app';

export default app;
