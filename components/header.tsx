"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { Car, Menu, X } from "lucide-react";

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
            
            <SignedIn>
              <NavigationMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/forms" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Forms
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
            
            <SignedIn>
              <Link
                href="/dashboard"
                className="flex items-center py-2 text-sm font-medium hover:text-primary"
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
              <Link
                href="/forms"
                className="flex items-center py-2 text-sm font-medium hover:text-primary"
                onClick={toggleMenu}
              >
                Forms
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