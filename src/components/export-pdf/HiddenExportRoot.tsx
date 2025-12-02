// components/export-pdf/HiddenExportRoot.tsx
import GoogleAnalyticsExportPage from "../../pages/export-pages/GoogleAnalyticsExportPage";
import SocialMediaExportPage from "../../pages/export-pages/SocialMediaExportPage";
import type { Platform } from "../../config/chartConfigs";

export const PAGE_IDS = {
  google: "google-fullpage",
  instagram: "instagram-fullpage",
  twitter: "twitter-fullpage",
  facebook: "facebook-fullpage",
} as const;

interface HiddenExportRootProps {
  registerPage: (id: string, el: HTMLElement | null) => void;
}

export default function HiddenExportRoot({ registerPage }: HiddenExportRootProps) {
  return (
    <div
      aria-hidden
      className="fixed -left-[9999px] -top-[9999px] w-[1200px] pointer-events-none opacity-0"
    >
      {/* Google Analytics full-page export */}
      <GoogleAnalyticsExportPage
        domId={PAGE_IDS.google}
        registerPage={registerPage}
      />

      {/* Social media full-page exports */}
      <SocialMediaExportPage
        platform={"instagram" as Platform}
        domId={PAGE_IDS.instagram}
        registerPage={registerPage}
      />
      <SocialMediaExportPage
        platform={"twitter" as Platform}
        domId={PAGE_IDS.twitter}
        registerPage={registerPage}
      />
      <SocialMediaExportPage
        platform={"facebook" as Platform}
        domId={PAGE_IDS.facebook}
        registerPage={registerPage}
      />
    </div>
  );
}