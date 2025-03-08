// create a simple page that gives an email to direct feedback
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Mail } from "lucide-react";

export default async function Feedback() {
  const { userId } = await auth();
  const emailAddress = "ridetrackerprohelp@gmail.com";

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Need Help?</CardTitle>
          <CardDescription>Contact our support team directly</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="bg-primary/10 p-3 rounded-full">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium text-lg">{emailAddress}</p>
            <p className="text-muted-foreground text-sm mt-1">We typically respond within 24 hours</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
