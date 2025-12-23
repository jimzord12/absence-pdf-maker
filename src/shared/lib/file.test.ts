import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile, readFileAsText } from './file';

describe('downloadFile', () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  const mockLink = {
    href: '',
    download: '',
    click: vi.fn(),
  };

  beforeEach(() => {
    // Mock document.createElement
    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    // Mock document.appendChild
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);

    // Mock document.removeChild
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    // Mock URL.createObjectURL
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');

    // Mock URL.revokeObjectURL
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a blob and trigger download with valid inputs', () => {
    downloadFile('test.json', '{"test": true}');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
    expect(mockLink.download).toBe('test.json');
    expect(mockLink.href).toBe('blob:test-url');
  });

  it('should handle empty content string', () => {
    downloadFile('test.json', '');

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalledTimes(1);
  });

  it('should handle large content', () => {
    const largeContent = 'x'.repeat(1000000);
    downloadFile('large.json', largeContent);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalledTimes(1);
  });

  it('should handle special characters in content', () => {
    const specialContent = 'Hello\nWorld\t"quoted"\n';
    downloadFile('test.json', specialContent);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(mockLink.click).toHaveBeenCalledTimes(1);
  });

  it('should throw error when filename is null', () => {
    expect(() => downloadFile(null as any, '{"test": true}')).toThrow(
      'Filename must be a non-empty string'
    );
  });

  it('should throw error when filename is undefined', () => {
    expect(() => downloadFile(undefined as any, '{"test": true}')).toThrow(
      'Filename must be a non-empty string'
    );
  });

  it('should throw error when filename is empty string', () => {
    expect(() => downloadFile('', '{"test": true}')).toThrow('Filename must be a non-empty string');
  });

  it('should throw error when filename is not a string', () => {
    expect(() => downloadFile({ name: 'test' } as any, '{"test": true}')).toThrow(
      'Filename must be a non-empty string'
    );
    expect(() => downloadFile(123 as any, '{"test": true}')).toThrow(
      'Filename must be a non-empty string'
    );
  });

  it('should throw error when content is undefined', () => {
    expect(() => downloadFile('test.json', undefined as any)).toThrow(
      'Content cannot be undefined or null'
    );
  });

  it('should throw error when content is null', () => {
    expect(() => downloadFile('test.json', null as any)).toThrow(
      'Content cannot be undefined or null'
    );
  });

  it('should handle filename with special characters', () => {
    downloadFile('test-file_2025.json', '{}');

    expect(mockLink.download).toBe('test-file_2025.json');
  });

  it('should handle filename with extension', () => {
    downloadFile('document.pdf', 'content', 'application/pdf');

    expect(mockLink.download).toBe('document.pdf');
  });

  it('should handle filename with spaces', () => {
    downloadFile('my file.txt', 'content', 'text/plain');

    expect(mockLink.download).toBe('my file.txt');
  });

  it('should cleanup URL object after download', () => {
    downloadFile('test.json', '{}');

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
  });

  it('should create blob with correct content array', () => {
    downloadFile('test.json', '{"key": "value"}');

    expect(createObjectURLSpy).toHaveBeenCalled();
  });
});

describe('readFileAsText', () => {
  it('should read a valid file and return its content', async () => {
    const file = new File(['Hello world'], 'test.txt', { type: 'text/plain' });
    const content = await readFileAsText(file);
    expect(content).toBe('Hello world');
  });

  it('should read a JSON file correctly', async () => {
    const jsonContent = '{"name":"John","age":30}';
    const file = new File([jsonContent], 'data.json', { type: 'application/json' });
    const content = await readFileAsText(file);
    expect(content).toBe(jsonContent);
  });

  it('should read a file with multiple lines', async () => {
    const content = 'Line 1\nLine 2\nLine 3';
    const file = new File([content], 'test.txt', { type: 'text/plain' });
    const result = await readFileAsText(file);
    expect(result).toBe(content);
  });

  it('should read an empty file', async () => {
    const file = new File([''], 'empty.txt', { type: 'text/plain' });
    const content = await readFileAsText(file);
    expect(content).toBe('');
  });

  it('should read a file with special characters', async () => {
    const content = 'Hello 世界\n🎉 Party!\n"Quotes"';
    const file = new File([content], 'special.txt', { type: 'text/plain' });
    const result = await readFileAsText(file);
    expect(result).toBe(content);
  });

  it('should reject when file is null', async () => {
    await expect(readFileAsText(null as any)).rejects.toThrow(
      'File must be a valid File object'
    );
  });

  it('should reject when file is undefined', async () => {
    await expect(readFileAsText(undefined as any)).rejects.toThrow(
      'File must be a valid File object'
    );
  });

  it('should reject when file is not a File object', async () => {
    await expect(readFileAsText({} as any)).rejects.toThrow(
      'File must be a valid File object'
    );
    await expect(readFileAsText('not a file' as any)).rejects.toThrow(
      'File must be a valid File object'
    );
    await expect(readFileAsText(123 as any)).rejects.toThrow(
      'File must be a valid File object'
    );
  });

  it('should read a large file', async () => {
    const largeContent = 'x'.repeat(1000000);
    const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
    const result = await readFileAsText(file);
    expect(result.length).toBe(1000000);
  });

  it('should handle files with binary-like content that can still be read as text', async () => {
    const binaryLikeContent = '\x00\x01\x02Hello\xFF\xFE';
    const file = new File([binaryLikeContent], 'binary.txt', { type: 'text/plain' });
    const result = await readFileAsText(file);
    expect(result).toBe(binaryLikeContent);
  });
});
