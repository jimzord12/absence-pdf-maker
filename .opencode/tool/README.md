Visit here for more information about OpenCode tool: https://opencode.ai/docs/custom-tools/

## Location

They can be defined:

Locally by placing them in the `.opencode/tool/` directory of your project.
Or globally, by placing them in `~/.config/opencode/tool/`.

## Simple Example

```ts
import { tool } from '@opencode-ai/plugin';

export default tool({
  description: 'Query the project database',
  args: {
    query: tool.schema.string().describe('SQL query to execute'),
  },
  async execute(args) {
    // Your database logic here
    return `Executed query: ${args.query}`;
  },
});
```

## Multiple tools per file

You can also export multiple tools from a single file. Each export becomes a separate tool with the name <filename>\_<exportname>:

```ts
import { tool } from '@opencode-ai/plugin';

export const add = tool({
  description: 'Add two numbers',
  args: {
    a: tool.schema.number().describe('First number'),
    b: tool.schema.number().describe('Second number'),
  },
  async execute(args) {
    return args.a + args.b;
  },
});

export const multiply = tool({
  description: 'Multiply two numbers',
  args: {
    a: tool.schema.number().describe('First number'),
    b: tool.schema.number().describe('Second number'),
  },
  async execute(args) {
    return args.a * args.b;
  },
});
```

This creates two tools: math_add and math_multiply.

## Arguments

You can use tool.schema, which is just Zod, to define argument types.

```ts
args: {
  query: tool.schema.string().describe('SQL query to execute');
}
```

You can also import Zod directly and return a plain object:

```ts
import { z } from 'zod';

export default {
  description: 'Tool description',
  args: {
    param: z.string().describe('Parameter description'),
  },
  async execute(args, context) {
    // Tool implementation
    return 'result';
  },
};
```

## Context

Tools receive context about the current session:

```ts
import { tool } from '@opencode-ai/plugin';

export default tool({
  description: 'Get project information',
  args: {},
  async execute(args, context) {
    // Access context information
    const { agent, sessionID, messageID } = context;
    return `Agent: ${agent}, Session: ${sessionID}, Message: ${messageID}`;
  },
});
```
