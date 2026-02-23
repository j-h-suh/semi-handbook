import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Serve images from content/images/ directory
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: segments } = await params;
    const imagePath = path.join(process.cwd(), 'content', 'images', ...segments);

    // Security: prevent directory traversal
    const resolved = path.resolve(imagePath);
    if (!resolved.startsWith(path.resolve(process.cwd(), 'content', 'images'))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!fs.existsSync(resolved)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const file = fs.readFileSync(resolved);

    // Determine content type
    const ext = path.extname(resolved).toLowerCase();
    const contentTypeMap: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    return new NextResponse(file, {
        headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
        },
    });
}
