import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School, Settings, X } from 'lucide-react';
import { getDevSubdomain, setDevSubdomain, clearDevSubdomain } from '../utils/devSubdomain';
import { updateSubdomainHeader } from '../services/api';

/**
 * A component that allows developers to select and change the development subdomain
 * This is only shown in development environments
 */
const DevSubdomainSelector: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [currentSubdomain, setCurrentSubdomain] = useState<string | null>(null);

  // Check if we're in development environment
  const isDevelopment = (): boolean => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/) !== null;
  };

  useEffect(() => {
    if (isDevelopment()) {
      const current = getDevSubdomain();
      setCurrentSubdomain(current);
      setSubdomain(current || '');
    }
  }, []);

  // Don't render in production
  if (!isDevelopment()) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subdomain.trim()) {
      setDevSubdomain(subdomain.trim());
      setCurrentSubdomain(subdomain.trim());
      updateSubdomainHeader();
      setIsVisible(false);
      
      // Optionally reload the page to apply changes
      if (window.confirm('Reload the page to apply the subdomain changes?')) {
        window.location.reload();
      }
    }
  };

  const handleClear = () => {
    clearDevSubdomain();
    setCurrentSubdomain(null);
    setSubdomain('');
    updateSubdomainHeader();
    setIsVisible(false);
    
    // Optionally reload the page to apply changes
    if (window.confirm('Reload the page to clear the subdomain?')) {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(!isVisible)}
          size="sm"
          variant="outline"
          className="rounded-full w-12 h-12 p-0 shadow-lg border-2 border-primary/20 bg-background/90 backdrop-blur-sm hover:bg-primary/10"
          title="Development Subdomain Selector"
        >
          <School className="h-5 w-5" />
        </Button>
      </div>

      {/* Subdomain selector panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50">
          <Card className="w-80 shadow-xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Dev Subdomain
                </CardTitle>
                <Button
                  onClick={() => setIsVisible(false)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {currentSubdomain && (
                <Badge variant="secondary" className="w-fit">
                  Current: {currentSubdomain}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="subdomain">School Subdomain</Label>
                  <Input
                    id="subdomain"
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="e.g., greenwood, demo, school1"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the school subdomain for testing
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1">
                    Set Subdomain
                  </Button>
                  {currentSubdomain && (
                    <Button 
                      type="button" 
                      onClick={handleClear}
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </form>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Common subdomains:</strong></p>
                <div className="flex flex-wrap gap-1">
                  {['greenwood', 'demo', 'test', 'school1'].map((sub) => (
                    <Button
                      key={sub}
                      onClick={() => setSubdomain(sub)}
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                    >
                      {sub}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default DevSubdomainSelector;