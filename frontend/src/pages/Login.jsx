import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, login, demoCredentials } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get preferred role from location state (from landing page)
  const preferredRole = location.state?.preferredRole;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Navigation will happen automatically due to auth state change
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const fillDemoCredentials = (index) => {
    const cred = demoCredentials[index];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.password);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-kalam-orange to-kalam-blue rounded-neumorphic mx-auto mb-4 flex items-center justify-center shadow-neumorphic">
            <span className="text-white font-bold text-2xl">TK</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Todays Kalam Foundation</h1>
          <p className="text-gray-600 mt-2">Dashboard Login</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="kalam"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogIn className="h-5 w-5 mr-2" />
                )}
                Sign In
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Demo Credentials:</p>
              <div className="space-y-2">
                {demoCredentials?.map((cred, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() => fillDemoCredentials(index)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {cred.role === 'admin' ? 'Admin' : `Tutor - ${cred.center}`}
                      </span>
                      <span className="text-xs text-gray-500">{cred.email}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
