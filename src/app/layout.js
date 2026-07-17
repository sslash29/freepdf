import "./globals.css";
import ErrorOverlay from "@/components/ui/ErrorOverlay"

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
    >
    <body className="">
        {children}
        <ErrorOverlay />
      </body>
    </html>
  );
}
