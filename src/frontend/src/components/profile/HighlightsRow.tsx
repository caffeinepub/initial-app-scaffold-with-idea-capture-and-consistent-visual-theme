import { ScrollArea } from '../ui/scroll-area';
import { Plus } from 'lucide-react';

export function HighlightsRow() {
  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          <div className="flex flex-col items-center gap-2 cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">New</span>
          </div>

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 opacity-50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-muted" />
              <span className="text-xs text-muted-foreground">Highlight</span>
            </div>
          ))}
        </div>
      </ScrollArea>
      <p className="text-xs text-center text-muted-foreground mt-2">Highlights coming soon</p>
    </div>
  );
}
