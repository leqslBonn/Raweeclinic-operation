import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Follow Up | Rawee Clinic",
  description: "ระบบดูแลลูกค้าและบริหารงาน Rawee Aesthetic Clinic",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
