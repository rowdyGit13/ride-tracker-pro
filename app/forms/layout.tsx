import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Forms | Ride Tracker Pro",
  description: "Add and edit your rides, vehicles, and expenses",
};

export default async function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            Add and manage your rides, vehicles, and expenses
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 