'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { isValidSubdomain, sanitizeSubdomain } from '@/lib/tenant/subdomain';

export default function TenantRegistrationPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        businessName: '',
        subdomain: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSubdomain, setCheckingSubdomain] = useState(false);

    const handleSubdomainChange = (value: string) => {
        const sanitized = sanitizeSubdomain(value);
        setFormData({ ...formData, subdomain: sanitized });
    };

    const checkSubdomainAvailability = async (subdomain: string) => {
        if (!subdomain || !isValidSubdomain(subdomain)) {
            return false;
        }

        setCheckingSubdomain(true);
        try {
            const response = await fetch(
                `/api/tenant/check-subdomain?subdomain=${subdomain}`
            );
            const data = await response.json();
            return data.available;
        } catch (err) {
            return false;
        } finally {
            setCheckingSubdomain(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.businessName || !formData.subdomain) {
            setError('Please fill in all fields');
            return;
        }

        if (!isValidSubdomain(formData.subdomain)) {
            setError('Invalid subdomain format');
            return;
        }

        setLoading(true);

        try {
            // Check subdomain availability
            const isAvailable = await checkSubdomainAvailability(formData.subdomain);
            if (!isAvailable) {
                setError('Subdomain is already taken');
                setLoading(false);
                return;
            }

            // Create tenant
            const response = await fetch('/api/tenant/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.businessName,
                    subdomain: formData.subdomain,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to create tenant');
                return;
            }

            // Save tenant ID to localStorage for plan selection
            localStorage.setItem('currentTenantId', data.tenantId);

            // Redirect to plan selection
            router.push(`/register/plan?tenantId=${data.tenantId}`);
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
            <Card className="w-full max-w-md p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Setup Your Petshop</h1>
                    <p className="mt-2 text-gray-600">
                        Create your subdomain and start managing your business
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                            id="businessName"
                            type="text"
                            value={formData.businessName}
                            onChange={(e) =>
                                setFormData({ ...formData, businessName: e.target.value })
                            }
                            required
                            placeholder="My Petshop"
                        />
                    </div>

                    <div>
                        <Label htmlFor="subdomain">Subdomain</Label>
                        <div className="flex items-center">
                            <Input
                                id="subdomain"
                                type="text"
                                value={formData.subdomain}
                                onChange={(e) => handleSubdomainChange(e.target.value)}
                                required
                                placeholder="mypetshop"
                                className="rounded-r-none"
                            />
                            <span className="rounded-r-md border border-l-0 border-input bg-gray-100 px-3 py-2 text-sm text-gray-500">
                                .{process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'yourapp.com'}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            3-63 characters, lowercase letters, numbers, and hyphens only
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || checkingSubdomain}
                    >
                        {loading ? 'Creating...' : 'Continue to Plan Selection'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
