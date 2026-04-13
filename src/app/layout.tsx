import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { Space_Grotesk, Bricolage_Grotesque } from "next/font/google";
import QueryProvider from "../hooks/QueryProvider";
import Navbar from "../components/Navbar";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  adjustFontFallback: false,
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <html lang="en" className={`${spaceGrotesk.variable} ${bricolage.variable}`}>
        <body className="font-sans text-[15px] antialiased">
          <SignedIn>
            <Navbar />
          </SignedIn>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
