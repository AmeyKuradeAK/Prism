import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

/**
 * Write project files from MongoDB to a temp directory.
 * @param files Array of { path, content }
 * @param projectId string
 * @returns Path to the temp directory
 */
export async function writeProjectToTempDir(files: { path: string, content: string }[], projectId: string): Promise<string> {
  const tempDir = path.join(os.tmpdir(), `project-${projectId}-${Date.now()}`)
  await fs.mkdir(tempDir, { recursive: true })
  for (const file of files) {
    const filePath = path.join(tempDir, file.path)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, file.content, 'utf8')
  }
  return tempDir
} 