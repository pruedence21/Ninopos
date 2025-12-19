import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTenantFromHeaders } from '@/lib/tenant/server';
import { getActiveSubscription } from '@/lib/billing/subscription';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect('/login');
    }

    const tenant = await getTenantFromHeaders();

    if (!tenant) {
        redirect('/register/tenant');
    }

    const subscription = await getActiveSubscription(tenant.tenantId);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {tenant.tenantName}
                            </h1>
                            <p className="text-sm text-gray-500">{tenant.subdomain}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {session.user?.name}
                            </span>
                            <form action="/api/auth/signout" method="POST">
                                <Button type="submit" variant="outline" size="sm">
                                    Sign Out
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Welcome to your petshop management system
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-gray-500">Subscription Status</h3>
                        <div className="mt-2">
                            {subscription ? (
                                <>
                                    <p className="text-2xl font-bold text-green-600">Active</p>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {subscription.plan.name} - {subscription.plan.interval}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Renews on{' '}
                                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-red-600">Inactive</p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => (window.location.href = '/settings/billing')}
                                    >
                                        Subscribe Now
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-gray-500">Quick Actions</h3>
                        <div className="mt-4 space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                Manage Products
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                View Customers
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                Transactions
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-gray-500">Settings</h3>
                        <div className="mt-4 space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => (window.location.href = '/settings/billing')}
                            >
                                Billing & Subscription
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                Team Members
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                Business Settings
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
