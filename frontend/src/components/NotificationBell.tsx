import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMedicines } from "@/hooks/useMedicines";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NotificationBell() {
    const { logs } = useMedicines();

    // Check for missed medicines today
    const today = new Date().toISOString().split("T")[0];
    const missedCount = logs.filter(
        (l) => l.status === "missed" && l.date === today
    ).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="relative">
                    <Bell className="h-5 w-5" />
                    {missedCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {missedCount > 0 ? (
                    <DropdownMenuItem className="text-destructive">
                        You have {missedCount} missed medicine(s) today!
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem>No new notifications</DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
