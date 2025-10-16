'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Radio, Loader2 } from 'lucide-react';

export default function StoreLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check BOTH locations for users
      let userDoc = null;
      let userData = null;
      let userId = null;

      // Try new location first: config/users/list
      const configUsersRef = collection(db, 'config', 'users', 'list');
      const configQuery = query(configUsersRef, where('email', '==', email.toLowerCase().trim()));
      const configSnapshot = await getDocs(configQuery);

      if (!configSnapshot.empty) {
        userDoc = configSnapshot.docs[0];
        userData = userDoc.data();
        userId = userDoc.id;
      } else {
        // Try old location: users
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, where('email', '==', email.toLowerCase().trim()));
        const usersSnapshot = await getDocs(usersQuery);

        if (!usersSnapshot.empty) {
          userDoc = usersSnapshot.docs[0];
          userData = userDoc.data();
          userId = userDoc.id;
        }
      }

      if (!userData) {
        setError('Email not found. Please contact your administrator.');
        setLoading(false);
        return;
      }

      // Store user session
      sessionStorage.setItem('storeUser', JSON.stringify({
        id: userId,
        email: userData.email,
        name: userData.name,
        deviceId: userData.deviceId,
      }));

      // Redirect to store dashboard
      router.push('/store/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Radio className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Butik Login</CardTitle>
          <p className="text-sm text-gray-500">Ange din butiks email-adress</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="butik@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loggar in...
                </>
              ) : (
                'Logga in'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Behöver du hjälp? Kontakta din administratör
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
