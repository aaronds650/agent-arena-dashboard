import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// HARDCODED: External Python trading engine API - NO MOCK DATA FALLBACK
const EXTERNAL_API_URL = 'https://modular-trade-ai--aaronds650.replit.app';

async function fetchExternalApiState(): Promise<{ data: Record<string, unknown> | null; error: string | null }> {
  console.log(`Fetching from external API: ${EXTERNAL_API_URL}/api/state`);
  
  try {
    const response = await fetch(`${EXTERNAL_API_URL}/api/state`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorMsg = `External API error: ${response.status} ${response.statusText}`;
      console.error(errorMsg);
      return { data: null, error: errorMsg };
    }
    
    const data = await response.json();
    console.log(`External API returned ${Object.keys(data).length} keys`);
    return { data, error: null };
  } catch (error) {
    const errorMsg = `Failed to fetch from external API: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMsg);
    return { data: null, error: errorMsg };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // NO MOCK DATA - Returns live data or error only
  app.get("/api/state", async (req, res) => {
    try {
      const { data, error } = await fetchExternalApiState();
      
      if (data) {
        res.json(data);
      } else {
        // Return error state - NO MOCK DATA FALLBACK
        res.status(503).json({ 
          error: error || 'External trading engine unavailable',
          source: 'external_api',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error in /api/state:", error);
      res.status(500).json({ 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return httpServer;
}
