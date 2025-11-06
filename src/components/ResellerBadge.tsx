'use client';

import { useEffect, useState } from 'react';
import { useReseller } from '@/contexts/ResellerContext';
import { Badge } from '@/components/ui/badge';

export function ResellerBadge() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null; // Return null on server-side to avoid hydration mismatch
  }
  
  try {
    const { lockedRef, getResellerData } = useReseller();
    
    if (!lockedRef) return null;
    
    const resellerData = getResellerData();
    
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
        Via {resellerData?.name || lockedRef}
      </Badge>
    );
  } catch (error) {
    // Fail silently if context is not available
    return null;
  }
}