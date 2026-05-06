import Link from 'next/link';
import { Heart, Instagram, Github } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="bg-white border-t border-cream-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex mb-3">
              <Logo size={28} textClassName="text-lg" />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Una plataforma que conecta gatitos que buscan hogar con familias llenas de amor.
              Adoptar es un acto de responsabilidad y ternura.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Plataforma</h4>
            <ul className="space-y-2">
              {[
                { href: '/cats', label: 'Ver gatos' },
                { href: '/cats/publish', label: 'Publicar un gato' },
                { href: '/donate', label: 'Donar' },
                { href: '/sponsors', label: 'Sponsors' },
                { href: '/dashboard', label: 'Mi panel' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-coral-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Comunidad</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-coral-100 hover:text-coral-500 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://github.com/LucasDeRivaDev" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-coral-100 hover:text-coral-500 transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} AdopcionWeb. Hecho con <Heart size={12} className="inline text-coral-400" /> en Argentina.
          </p>
          <p className="text-xs text-gray-400">
            Cada adopción, una vida que cambia.
          </p>
        </div>
      </div>
    </footer>
  );
}
