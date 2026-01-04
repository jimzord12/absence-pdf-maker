# Task Management Tools Library

This directory contains the core library for the task management system.

## Running Tests

All tests can be run using:

```bash
cd .opencode
bun test tool/lib/*.test.ts
```

## Test Structure

### `tasks.test.ts`

Tests for pure business logic functions that don't depend on the filesystem:

- **parseTaskFile**: Parses individual task `.md` files into structured data
- **getNextSteps**: Returns the appropriate next action based on task state
- **sortTaskIds**: Sorts task IDs numerically
- **findNextTask**: Finds the first non-committed task
- **calculateSummary**: Calculates task completion statistics
- **getLocationForState**: Determines the folder location for a task state
- **isValidStateTransition**: Validates state transitions
- **generateTaskContent**: Creates task file content from template

### `filesystem.test.ts`

Tests for filesystem operations:

- **readStateFile**: Reading and parsing the state.json file
- **readTaskFile**: Reading individual task .md files
- **writeStateFile**: Writing state.json file
- **writeTaskFile**: Writing task .md files
- **listTaskFiles**: Listing task files in a directory
- **listAllTasks**: Listing all tasks across all locations
- **findTaskFile**: Finding a task file by ID
- **moveTaskFile**: Moving task files between locations
- **getDefaultPaths**: Generating correct file paths
- **readFileErrorResult**: Creating error result objects

## Test Coverage

- **24 tests** across **10 test suites**
- All tests pass
- Both happy paths and error cases covered
- Filesystem operations are mocked for testing pure logic

## Test Design

The tests follow these principles:

1. **Isolation**: Each test is independent and doesn't rely on the file system
2. **Mocking**: Filesystem operations use dependency injection for testability
3. **Type Safety**: TypeScript ensures correct types throughout
4. **Clarity**: Test names clearly describe what is being tested

## Continuous Testing

To run tests in watch mode (if supported by your test runner):

```bash
cd .opencode
npx tsx --test --watch tool/lib/*.test.ts
```

