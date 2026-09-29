"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { updateRestaurantAction, uploadMenuImageAction } from "@/app/admin/actions";
import type { Restaurant } from "@/types/database";
import { QRCodeSVG } from "qrcode.react";

function toStr(v: string | null | undefined) { return v ?? ""; }

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

interface FormState {
  name: string; tagline: string; description: string; phone: string;
  whatsapp_number: string; address: string; maps_url: string;
  opening_hours_weekdays: string; opening_hours_weekends: string;
  opening_hours_days: string; cover_image_url: string;
}

function initialState(r: Restaurant): FormState {
  return {
    name: toStr(r.name), tagline: toStr(r.tagline), description: toStr(r.description),
    phone: toStr(r.phone), whatsapp_number: toStr(r.whatsapp_number),
    address: toStr(r.address), maps_url: toStr(r.maps_url),
    opening_hours_weekdays: toStr(r.opening_hours_weekdays),
    opening_hours_weekends: toStr(r.opening_hours_weekends),
    opening_hours_days: toStr(r.opening_hours_days),
    cover_image_url: toStr(r.cover_image_url),
  };
}

export default function ClientSettingsPage({ restaurant }: { restaurant: Restaurant }) {
  const [saved, setSaved] = useState<FormState>(initialState(restaurant));
  const [form, setForm] = useState<FormState>(initialState(restaurant));
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const set = useCallback(
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSuccess(false);
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }, []
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image size must be less than 5 MB."); return; }
    setIsUploading(true); setError(""); setSuccess(false);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadMenuImageAction(fd);
    setIsUploading(false);
    if (res.error) { setError(res.error); }
    else if (res.url) { setForm((prev) => ({ ...prev, cover_image_url: res.url! })); }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Restaurant Name is required."); return; }
    setError(""); setSuccess(false);
    startTransition(async () => {
      const res = await updateRestaurantAction(form);
      if (res.error) { setError(res.error); }
      else { setSaved(form); setSuccess(true); setTimeout(() => setSuccess(false), 4000); }
    });
  };

  const isBusy = isPending || isUploading;
  const cls = ("w-full px-4 py-2.5 border border-cream-200 rounded-xl bg-white text-ink-900 " +
    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 " +
    "disabled:opacity-50 disabled:cursor-not-allowed transition-colors");

  const qrRef = useRef<HTMLDivElement>(null);
  const qrUrl = "https://thaliraja.vercel.app/";
  const downloadQR = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ThaliRaja-Menu-QR.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cream-100">
        <h2 className="text-xl font-black text-ink-900">General Settings</h2>
        {isDirty && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            Unsaved changes
          </span>
        )}
      </div>

      {/* Feedback */}
      <div className="px-6 pt-4 space-y-3">
        {error && (<div role="alert" className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">{error}</div>)}
        {success && (
          <div role="status" className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Settings saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">Restaurant Name <span className="text-red-500">*</span></label>
            <input id="settings-name" name="name" value={form.name} onChange={set("name")} required disabled={isBusy} className={cls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">Tagline</label>
            <input id="settings-tagline" name="tagline" value={form.tagline} onChange={set("tagline")} disabled={isBusy} placeholder="e.g. Freshly made with love" className={cls} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-bold text-ink-900">Description</label>
            <textarea id="settings-description" name="description" value={form.description} onChange={set("description")} disabled={isBusy} rows={3} placeholder="A short description of your restaurant" className={cls + " resize-y min-h-[80px]"} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">Phone Number</label>
            <input id="settings-phone" name="phone" type="tel" value={form.phone} onChange={set("phone")} disabled={isBusy} placeholder="e.g. +91 98765 43210" className={cls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">WhatsApp Number</label>
            <input id="settings-whatsapp" name="whatsapp_number" type="tel" value={form.whatsapp_number} onChange={set("whatsapp_number")} disabled={isBusy} placeholder="e.g. 919876543210" className={cls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">Address / Location</label>
            <input id="settings-address" name="address" value={form.address} onChange={set("address")} disabled={isBusy} placeholder="Full address" className={cls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">Google Maps URL</label>
            <input id="settings-maps-url" name="maps_url" type="url" value={form.maps_url} onChange={set("maps_url")} disabled={isBusy} placeholder="https://maps.app.goo.gl/..." className={cls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">Opening Hours (Weekdays)</label>
            <input id="settings-hours-weekdays" name="opening_hours_weekdays" value={form.opening_hours_weekdays} onChange={set("opening_hours_weekdays")} disabled={isBusy} placeholder="e.g. 8:00 AM - 10:00 PM" className={cls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">Opening Hours (Weekends)</label>
            <input id="settings-hours-weekends" name="opening_hours_weekends" value={form.opening_hours_weekends} onChange={set("opening_hours_weekends")} disabled={isBusy} placeholder="e.g. 7:30 AM - 10:30 PM" className={cls} />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-ink-900">Opening Days</label>
            <input id="settings-hours-days" name="opening_hours_days" value={form.opening_hours_days} onChange={set("opening_hours_days")} disabled={isBusy} placeholder="e.g. Monday - Sunday" className={cls} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-bold text-ink-900">Cover Image</label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="shrink-0 w-28 h-28 rounded-xl border border-cream-200 overflow-hidden bg-cream-100 flex items-center justify-center">
                {form.cover_image_url ? (
                  <img src={form.cover_image_url} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-cream-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 w-full space-y-2">
                <input id="settings-cover-image" type="file" accept="image/*" onChange={handleImageUpload} disabled={isBusy}
                  className={cls + " file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"} />
                {isUploading && (<div className="flex items-center gap-2 text-sm font-bold text-brand-600"><Spinner /> Uploading image...</div>)}
                <p className="text-xs text-ink-800/60">JPG, PNG or WebP · max 5 MB</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-cream-100 bg-cream-50/60 flex items-center justify-between gap-4 rounded-b-2xl">
          <p className="text-xs text-ink-800/50 font-medium">
            {isDirty ? "You have unsaved changes." : success ? "All changes saved." : "No pending changes."}
          </p>
          <button id="settings-save-btn" type="submit" disabled={isBusy || !isDirty}
            className={
              "flex items-center gap-2 font-bold py-3 px-8 rounded-full shadow-sm transition-all duration-150 touch-manipulation " +
              (isBusy || !isDirty ? "bg-brand-300 text-white cursor-not-allowed opacity-70" : "bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white cursor-pointer")
            }
          >
            {isPending ? (<><Spinner /> Saving...</>) : "Save Changes"}
          </button>
        </div>
      </form>
      </div>

      {/* QR Code Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-black text-ink-900">Digital Menu QR Code</h2>
          <p className="text-ink-800 leading-relaxed max-w-md">
            Display this QR code on your tables or counter. When customers scan it with their phone camera, it will instantly open your live digital menu for easy WhatsApp ordering.
          </p>
          <button 
            onClick={downloadQR}
            className="mt-2 inline-flex items-center gap-2 font-bold py-3 px-6 rounded-full shadow-sm bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download QR Code (SVG)
          </button>
        </div>
        <div className="shrink-0 p-6 bg-white border-2 border-brand-200 rounded-2xl shadow-sm flex flex-col items-center gap-3">
          <div ref={qrRef} className="bg-white p-2">
            <QRCodeSVG value={qrUrl} size={180} level="H" fgColor="#2B1D18" />
          </div>
          <span className="font-bold text-sm text-brand-700 uppercase tracking-widest">Scan for Menu</span>
        </div>
      </div>
    </div>
  );
}