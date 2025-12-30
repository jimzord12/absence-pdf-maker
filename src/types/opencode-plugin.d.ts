declare module '@opencode-ai/plugin' {
  interface ToolOptions {
    description?: string;
    args?: Record<string, unknown>;
    execute?: (...args: unknown[]) => unknown;
  }

  export function tool(opts: ToolOptions): unknown;
  export default tool;
}
