'use client';

import { useEffect, useState } from 'react';
import { useReseller } from '@/contexts/ResellerContext';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function ResetResellerButton() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null; // Return null on server-side to avoid hydration mismatch
  }
  
  try {
    const { lockedRef, resetReseller } = useReseller();
    
    // Only show when there's a locked ref
    if (!lockedRef) return null;
    
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={resetReseller}
        className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
      >
        <RotateCcw className="h-4 w-4" />
        Reset Reseller
      </Button>
    );
  } catch (error) {
    // Fail silently if context is not available
    return null;
  }
}