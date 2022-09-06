import {mkdir, readdir, rmdir} from "fs/promises";

const checkDirExist = async (path: string): Promise<boolean> => {
  try {
    await readdir(path)
    return true
  } catch (error) {
    return false
  }
}

const setupDir = async (path: string): Promise<void> => {
  const isDirExist = await checkDirExist(path)
  if (isDirExist) {
    await rmdir(path, {recursive: true})
  }
  await mkdir(path)
}

export default setupDir