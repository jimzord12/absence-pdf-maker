# Next Task Tool Tests

This directory contains tests for the next task tool.

## Running Tests

All tests can be run using:

```bash
cd .opencode
npx tsx --test tool/lib/*.test.ts
```

## Test Structure

### `tasks.test.ts`
Tests for pure business logic functions that don't depend on the filesystem:

- **extractTaskInfo**: Extracts task information from TASKS.md content
- **getNextSteps**: Returns the appropriate next action based on task state
- **sortTaskIds**: Sorts task IDs numerically
- **findNextTask**: Finds the first non-committed task
- **calculateSummary**: Calculates task completion statistics
- **getNextTaskResult**: Orchestrates the full logic flow

### `filesystem.test.ts`
Tests for filesystem operations:

- **readStateFile**: Reading and parsing the state.json file
- **readTasksFile**: Reading the TASKS.md file
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
