import type { Metadata } from "next";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import SeedToggleForm from "@/components/admin/SeedToggleForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Desk settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <main>
      <p className="text-[12px] uppercase tracking-[0.14em] text-[#a8a396]">Desk</p>
      <h1 className="display mt-1.5 text-[30px] font-semibold leading-[1.05] sm:text-[36px]">Settings</h1>
      <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[#736f65]">
        Change the desk password and choose whether the public gallery still shows the shipped seed
        archive.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="rounded-[1.25rem] border border-[#e7e3da] bg-white p-6 shadow-[0_16px_40px_-32px_rgba(22,21,15,0.4)] sm:p-7">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#a8a396]">Gallery</p>
          <h2 className="display mt-2 text-[20px] font-semibold">Seed archive</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#736f65]">
            On means live still shows the built-in sample work behind your uploads. Off means only
            what you published.
          </p>
          <div className="mt-6">
            <SeedToggleForm showSeed={settings.showSeed} />
          </div>
        </section>

        <section className="rounded-[1.25rem] border border-[#e7e3da] bg-white p-6 shadow-[0_16px_40px_-32px_rgba(22,21,15,0.4)] sm:p-7">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#a8a396]">Account</p>
          <h2 className="display mt-2 text-[20px] font-semibold">Password</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#736f65]">
            After you change it, the old env password stops working. Other signed-in browsers are
            signed out.
          </p>
          <div className="mt-6 max-w-[420px]">
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </main>
  );
}
