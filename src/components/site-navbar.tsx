"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Search, Menu, X, Home, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/contact", label: "Contact", icon: Phone },
];

export function SiteNavbar(){
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold">Devlog Store</Link>
        </div>

        <div className="ml-6 hidden md:flex items-center gap-1">
          {nav.map(({href,label,icon:Icon}) => (
            <Link key={href} href={href} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:text-primary ${pathname===href?"text-primary bg-primary/5":"text-muted-foreground"}`}>
              <Icon className="h-4 w-4"/> {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search"><Search className="h-5 w-5"/></Button>
          <Link href="/cart" className="p-2"><ShoppingCart className="h-5 w-5"/></Link>
          <Link href="/admin" className="p-2"><User className="h-5 w-5"/></Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu"><Menu className="h-5 w-5"/></Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold">Menu</span>
                <Button variant="ghost" size="icon" onClick={()=>setOpen(false)} aria-label="Close"><X className="h-5 w-5"/></Button>
              </div>
              <div className="grid gap-1">
                {nav.map(({href,label,icon:Icon}) => (
                  <Link key={href} href={href} onClick={()=>setOpen(false)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted ${pathname===href?"text-primary bg-primary/5":""}`}>
                    <Icon className="h-4 w-4"/> {label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
