import { Card } from "../../../shared/components/ui/Card";

interface PlaceholderProps {
  title?: string;
  subtitle?: string;
}

export function Placeholder({
  title = "New Feature",
  subtitle = "(Coming Soon)",
}: PlaceholderProps) {
  return (
    <Card className="p-8 shadow-lg h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mx-auto mb-4 animate-pulse" />
        <p className="text-gray-500 text-sm mb-2">{title}</p>
        <p className="text-gray-400 text-xs">{subtitle}</p>
      </div>
    </Card>
  );
}