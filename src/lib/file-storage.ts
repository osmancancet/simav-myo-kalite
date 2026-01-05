import { put, del } from "@vercel/blob"

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
    const timestamp = Date.now()
    const fileName = `${folder}/${timestamp}-${sanitizeFileName(file.name)}`

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
        access: 'public',
        addRandomSuffix: false
    })

    // Return the blob URL
    return blob.url
}

export async function deleteFile(url: string): Promise<void> {
    try {
        await del(url)
    } catch (error) {
        console.error("Error deleting file from blob:", error)
    }
}
