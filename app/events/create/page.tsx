"use client"

import React, { useState } from 'react';

export default function CreateEventPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Convert tags (comma separated input) and agenda (textarea newline) into JSON-friendly strings
    const tagsRaw = formData.get('tags') as string | null;
    if (tagsRaw !== null) {
      const tagsArr = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
      formData.set('tags', JSON.stringify(tagsArr));
    }

    const agendaRaw = formData.get('agenda') as string | null;
    if (agendaRaw !== null) {
      // Allow newline separated agenda items
      const agendaArr = agendaRaw.split('\n').map((t) => t.trim()).filter(Boolean);
      formData.set('agenda', JSON.stringify(agendaArr));
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create event');
      setMessage('Event created successfully');
      form.reset();
    } catch (err: any) {
      setMessage(err?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto container py-12 px-6 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Create Event</h1>

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-dark-100 border border-dark-200 rounded-lg p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Title</label>
            <input name="title" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Overview</label>
            <input name="overview" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" required className="bg-dark-200 rounded-[6px] px-4 py-2.5 min-h-[120px]" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Venue</label>
            <input name="venue" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Location</label>
            <input name="location" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Date</label>
            <input name="date" type="date" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Time</label>
            <input name="time" type="time" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Mode</label>
            <select name="mode" required defaultValue="online" className="bg-dark-200 rounded-[6px] px-4 py-2.5">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Audience</label>
            <input name="audience" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Organizer</label>
            <input name="organizer" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <input name="tags" placeholder="react,javascript,web" required className="bg-dark-200 rounded-[6px] px-4 py-2.5" />
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium">Agenda (one item per line)</label>
            <textarea name="agenda" placeholder={"Intro\nSpeaker 1\nQ&A"} required className="bg-dark-200 rounded-[6px] px-4 py-2.5 min-h-[100px]" />
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-medium">Image</label>
            <input name="image" type="file" accept="image/*" required className="text-sm" />
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-black font-semibold px-6 py-2.5 rounded-[6px]">
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>

      {message && (
        <p className={`mt-4 ${message.includes('success') ? 'text-green-400' : 'text-red-300'}`}>{message}</p>
      )}
    </main>
  );
}
