import { Search, Filter, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LeadFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
  onNewLead: () => void;
  className?: string;
}

export function LeadFilters({
  searchQuery,
  onSearchChange,
  onSearch,
  isSearching,
  onNewLead,
  className,
}: LeadFiltersProps) {
  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={onSearch} className="flex-1 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              className="pl-10 w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={isSearching}
            />
          </div>
          <Button 
            type="submit" 
            variant="outline" 
            size="sm"
            className="flex-shrink-0 border-gray-300 hover:bg-gray-100"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-shrink-0 border-gray-300 hover:bg-gray-100"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
          <Button 
            size="sm" 
            className="flex-shrink-0 bg-blue-600 text-white hover:bg-blue-700"
            onClick={onNewLead}
          >
            <Phone className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      </div>
    </div>
  );
}
