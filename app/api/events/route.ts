import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';
import { revalidatePath } from 'next/cache';

// Configure Cloudinary using environment variables. Make sure to set
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        // Build an event object from form entries (excluding the file)
        const entries: Record<string, any> = {};
        for (const [key, value] of formData.entries()) {
            // Skip file value for now
            if (key === 'image') continue;
            entries[key] = value;
        }

        const file = formData.get('image') as File | null;
        if (!file) {
            return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
        }

        // Robust parsing for tags and agenda: accept JSON string, comma-separated, or newline-separated
        function parseArrayField(raw: FormDataEntryValue | undefined): string[] {
            if (!raw) return [];
            const s = String(raw);
            // Try JSON
            try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) return parsed.map((it) => String(it).trim()).filter(Boolean);
            } catch (e) {
                // ignore
            }
            // Comma-separated
            if (s.includes(',')) return s.split(',').map((it) => it.trim()).filter(Boolean);
            // Newline-separated
            if (s.includes('\n')) return s.split('\n').map((it) => it.trim()).filter(Boolean);
            // Single value
            return s.trim() ? [s.trim()] : [];
        }

        const tags = parseArrayField(formData.get('tags') as FormDataEntryValue | undefined);
        const agenda = parseArrayField(formData.get('agenda') as FormDataEntryValue | undefined);

        // Upload image to Cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'CB Connect' }, (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('No upload result from Cloudinary'));
                resolve(result as { secure_url: string });
            });
            stream.end(buffer);
        });

        // Set the uploaded image URL
        entries.image = uploadResult.secure_url;

        // Create the event in DB
        const createdEvent = await Event.create({
            ...entries,
            tags,
            agenda,
        });

        revalidatePath('/');
        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error('Event creation error:', e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        console.error('Event fetch error:', e);
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}