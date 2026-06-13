import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, Lock, Home } from 'lucide-react';
import { ROUTES } from '@/config/routes';

function UnauthPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center bg-gray-50/50">
      <div className="mb-8">
        <div className="relative flex items-center justify-center w-32 h-32 mx-auto rounded-full bg-red-100/80 shadow-inner">
          <Lock className="w-16 h-16 text-red-600 animate-pulse" />
          <div className="absolute -inset-2 bg-red-400 rounded-full opacity-20 blur-xl animate-ping"></div>
        </div>
      </div>
      
      <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight mb-4 drop-shadow-sm">
        Access Denied
      </h1>
      
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
        You don't have permission
      </h2>
      
      <p className="text-gray-500 max-w-md mx-auto mb-10 text-base sm:text-lg leading-relaxed">
        You don't have the necessary permissions to access this page or resource. Please contact your administrator if you believe this is an error.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => navigate(ROUTES.home)} 
          size="lg" 
          className="flex items-center gap-2 rounded-full px-8 py-6 text-base font-semibold hover:-translate-y-1 transition-all shadow-lg shadow-red-500/30"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate(ROUTES.login)} 
          className="flex items-center gap-2 rounded-full px-8 py-6 text-base font-semibold hover:scale-105 transition-transform"
        >
          <LogIn className="w-5 h-5" />
          Login with Another Account
        </Button>
      </div>
    </div>
  );
}

export default UnauthPage;
