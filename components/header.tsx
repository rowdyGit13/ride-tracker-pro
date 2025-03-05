"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Car, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Ride Tracker Pro</h1>
        </div>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <NavigationMenuTrigger>Features</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {[
                    {
                      title: "Earnings Tracker",
                      href: "#",
                      description: "Track all your earnings across platforms"
                    },
                    {
                      title: "Expense Management",
                      href: "#",
                      description: "Log and categorize your business expenses"
                    },
                    {
                      title: "Performance Analytics",
                      href: "#",
                      description: "Visualize your performance with charts"
                    },
                    {
                      title: "Tax Preparation",
                      href: "#",
                      description: "Simplify your tax filing with organized data"
                    },
                  ].map((item) => (
                    <li key={item.title}>
                      <NavigationMenuLink asChild>
                        <a
                          href={item.href}
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">{item.title}</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link href="/pricing" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Pricing
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <SignedIn>
              <NavigationMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </SignedIn>
          </NavigationMenuList>
        </NavigationMenu>
        
        <div className="flex items-center space-x-4">
          <ModeToggle />
          
          <SignedOut>
            <div className="hidden md:block">
              <Button variant="default" size="sm" asChild>
                <SignInButton />
              </Button>
            </div>
          </SignedOut>
          
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </SignedIn>
          
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container mx-auto py-4 px-6 space-y-4">
            <Link
              href="/"
              className="flex items-center py-2 text-sm font-medium hover:text-primary"
              onClick={toggleMenu}
            >
              Home
            </Link>
            
            <div className="py-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Features</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="pl-4 mt-2 space-y-2 border-l border-border">
                <Link
                  href="#"
                  className="block py-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={toggleMenu}
                >
                  Earnings Tracker
                </Link>
                <Link
                  href="#"
                  className="block py-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={toggleMenu}
                >
                  Expense Management
                </Link>
                <Link
                  href="#"
                  className="block py-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={toggleMenu}
                >
                  Performance Analytics
                </Link>
                <Link
                  href="#"
                  className="block py-1 text-sm text-muted-foreground hover:text-foreground"
                  onClick={toggleMenu}
                >
                  Tax Preparation
                </Link>
              </div>
            </div>
            
            <Link
              href="/pricing"
              className="flex items-center py-2 text-sm font-medium hover:text-primary"
              onClick={toggleMenu}
            >
              Pricing
            </Link>
            
            <SignedIn>
              <Link
                href="/dashboard"
                className="flex items-center py-2 text-sm font-medium hover:text-primary"
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
            </SignedIn>
            
            <SignedOut>
              <div className="pt-2">
                <Button className="w-full" size="sm" asChild>
                  <SignInButton />
                </Button>
              </div>
            </SignedOut>
          </nav>
        </div>
      )}
    </header>
  );
}