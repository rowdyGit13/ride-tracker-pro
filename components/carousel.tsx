"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";

type CarouselProps = {
  images: {
    src: string;
    alt: string;
  }[];
  autoplayInterval?: number;
  className?: string;
};

export function Carousel({ images, autoplayInterval = 5000, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Set up autoplay
  useEffect(() => {
    const interval = setInterval(goToNext, autoplayInterval);
    return () => clearInterval(interval);
  }, [goToNext, autoplayInterval]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-xl", className)}>
      {/* Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            "absolute h-full w-full transition-opacity duration-500",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Navigation arrows */}
      <div className="absolute inset-0 flex items-center justify-between p-4 z-20">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={goToPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
          onClick={goToNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {images.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full p-0", 
              index === currentIndex 
                ? "text-primary bg-background/50" 
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => goToSlide(index)}
          >
            <Circle 
              className={cn(
                "h-2 w-2", 
                index === currentIndex ? "fill-current" : ""
              )} 
            />
          </Button>
        ))}
      </div>
    </div>
  );
} 