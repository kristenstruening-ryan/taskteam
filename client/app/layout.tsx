import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0f172a] text-slate-200 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200 antialiased overflow-x-hidden">
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full max-w-400 mx-auto px-6 pb-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
