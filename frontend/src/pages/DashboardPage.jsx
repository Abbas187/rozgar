import React from 'react';
import useAuthStore from '../store/useAuthStore';
import BuyerDashboard from '../components/BuyerDashboard';
import ProviderDashboard from '../components/ProviderDashboard';

const DashboardPage = () => {
    const { user } = useAuthStore();

    if (!user) return null;

    if (user.role === 'Provider') {
        return <ProviderDashboard user={user} />;
    } else {
        return <BuyerDashboard user={user} />;
    }
};

export default DashboardPage;
