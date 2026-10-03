import type { Metadata } from "next";
import "@/app/globals.css";
import { SellerDataProvider } from "@/components/seller-data-provider";
import { AuthProvider } from "@/components/auth-provider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CookieConsent } from "@/components/cookie-consent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lurjing.web.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "เหลือจริง — รู้กำไรจริงของร้านออนไลน์",
    template: "%s | เหลือจริง",
  },
  description:
    "รวมยอดขาย ต้นทุน ค่าธรรมเนียม Ads Affiliate และคืนสินค้า เพื่อดูว่าร้านเหลือกำไรจริงเท่าไร",
  openGraph: {
    title: "เหลือจริง",
    description: "ยอดขายไม่ใช่กำไร มาดูว่าเหลือจริงเท่าไร",
    url: siteUrl,
    images: ['/assets/images/lurjingmetadata.png'],
    siteName: "เหลือจริง",
    locale: "th_TH",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>
          <AnalyticsProvider>
            <SellerDataProvider>{children}</SellerDataProvider>
          </AnalyticsProvider>
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
