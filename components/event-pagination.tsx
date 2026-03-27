import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { EventDetail } from "@/lib/types";

interface EventPaginationProps {
  prevEvent: EventDetail | null;
  nextEvent: EventDetail | null;
}

export function EventPagination({ prevEvent, nextEvent }: EventPaginationProps) {
  return (
    <div className="pagination flex mx-auto justify-center w-xs px-4 mt-8">
      {prevEvent ? (
        <Button asChild variant="outline" size="icon" aria-label="Go Back" className="mx-2">
          <Link href={`/events/${prevEvent.id}`}>
            <ArrowLeftIcon />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" aria-label="Go Back" className="mx-2" disabled>
          <ArrowLeftIcon />
        </Button>
      )}
      {nextEvent ? (
        <Button asChild variant="outline" size="icon" aria-label="Go Forward" className="mx-2">
          <Link href={`/events/${nextEvent.id}`}>
            <ArrowRightIcon />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" aria-label="Go Forward" className="mx-2" disabled>
          <ArrowRightIcon />
        </Button>
      )}
    </div>
  );
}
