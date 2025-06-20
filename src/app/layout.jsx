
import "./globals.css";
import Providers from "./providers";
import { GoogleAnalytics } from "@next/third-parties/google"

export const metadata = {
  title: "ระบบจัดการเว็บไซต์",
  description: "ระบบจัดการเว็บไซต์",
  manifest: '/hospital/manifest.json',
  icons: {
    icon: [
      {
        url: '/hospital/images/moph-sm.png',
        href: '/hospital/images/moph-sm.png'
      }
    ]
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
        {children}
        <GoogleAnalytics gaId="G-8M5F497W0J" />
        </Providers>
      </body>
    </html>
  );
}
