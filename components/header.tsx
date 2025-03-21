"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">Ride Tracker Pro</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-grow md:justify-end">
          <NavigationMenu className="!justify-end !max-w-full">
            <NavigationMenuList className="text-lg !justify-end">
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              
              <SignedOut>
                <NavigationMenuItem>
                  <Link href="/auth/signup" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Sign Up
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </SignedOut>
              
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

          <div className="flex items-center gap-4 pl-6">
            <ModeToggle />
            <SignedOut>
              <Link href="/auth/login">
                <Button variant="default" size="sm" className="text-base">
                  Sign In
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t p-4">
          <nav className="flex flex-col space-y-4 text-lg">
            <Link 
              href="/" 
              className="font-medium hover:text-primary"
              onClick={toggleMenu}
            >
              Home
            </Link>
            
            <SignedOut>
              <Link 
                href="/auth/signup" 
                className="font-medium hover:text-primary"
                onClick={toggleMenu}
              >
                Sign Up
              </Link>
              <Link href="/auth/login">
                <Button variant="default" size="sm" className="w-full text-base">
                  Sign In
                </Button>
              </Link>
            </SignedOut>
            
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="font-medium hover:text-primary"
                onClick={toggleMenu}
              >
                Dashboard
              </Link>
              <Link 
                href="/forms" 
                className="font-medium hover:text-primary"
                onClick={toggleMenu}
              >
                Forms
              </Link>
              <div className="pt-2 flex justify-start">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </nav>
        </div>
      )}
    </header>
  );
}