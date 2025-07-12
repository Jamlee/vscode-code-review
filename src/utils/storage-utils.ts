import * as fs from 'fs';

export const EOL = '\n';

/**
 * Keep only valid lines for storage
 *
 * @param string[] rows The candidate lines to store
 * @return string[]
 */
export function cleanCsvStorage(rows: string[]): string[] {
  return rows.filter((row) => row?.trim()?.length ?? 0 > 0);
}

/**
 * Get the lines as stored in CSV
 *
 * @param pathToFile The path to the CSV file
 * @return Generator<string>
 */
export function* getCsvFileLinesAsIterable(pathToFile: string): Generator<string> {
  let fileContent = '';
  try {
    fileContent = fs.readFileSync(pathToFile, 'utf8');
  } catch (error) {
    console.log('Error reading header from file', pathToFile, error);
    return;
  }

  for (const line of cleanCsvStorage(fileContent.split(EOL))) {
    yield line;
  }
}

/**
 * Get the lines as stored in CSV
 *
 * @param pathToFile The path to the CSV file
 * @return string[]
 */
export function getCsvFileLinesAsArray(pathToFile: string): string[] {
  return Array.from(getCsvFileLinesAsIterable(pathToFile));
}
/**
 * Get the CSV file header (first line)
 *
 * @param pathToFile The actual file path
 */
export const getCsvFileHeader = (pathToFile: string): string => {
  return getCsvFileLinesAsIterable(pathToFile).next().value || '';
};

/**
 * Store the comments
 *
 * @param pathToFile The path to the file to write
 * @param rows The lines to store
 * @param overwrite Replace all (true) / append (false)
 * @return true if the operation was successful, false otherwise
 */
export function setCsvFileLines(pathToFile: string, rows: string[], overwrite: boolean = true): boolean {
  // The last line of the file must always be terminated with an EOL
  const content = cleanCsvStorage(rows).join(EOL) + EOL;
  try {
    if (overwrite) {
      fs.writeFileSync(pathToFile, content);
    } else {
      fs.appendFileSync(pathToFile, content);
    }
    return true;
  } catch (error) {
    console.log('Error writing content of file', pathToFile, error);
    return false;
  }
}

/**
 * Write the content of the CSV file
 *
 * @param pathToFile The path to the file to write
 * @param fileContent The content of the file
 * @return boolean true if the operation was successful, false otherwise
 */
export function setCsvFileContent(pathToFile: string, fileContent: string): boolean {
  try {
    fs.writeFileSync(pathToFile, fileContent, 'utf8');
    return true;
  } catch (error) {
    console.log('Error writing content of file', pathToFile, error);
    return false;
  }
}

export function convertWinPathStyleToLinux(path: string): string {
  // 无论当前系统是什么，都强制将 Windows 路径转换为 Linux 风格
  // 1. 将反斜杠 \ 转换为斜杠 /
  path = path.replace(/\\/g, '/');
  // 2. 处理重复斜杠（如果有）
  path = path.replace(/\/\/+/g, '/');
  return path;
}

export function convertLinuxPathStyleToCurrOS(path: string): string {
  // 检测操作系统类型
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    // 转换斜杠为反斜杠
    path = path.replace(/\//g, '\\');
    // 处理重复反斜杠（连续多个 \ 转换为单个 \）
    path = path.replace(/\\\\+/g, '\\');
  }

  // 对于非 Windows 系统，直接返回原路径（Linux/macOS 已使用正确的 /）
  return path;
}
