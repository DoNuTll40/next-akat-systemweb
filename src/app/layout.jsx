
import "./globals.css";
import Providers from "./providers";
import { GoogleAnalytics } from "@next/third-parties/google"

export const metadata = {
  title: "ระบบจัดการเว็บไซต์",
  description: "ระบบจัดการเว็บไซต์",
  icons: {
    icon: [
      {
        url: 'http://akathospital.com/assets/images/moph-sm.png',
        href: 'http://akathospital.com/assets/images/moph-sm.png'
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
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-8M5F497W0J" />
    </html>
  );
}
