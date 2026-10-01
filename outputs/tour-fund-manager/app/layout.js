import './globals.css';
import AppShell from '@/components/AppShell';
export const metadata = { title: 'বন্ধু ফান্ড | Friend Group Fund Manager', description: 'বন্ধুদের গ্রুপ ফান্ড, খরচ, দেনা-পাওনা ও ভ্রমণ পরিকল্পনা' };
export default function RootLayout({ children }) { return <html lang="bn"><body><AppShell>{children}</AppShell></body></html>; }
