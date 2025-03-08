'use client'
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
    serverId: number | null;
}

const PieChart = ({ serverId }: PieChartProps) => {
    interface ServerData {
        cpu_history: string[];
        ram_history: string[];
        disk_history: string[];
    }

    const [serverData, setServerData] = useState<ServerData | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        // Add responsive check
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };
        
        handleResize(); // Check initial size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!serverId) return;  // Nếu chưa chọn server, không fetch

        const fetchData = async () => {
            try {
                const response = await fetch(`/data/dataserver${serverId}.json`); 
                const data = await response.json();
                setServerData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [serverId]);

    if (!serverData) return <p className="text-center mt-3">Loading data...</p>;

    // Lấy giá trị CPU, RAM, Disk
    const cpuUsage = parseFloat(serverData.cpu_history.at(-1) ?? '0') || 0;
    const ramUsage = parseFloat(serverData.ram_history.at(-1) ?? '0') || 0;
    const diskUsage = parseFloat(serverData.disk_history.at(-1)?.split(' ')[0] ?? '0') || 0;


    const chartOptions = {
        plugins: {
            legend: {
                display: !isMobileView, 
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,  
                    pointStyle: "circle",
                    font: { 
                        size: isMobileView ? 10 : 12, 
                        weight: 700, 
                        family: "sans-serif" 
                    },
                    padding: isMobileView ? 8 : 12
                }
            },
            tooltip: {
                bodyFont: {
                    size: isMobileView ? 10 : 12
                },
                titleFont: {
                    size: isMobileView ? 10 : 12
                }
            }
        },
        maintainAspectRatio: true,
        responsive: true
    };

    const createChartData = (label: string, usage: number, color: string) => ({
        labels: ['Used', 'Free'],
        datasets: [
            {
                label: label,
                data: [usage, 100 - usage],
                backgroundColor: [`rgba(${color}, 0.2)`, 'rgba(207, 211, 214, 0.2)'],
                borderColor: [`rgba(${color}, 1)`, 'rgba(148, 151, 153, 0.2)'],
                borderWidth: isMobileView ? 1 : 2
            }
        ]
    });

    const UsageDisplay = ({ usage, color }: { usage: number, color: string }) => (
        <div className="usage-display absolute inset-0 flex items-center justify-center">
            <span style={{ 
                color: `rgba(${color}, 1)`, 
                fontSize: isMobileView ? '14px' : '18px',
                fontWeight: 'bold' 
            }}>
                {usage.toFixed(1)}%
            </span>
        </div>
    );

    return (
        <div className={`flex ${isMobileView ? 'flex-col' : 'flex-row'} justify-around items-center w-full gap-4 py-4`}>
            <div className={`text-center ${isMobileView ? 'w-95%' : 'w-1/4'} bg-gray-50 shadow-md rounded-lg p-3 md:p-4 relative`}>
                <h2 className="text-xs md:text-sm font-bold uppercase mb-2 md:mb-3 font-sans text-[#ff6384]">
                    CPU Usage
                </h2>
                <div className="relative flex justify-center items-center">
                    <Pie 
                        data={createChartData('CPU Usage', cpuUsage, "255, 99, 132")} 
                        options={chartOptions} 
                    />
                    {isMobileView && <UsageDisplay usage={cpuUsage} color="255, 99, 132" />}
                </div>
            </div>
            <div className={`text-center ${isMobileView ? 'w-full' : 'w-1/4'} bg-gray-50 shadow-md rounded-lg p-3 md:p-4 relative`}>
                <h2 className="text-xs md:text-sm font-bold uppercase mb-2 md:mb-3 font-sans text-[#dca311]">
                    RAM Usage
                </h2>
                <div className="relative flex justify-center items-center">
                    <Pie 
                        data={createChartData('RAM Usage', ramUsage, "220, 163, 17")} 
                        options={chartOptions} 
                    />
                    {isMobileView && <UsageDisplay usage={ramUsage} color="220, 163, 17" />}
                </div>
            </div>
            <div className={`text-center ${isMobileView ? 'w-full' : 'w-1/4'} bg-gray-50 shadow-md rounded-lg p-3 md:p-4 relative`}>
                <h2 className="text-xs md:text-sm font-bold uppercase mb-2 md:mb-3 font-sans text-[#9966ff]">
                    Disk Usage
                </h2>
                <div className="relative flex justify-center items-center">
                    <Pie 
                        data={createChartData('Disk Usage', diskUsage, "153, 102, 255")} 
                        options={chartOptions} 
                    />
                    {isMobileView && <UsageDisplay usage={diskUsage} color="153, 102, 255" />}
                </div>
            </div>
        </div>
    );
};

export default PieChart;
