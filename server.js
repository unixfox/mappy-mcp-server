#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "Mappy.fr Routing MCP Server",
  version: "1.0.1",
});

server.tool(
  "get_route",
  {
    fromLat: z.number().describe("Starting point latitude"),
    fromLng: z.number().describe("Starting point longitude"),
    toLat: z.number().describe("Destination point latitude"),
    toLng: z.number().describe("Destination point longitude"),
  },
  async ({ fromLat, fromLng, toLat, toLng }) => {
    const url = `https://api-iti.mappy.net/multipath/7.0/routes?from=${fromLng},${fromLat}&to=${toLng},${toLat}&lang=fr_FR&providers=car&departure=true`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "accept": "application/json, text/plain, */*",
          "apikey": "f2wjQp1eFdTe26YcAP3K92m7d9cV8x1Z",
          "origin": "https://fr.mappy.com",
          "referer": "https://fr.mappy.com/itineraire",
          "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching route: ${response.status} ${response.statusText}`,
            },
          ],
        };
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2), // <-- convert JSON to formatted text
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
