import fs from "fs"
import path from "path"
import { pipeline } from "stream"
import { promisify } from "util"

const pump = promisify(pipeline)

// Turkish character transliteration map
const turkishCharMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'İ': 'I', 'i': 'i',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
}

function sanitizeFileName(fileName: string): string {
    // First transliterate Turkish characters
    let sanitized = fileName.split('').map(char => turkishCharMap[char] || char).join('')
    // Then remove any remaining non-safe characters
    return sanitized.replace(/[^a-zA-Z0-9.-]/g, "_")
}

export async function saveFile(file: File, folder: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "uploads", folder)

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const fileName = `${timestamp}-${sanitizeFileName(file.name)}`
    const filePath = path.join(uploadsDir, fileName)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await fs.promises.writeFile(filePath, buffer)

    // Return relative path for storage
    return path.join("uploads", folder, fileName)
}
