import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';

import { getAnalytics } from '@/actions/get-analytics';
import { DataCard } from './_components/data-card';
import { Chart } from './_components/chart';

interface AnalyticsPageProps {
  searchParams: { page?: string; limit?: string };
}

const AnalyticsPage = async ({ searchParams }: AnalyticsPageProps) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }

  const { data, totalRevenue, totalSales } = await getAnalytics(userId, {
    page: searchParams.page ? Number(searchParams.page) : undefined,
    limit: searchParams.limit ? Number(searchParams.limit) : undefined,
  });

    return (
    <div className='p-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            
            <DataCard 
                label="Total Revenue"
                value={totalRevenue}
                shouldFormat
            />
            <DataCard 
                label="Total Sales"
                value={totalSales}
                shouldFormat={false}
            />
        </div>
        <Chart data={data} />
    </div>
  )
}

export default AnalyticsPage;