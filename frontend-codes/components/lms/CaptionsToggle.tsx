
import React from 'react';
import { Button } from '@/components/ui/button';
import { Captions, CaptionsOff } from 'lucide-react';

interface CaptionsToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const CaptionsToggle: React.FC<CaptionsToggleProps> = ({
  enabled,
  onToggle
}) => {
  return (
    <Button 
      size="sm" 
      variant="ghost" 
      className={`text-white hover:bg-white/20 p-2 transition-colors ${enabled ? 'text-[#fdb606]' : ''}`}
      onClick={onToggle}
      title={enabled ? "Turn off captions" : "Turn on captions"}
    >
      {enabled ? <Captions className="w-5 h-5" /> : <CaptionsOff className="w-5 h-5" />}
    </Button>
  );
};
