import { resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createInterface } from "node:readline";
import { createMcpTools, getToolDefinitions, type McpTool } from "./tools";

function getDatabasePath(): string {
  const dbPath = process.env.DATABASE_PATH ?? "./data/worldcup.sqlite";
  const absolutePath = resolve(dbPath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  return absolutePath;
}

function main() {
  const dbPath = getDatabasePath();
  const db = new DatabaseSync(dbPath);
  const tools = createMcpTools(db);
  const toolDefs = getToolDefinitions();
  const toolDefMap = new Map(toolDefs.map((td) => [td.name, td]));

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  function respond(id: string | number | null, result: unknown) {
    const response = JSON.stringify({ jsonrpc: "2.0", id, result });
    process.stdout.write(`${response}\n`);
  }

  function respondError(id: string | number | null, code: number, message: string) {
    const response = JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code, message },
    });
    process.stdout.write(`${response}\n`);
  }

  rl.on("line", async (line: string) => {
    let request: { jsonrpc?: string; id?: string | number | null; method?: string; params?: unknown };
    try {
      request = JSON.parse(line);
    } catch {
      respondError(null, -32700, "Parse error");
      return;
    }
    const { id = null, method, params } = request;

    if (!method) {
      respondError(id, -32600, "Invalid Request");
      return;
    }

    try {
      if (method === "initialize") {
        respond(id, {
          protocolVersion: "0.1.0",
          serverInfo: { name: "worldcup-mcp-server", version: "0.1.0" },
          capabilities: { tools: {} },
        });
      } else if (method === "tools/list") {
        respond(id, { tools: toolDefs });
      } else if (method === "tools/call") {
        const callParams = params as { name?: string; arguments?: Record<string, unknown> };
        if (!callParams?.name) {
          respondError(id, -32602, "Missing tool name");
          return;
        }
        const toolName = callParams.name;
        const toolFn = tools[toolName];
        if (!toolFn) {
          respondError(id, -32602, `Unknown tool: ${toolName}`);
          return;
        }
        const result = await toolFn(callParams.arguments ?? {});
        respond(id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
      } else {
        respondError(id, -32601, `Method not found: ${method}`);
      }
    } catch (err) {
      respondError(id, -32603, (err as Error).message);
    }
  });

  process.stderr.write("MCP Server for World Cup Prediction Platform started\n");
  process.stderr.write(`Database: ${dbPath}\n`);
}

main();
