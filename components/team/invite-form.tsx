'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function InviteForm() {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'staff'>('staff');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        try {
            const response = await fetch('/api/invitations/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send invitation');
                return;
            }

            setSuccess(true);
            setEmail('');
            setRole('staff');

            // Refresh page after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="colleague@example.com"
                />
            </div>

            <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: 'admin' | 'staff') => setRole(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                    Admin can manage products and invite staff. Staff can only view and create transactions.
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                    Invitation sent successfully!
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
        </form>
    );
}
