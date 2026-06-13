import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, MapPinOff } from 'lucide-react';
import { ROUTES } from '@/config/routes';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-gray-50/50">
      <div className="mb-8">
        <div className="relative flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-orange-100/80 shadow-inner">
          <MapPinOff className="w-16 h-16 text-orange-600 animate-pulse" />
        </div>
      </div>
      
      <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight mb-4 drop-shadow-sm">
        404
      </h1>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
        Oops! We lost this page
      </h2>
      
      <p className="text-gray-500 max-w-md mx-auto mb-10 text-base sm:text-lg leading-relaxed">
        We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => navigate(ROUTES.home)} 
          size="lg" 
          className="flex items-center gap-2 rounded-full px-8 py-6 text-base font-semibold hover:-translate-y-1 transition-all shadow-lg shadow-orange-500/30"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
