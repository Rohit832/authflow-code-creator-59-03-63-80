
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Users, UserCheck, Building } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="text-8xl font-bold text-gray-300 mb-2">404</div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Oops! Page not found
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">
              Tried to access: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{location.pathname}</span>
            </p>
          </div>
          
          <div className="space-y-3">
            <Link to="/" className="w-full">
              <Button variant="default" className="w-full flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go to Homepage
              </Button>
            </Link>
            
            <Link to="/client-auth" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Client Login
              </Button>
            </Link>
            
            <Link to="/admin-auth" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Building className="w-4 h-4" />
                Admin Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
