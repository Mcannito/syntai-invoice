import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "secondary";
}

export const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatsCardProps) => {
  return (
    <Card className={cn(
      "overflow-hidden transition-smooth hover:shadow-medical-md",
      variant === "primary" && "border-primary/20 bg-primary-light",
      variant === "secondary" && "border-secondary/20 bg-secondary-light"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-secondary" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-lg p-3",
            variant === "primary" && "bg-primary text-primary-foreground",
            variant === "secondary" && "bg-secondary text-secondary-foreground",
            variant === "default" && "bg-muted text-foreground"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
