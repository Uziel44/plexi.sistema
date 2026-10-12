import { Button } from "@/components/ui/button";
import { ShadcnSpinner } from "./shadcn-spinner";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4">
      <Button disabled className="flex items-center  gap-2">
        <ShadcnSpinner className="size-8" />
        Loading your content...
      </Button>
    </div>
  );
}
