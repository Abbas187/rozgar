import React from 'react';
import useAuthStore from '../store/useAuthStore';
import BuyerDashboard from '../components/BuyerDashboard';
import ProviderDashboard from '../components/ProviderDashboard';

const DashboardPage = () => {
    const { user } = useAuthStore();

    if (!user) return null;

    if (user.role === 'Buyer') {
        return <BuyerDashboard user={user} />;
    } else {
        return <ProviderDashboard user={user} />;
    }
};

export default DashboardPage;
