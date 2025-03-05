import { ArrowRight, Car, ChartBar, Clock, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background z-0" />
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Track Your Rides. <br />
                <span className="text-primary">Maximize Your Earnings.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                The complete solution for rideshare drivers to track earnings, expenses, and optimize performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/notes">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/dashboard-preview.jpg"
                alt="Ride Tracker Dashboard"
                fill
                className="object-cover"
                priority
                // Replace with your actual dashboard preview image
                // If you don't have one, you can use a placeholder or create a mockup
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for rideshare drivers to simplify tracking and maximize profitability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="h-10 w-10 text-primary" />,
                title: "Earnings Tracker",
                description: "Log and categorize all your earnings with detailed breakdowns by platform, time, and location."
              },
              {
                icon: <Car className="h-10 w-10 text-primary" />,
                title: "Expense Management",
                description: "Track gas, maintenance, and other expenses. Automatically calculate tax deductions."
              },
              {
                icon: <ChartBar className="h-10 w-10 text-primary" />,
                title: "Performance Analytics",
                description: "Visualize your performance with intuitive charts and identify opportunities to increase earnings."
              },
              {
                icon: <Clock className="h-10 w-10 text-primary" />,
                title: "Time Optimization",
                description: "Analyze your most profitable hours and locations to optimize your driving schedule."
              },
              {
                icon: <MapPin className="h-10 w-10 text-primary" />,
                title: "Location Insights",
                description: "Discover high-demand areas and optimize your routes for maximum efficiency."
              },
              {
                icon: <Image src="/logo-small.svg" alt="Logo" width={40} height={40} className="text-primary" />,
                title: "Multi-Platform Support",
                description: "Works with all major rideshare platforms including Uber, Lyft, and delivery services."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-card p-6 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to optimize your rideshare business?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of drivers who are increasing their earnings by up to 30% with Ride Tracker Pro.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/notes">Start Tracking Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
