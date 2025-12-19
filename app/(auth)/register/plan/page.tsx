'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Plan {
    id: string;
    name: string;
    price: string;
    interval: 'monthly' | 'yearly';
    description: string | null;
}

export default function PlanSelectionPage() {
    const searchParams = useSearchParams();
    const tenantId = searchParams.get('tenantId');
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await fetch('/api/billing/plans');
            const data = await response.json();
            setPlans(data.plans || []);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (planId: string) => {
        if (!tenantId) {
            alert('Tenant ID missing');
            return;
        }

        setProcessing(true);

        try {
            const response = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    planId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Failed to create checkout');
                return;
            }

            // Load Midtrans Snap
            // @ts-ignore
            if (window.snap) {
                // @ts-ignore
                window.snap.pay(data.token, {
                    onSuccess: function () {
                        window.location.href = '/dashboard';
                    },
                    onPending: function () {
                        window.location.href = '/billing/pending';
                    },
                    onError: function () {
                        alert('Payment failed');
                    },
                    onClose: function () {
                        setProcessing(false);
                    },
                });
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading plans...</p>
            </div>
        );
    }

    return (
        <>
            <script
                src={`https://app.${process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
                        ? 'midtrans'
                        : 'sandbox.midtrans'
                    }.com/snap/snap.js`}
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
            />
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
                <div className="mx-auto max-w-4xl py-12">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
                        <p className="mt-3 text-lg text-gray-600">
                            Select a subscription plan to get started
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {plans.map((plan) => (
                            <Card key={plan.id} className="p-8">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                                    <div className="mt-4 flex items-baseline">
                                        <span className="text-4xl font-bold">
                                            Rp {Number(plan.price).toLocaleString('id-ID')}
                                        </span>
                                        <span className="ml-2 text-gray-500">
                                            /{plan.interval === 'monthly' ? 'month' : 'year'}
                                        </span>
                                    </div>
                                    {plan.description && (
                                        <p className="mt-4 text-gray-600">{plan.description}</p>
                                    )}
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Select Plan'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
