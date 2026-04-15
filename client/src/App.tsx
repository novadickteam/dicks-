import { Route, Router } from 'wouter';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './hooks/use-auth';
import { Toaster } from './components/ui/sonner';
import { HeroSection } from './components/HeroSection';
import { ImpactSection } from './components/ImpactSection';
import { VerticalGardensSection } from './components/VerticalGardensSection';
import { CompostingSection } from './components/CompostingSection';
import { TechnologiesSection } from './components/TechnologiesSection';
import { DashboardSection } from './components/DashboardSection';
import { FooterSection } from './components/FooterSection';
import { Navbar } from './components/Navbar';
import AuthSuccessPage from './pages/auth-success';
import { DonationsTracker } from './components/DonationsTracker';
import { Marketplace } from './components/Marketplace';
import { Education } from './components/Education';
import { PricingSection } from './components/PricingSection';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="app-theme">
      <AuthProvider>
        <Router>
          <Route path="/">
            {() => <HomePage />}
          </Route>
          <Route path="/dashboard">
            {() => <DashboardPage />}
          </Route>
          <Route path="/auth-success">
            {() => <AuthSuccessPage />}
          </Route>
          <Route path="/marketplace">
            {() => <MarketplacePage />}
          </Route>
          <Route path="/education">
            {() => <EducationPage />}
          </Route>
          <Route path="/donations">
            {() => <DonationsPage />}
          </Route>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <HeroSection />
      <ImpactSection />
      <VerticalGardensSection />
      <CompostingSection />
      <TechnologiesSection />
      <PricingSection />
      <DashboardSection />
      <FooterSection />
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <DashboardSection />
      </div>
    </div>
  );
}

function MarketplacePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Marketplace Sostenible</h1>
          <p className="text-muted-foreground">Adquiere tecnologías, herramientas e insumos directamente de productores locales.</p>
        </header>
        
        <Marketplace />
      </div>
      <FooterSection />
    </div>
  );
}

function EducationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-6">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Centro de Conocimiento</h1>
          <p className="text-xl text-muted-foreground">Recursos gratuitos y guías avanzadas para convertirte en un experto de la agricultura urbana y tecnológica.</p>
        </header>
        
        <Education />
      </div>
      <FooterSection />
    </div>
  );
}

function DonationsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-6">
        <header className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Muro de Impacto</h1>
          <p className="text-lg text-muted-foreground">Donamos automáticamente el 30% de cada suscripción comprada para financiar proyectos de agricultura urbana en zonas vulnerables.</p>
        </header>
        
        <DonationsTracker />
      </div>
      <FooterSection />
    </div>
  );
}
