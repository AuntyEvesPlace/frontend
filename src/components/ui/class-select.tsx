import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ClassSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  classes: string[];
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  triggerClassName?: string;
}

export function ClassSelect({
  value,
  onValueChange,
  classes,
  label = "Class",
  placeholder = "Select a class",
  id = "class",
  className,
  triggerClassName,
}: ClassSelectProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {classes.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
