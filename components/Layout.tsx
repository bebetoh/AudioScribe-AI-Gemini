import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100 to-slate-50 -z-10"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="absolute top-48 -left-24 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 -z-10"></div>

      <main className="relative z-10">
        {children}
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>Desenvolvido com Gemini API • React • Tailwind</p>
      </footer>
    </div>
  );
};