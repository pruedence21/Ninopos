'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvitationData {
    email: string;
    tenantName: string;
    role: string;
    inviterName: string;
}

export default function AcceptInvitationPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [invitation, setInvitation] = useState<InvitationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [accepting, setAccepting] = useState(false);

    // Form fields for new users
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        fetchInvitation();
    }, [token]);

    const fetchInvitation = async () => {
        try {
            const response = await fetch(`/api/invitations/${token}`);
            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Invalid invitation');
                return;
            }

            setInvitation(data);
        } catch (err) {
            setError('Failed to load invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setAccepting(true);

        try {
            const response = await fetch('/api/invitations/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    name,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to accept invitation');
                return;
            }

            // Redirect to login or dashboard
            router.push('/login?message=invitation-accepted');
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white">
                <p>Loading invitation...</p>
            </div>
        );
    }

    if (error && !invitation) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
                <Card className="w-full max-w-md p-8">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Invalid Invitation</h1>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <Button
                            className="mt-6"
                            onClick={() => router.push('/')}
                        >
                            Go to Home
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
            <Card className="w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-3xl">📧</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">You're Invited!</h1>
                    <p className="mt-2 text-gray-600">
                        {invitation?.inviterName} has invited you to join{' '}
                        <strong>{invitation?.tenantName}</strong> as a{' '}
                        <strong>{invitation?.role}</strong>.
                    </p>
                </div>

                <form onSubmit={handleAccept} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={invitation?.email || ''}
                            disabled
                            className="bg-gray-50"
                        />
                    </div>

                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={accepting}>
                        {accepting ? 'Accepting...' : 'Accept Invitation'}
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </a>
                    </p>
                </form>
            </Card>
        </div>
    );
}
