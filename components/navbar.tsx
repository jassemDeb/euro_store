"use client";

import Link from "next/link";
import { Menu, X, LogOut, ShoppingBag, Settings } from "lucide-react";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/cart-context";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import SearchBar from "@/components/search-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";

interface Subcategory {
  name: string;
  query?: string;
  href?: string;
}

interface Category {
  label: string;
  subcategories?: Subcategory[];
  url?: string;
}

const collectionCategories: Category[] = [
  {
    label: "Cuisine",
    subcategories: [
      { name: "Robot Cuiseur", query: "robot-cuiseur" },
      { name: "Airfryer", query: "airfryer" },
      { name: "Pétrin", query: "pétrin" },
      { name: "Machine à Café", query: "machine-à-café" },
      { name: "Multicuiseur", query: "multicuiseur" },
      { name: "Grille Pain", query: "grille-pain" },
      { name: "Bouilloire", query: "bouilloire" },
      { name: "Blander", query: "blander" },
      { name: "Mixeurs Plongeants", query: "mixeurs-plongeants" },
      { name: "Barbecues", query: "barbecues" },
      { name: "Accessoires", query: "accessoires" },
    ],
  },
  {
    label: "Soin du Corps",
    subcategories: [
      { name: "Sèche-Cheveux", query: "séche-cheveux" },
      { name: "Lisseur", query: "lisseur" },
      { name: "Épilateur", query: "épilateur" },
      { name: "Brosse", query: "brosse" },
      { name: "Tondeuse", query: "tondeuse" },
    ],
  },
  {
    label: "Aspiration",
    subcategories: [
      { name: "Aspirateur Robot", query: "aspirateur-robot" },
      { name: "Aspirateur Verticaux", query: "aspirateur-verticaux" },
      { name: "Aspirateur Laveur", query: "aspirateur-laveur" },
      { name: "Aspirateur à Main", query: "aspirateur-à-main" },
      { name: "Aspirateur à Vapeur", query: "aspirateur-à-vapeur" },
    ],
  },
  {
    label: "Promo",
    url: "/",
  },
  {
    label: "Top Vente",
    url: "/",
  },
];

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { items } = useCart();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setOpenCategory(null);
  };

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="border-b relative z-50">
      <Container>
        <div className="relative px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between bg-white">
          <div className="flex items-center">
            <Button
              onClick={toggleMenu}
              className="p-2 lg:hidden text-[#000000] hover:bg-[#363636]/10"
              variant="ghost"
              aria-label="Toggle Menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            <Link href="/" className="ml-4 lg:ml-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={150}
                height={150}
                className="object-contain"
                priority={true}
                loading="eager"
                onError={(e) => {
                  console.error("Failed to load logo image");
                  const target = e.target as HTMLImageElement;
                  // Fallback to a text logo if image fails to load
                  if (target.parentElement) {
                    target.style.display = 'none';
                    const textLogo = document.createElement('span');
                    textLogo.textContent = 'Dhafer';
                    textLogo.className = 'text-xl font-bold text-[#363636]';
                    target.parentElement.appendChild(textLogo);
                  }
                }}
                quality={100}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {collectionCategories.map((category) => (
                <li key={category.label} className="relative group">
                  {category.url ? (
                    <Link
                      href={category.url}
                      className="text-gray-800 hover:text-[#B4941F] transition-colors"
                    >
                      {category.label}
                    </Link>
                  ) : (
                    <div className="relative">
                      <button
                        className="text-gray-800 hover:text-[#B4941F] transition-colors"
                        onClick={() => toggleCategory(category.label)}
                      >
                        {category.label}
                      </button>
                      {category.subcategories && (
                        <div className="hidden group-hover:block absolute left-0 top-full w-48 bg-white shadow-lg rounded-md border border-[#363636]/20 z-50">
                          <ul className="py-2">
                            {category.subcategories.map((subcategory) => (
                              <li key={subcategory.name}>
                                <Link
                                  href={`/collections?category=${subcategory.query}`}
                                  className="block px-4 py-2 hover:text-[#B4941F]"
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side - Search, Cart, and Auth */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-4">
              <SearchBar />
            </div>

            <Link
              href="/cart"
              className="relative text-gray-800 hover:text-[#B4941F] transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-[#000000] hover:bg-[#B4941F] text-white text-xs flex items-center justify-center">
                {items.length > 0 ? items.length : ''}
              </div>
            </Link>

            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="relative h-8 w-8 bg-[#000000] hover:bg-[#363636]/80 rounded-full"
                  >
                    <div className="flex items-center justify-center h-full w-full bg-[#000000] text-white rounded-full">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Derniére connexion: {new Date().toLocaleString()}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="w-full">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Mes commandes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Deconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-[#B4941F] transition-colors"
                  >
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="bg-[#000000] text-white hover:bg-[#B4941F]/90 transition-colors"
                  >
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="lg:hidden fixed top-[64px] left-0 right-0 bottom-0 bg-white overflow-y-auto z-50 border-t border-[#363636]/20"
          >
            <div className="sticky top-0 p-4 bg-white shadow-sm">
              <SearchBar />
            </div>
            <div className="px-4 py-2">
              <ul className="space-y-3">
                {collectionCategories.map((category) => (
                  <li key={category.label}>
                    {category.url ? (
                      <Link
                        href={category.url}
                        className="block w-full py-2 text-gray-800 hover:text-[#000000] transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {category.label}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleCategory(category.label)}
                          className="flex items-center justify-between w-full py-2 text-gray-800 hover:text-[#000000] transition-colors"
                        >
                          <span>{category.label}</span>
                          {openCategory === category.label ? (
                            <X size={18} />
                          ) : (
                            <Menu size={18} />
                          )}
                        </button>
                        {category.subcategories && openCategory === category.label && (
                          <ul className="ml-4 mt-1 space-y-2 border-l-2 border-[#000000]/20 pl-4">
                            {category.subcategories.map((subcategory) => (
                              <li key={subcategory.name}>
                                <Link
                                  href={`/collections?category=${subcategory.query}`}
                                  onClick={() => setIsOpen(false)}
                                  className="block py-1.5 text-gray-600 hover:text-[#000000] transition-colors"
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}