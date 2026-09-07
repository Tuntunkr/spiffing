import type { Metadata } from "next";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import SeedToggleForm from "@/components/admin/SeedToggleForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Desk settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <main className="space-y-10">
      <div>
        <h1 className="display text-[28px] font-semibold leading-tight sm:text-[34px]">
          Settings
        </h1>
        <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[#736f65]">
          Change the desk password and choose whether the public gallery still
          shows the shipped seed archive.
        </p>
      </div>

      <section className="rounded-2xl border border-[#e7e3da] bg-white p-5 sm:p-6">
        <h2 className="display text-[18px] font-semibold">Seed archive</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#736f65]">
          Default is hidden, so live shows only what you upload.
        </p>
        <div className="mt-6">
          <SeedToggleForm showSeed={settings.showSeed} />
        </div>
      </section>

      <section className="rounded-2xl border border-[#e7e3da] bg-white p-5 sm:p-6">
        <h2 className="display text-[18px] font-semibold">Password</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#736f65]">
          After you change it, the old env password stops working.
        </p>
        <div className="mt-6 max-w-[420px]">
          <ChangePasswordForm />
        </div>
      </section>
    </main>
  );
}
