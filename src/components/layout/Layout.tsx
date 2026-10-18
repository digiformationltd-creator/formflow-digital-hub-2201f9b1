import DigiNav from "@/components/DigiNav";
import DigiFooter from "@/components/DigiFooter";
import UserDrawer from "@/components/UserDrawer";
import PageTransition from "@/components/PageTransition";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-background focus:text-foreground focus:p-3 focus:ring-2 focus:ring-primary">Skip to main content</a>
    <DigiNav />
    <main id="main-content" tabIndex={-1} className="flex-1 pt-20 sm:pt-24">
      <PageTransition>{children}</PageTransition>
    </main>
    <DigiFooter />
    <UserDrawer />
  </div>
);

export default Layout;


