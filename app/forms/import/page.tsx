import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DataImportForm } from "@/components/forms/data-import-form";

export const metadata = {
  title: "Import Data | Ride Tracker Pro",
  description: "Import data in bulk to your Ride Tracker Pro account",
};

export default async function ImportDataPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/forms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Import Data</h1>
      </div>
      
      <div className="bg-card rounded-lg border shadow p-6">
        <DataImportForm />
      </div>
    </div>
  );
} 