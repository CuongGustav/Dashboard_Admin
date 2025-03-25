'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { fetchServerHistory, ServerHistory } from '@/app/services/chartService';
import { getServerList } from '@/app/services/serversListService';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Server {
    name: string;
}

const getChartOptions = (isSingleServer: boolean) => ({
    plugins: {
        legend: {
            display: true,
            position: 'bottom' as const,
            labels: {
                usePointStyle: true,
                pointStyle: "circle",
                font: {
                    size: isSingleServer ? 14 : 10,
                    weight: 700,
                    family: "sans-serif"
                },
                padding: isSingleServer ? 12 : 8
            }
        },
        tooltip: {
            bodyFont: {
                size: isSingleServer ? 12 : 10
            },
            titleFont: {
                size: isSingleServer ? 12 : 10
            }
        }
    },
    maintainAspectRatio: true,
    responsive: true,
    devicePixelRatio: 2
});

const PieChart = () => {
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
    const [serverData, setServerData] = useState<{ [key: string]: ServerHistory }>({});
    const [isSelectAllActive, setIsSelectAllActive] = useState(true);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const fetchVersionRef = useRef<number>(0);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const serverList = await getServerList();
                setServers(serverList);
                setSelectedServers(new Set(serverList.map(s => s.name)));
            } catch (error) {
                console.error('Error fetching server list:', error);
            }
        };
        void fetchServers();
    }, []);

    const fetchData = useCallback(async () => {
        const currentFetchVersion = fetchVersionRef.current;
        const currentSelectedServers = new Set(selectedServers);

        if (currentSelectedServers.size === 0) {
            setServerData({});
            return;
        }

        try {
            const newServerData: { [key: string]: ServerHistory } = {};
            await Promise.all(
                Array.from(currentSelectedServers).map(async (serverName) => {
                    try {
                        const data = await fetchServerHistory(serverName);
                        newServerData[serverName] = data;
                    } catch (error) {
                        console.error(`Error fetching data for ${serverName}:`, error);
                    }
                })
            );

            if (fetchVersionRef.current === currentFetchVersion) {
                setServerData(newServerData);
            }
        } catch (error) {
            console.error('Unexpected error in fetchData:', error);
        }
    }, [selectedServers]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        if (selectedServers.size > 0) {
            void fetchData();
            intervalRef.current = setInterval(() => void fetchData(), 10000);
        } else {
            setServerData({});
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchData, selectedServers]);

    const handleSelectServer = (serverName: string) => {
        fetchVersionRef.current += 1;
        setSelectedServers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serverName)) {
                newSet.delete(serverName);
            } else {
                newSet.add(serverName);
            }
            setIsSelectAllActive(newSet.size === servers.length);
            return newSet;
        });
    };

    const handleSelectAll = async () => {
        fetchVersionRef.current += 1;
        const allSet = new Set(servers.map(server => server.name));
        setSelectedServers(allSet);
        setIsSelectAllActive(true);
        await fetchData();
    };

    const handleRemoveAll = () => {
        fetchVersionRef.current += 1;
        if (intervalRef.current) clearInterval(intervalRef.current);
        setSelectedServers(new Set<string>());
        setServerData({});
        setIsSelectAllActive(false);
    };

    const moveServerUp = (index: number) => {
        if (index > 0) {
            setServers(prev => {
                const newServers = [...prev];
                [newServers[index - 1], newServers[index]] = [newServers[index], newServers[index - 1]];
                return newServers;
            });
        }
    };

    const moveServerDown = (index: number) => {
        if (index < servers.length - 1) {
            setServers(prev => {
                const newServers = [...prev];
                [newServers[index], newServers[index + 1]] = [newServers[index + 1], newServers[index]];
                return newServers;
            });
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (dragIndex === dropIndex) return;

        setServers(prev => {
            const newServers = [...prev];
            const [draggedServer] = newServers.splice(dragIndex, 1);
            newServers.splice(dropIndex, 0, draggedServer);
            return newServers;
        });
    };

    const getUsage = (history: (number | string)[] | undefined) => {
        if (!history || history.length === 0) return 0;
        const value = history[history.length - 1];
        return typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
    };

    const createChartData = (usage: number, color: string) => ({
        labels: ['Used', 'Free'],
        datasets: [{
            data: [usage, 100 - usage],
            backgroundColor: [`rgba(${color}, 0.2)`, 'rgba(207, 211, 214, 0.2)'],
            borderColor: [`rgba(${color}, 1)`, 'rgba(148, 151, 153, 0.2)'],
            borderWidth: 2
        }]
    });

    if (servers.length === 0) return <div>Loading server list...</div>;

    const isSingleServer = selectedServers.size === 1;
    const chartSize = isSingleServer ? 250 : 120;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '15px',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <div className="flex justify-start mb-4">
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <MenuButton className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 hover:bg-gray-700 hover:text-gray-100">
                            Select Server
                            <i className="fa-solid fa-caret-down ps-1"></i>
                        </MenuButton>
                    </div>
                    <MenuItems
                        className="absolute left-0 z-10 mt-1 w-[340px] origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5"
                        style={{ maxHeight: '500px', overflow: 'auto' }}
                    >
                        <div className="py-1">
                            {servers.map((server, index) => (
                                <MenuItem key={server.name}>
                                    <div
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className="block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                                        onClick={(e) => e.preventDefault()}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedServers.has(server.name)}
                                            onChange={() => handleSelectServer(server.name)}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                border: '2px solid #333',
                                                borderRadius: '4px',
                                                backgroundColor: selectedServers.has(server.name) ? '#3b82f6' : 'white'
                                            }}
                                        />
                                        <span style={{ flex: 1 }}>{server.name}</span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => moveServerUp(index)}
                                                disabled={index === 0}
                                                className="p-1 disabled:opacity-50"
                                            >
                                                <i className="fa-solid fa-arrow-up"></i>
                                            </button>
                                            <button
                                                onClick={() => moveServerDown(index)}
                                                disabled={index === servers.length - 1}
                                                className="p-1 disabled:opacity-50"
                                            >
                                                <i className="fa-solid fa-arrow-down"></i>
                                            </button>
                                        </div>
                                    </div>
                                </MenuItem>
                            ))}
                        </div>
                    </MenuItems>
                </Menu>
                <button
                    onClick={!isSelectAllActive ? handleSelectAll : undefined}
                    className={`ml-2 inline-flex justify-center items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-xs border ${
                        isSelectAllActive ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-gray-100'
                    }`}
                >
                    select all
                </button>
                <button
                    onClick={handleRemoveAll}
                    className="ml-2 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-700 hover:text-gray-100 border"
                >
                    remove all
                </button>
            </div>
            <div
                ref={chartContainerRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 15px'
                }}
            >
                <div className={isSingleServer ? "h-full flex justify-center items-center" : "grid grid-cols-1 md:grid-cols-3 gap-3"}>
                    {servers.filter(server => selectedServers.has(server.name)).map(server => {
                        const data = serverData[server.name];
                        if (!data) return null;

                        const cpuUsage = getUsage(data.cpu_history);
                        const ramUsage = getUsage(data.ram_history);
                        const diskUsage = getUsage(data.disk_history);

                        return (
                            <div
                                key={server.name}
                                className="bg-gray-50 shadow-md rounded-lg p-4 flex flex-col items-center transition-all duration-300 ease-in-out"
                                style={isSingleServer ? {
                                    width: '80%',
                                    maxWidth: '900px',
                                    height: '90%'
                                } : {}}
                            >
                                <h2 className="text-sm font-bold uppercase mb-3 text-center"
                                    style={{ fontSize: isSingleServer ? '1.25rem' : '0.875rem' }}>
                                    {server.name}
                                </h2>
                                <div
                                    className="flex flex-wrap justify-center gap-4 w-full transition-all duration-300 ease-in-out"
                                    style={isSingleServer ? {
                                        height: 'calc(100% - 40px)',
                                        alignItems: 'center',
                                        gap: '2rem'
                                    } : {}}
                                >
                                    {[
                                        { label: 'CPU Usage', usage: cpuUsage, color: "255, 99, 132", textColor: '#ff6384' },
                                        { label: 'RAM Usage', usage: ramUsage, color: "220, 163, 17", textColor: '#dca311' },
                                        { label: 'Disk Usage', usage: diskUsage, color: "153, 102, 255", textColor: '#9966ff' }
                                    ].map(({ label, usage, color, textColor }) => (
                                        <div
                                            key={label}
                                            className="relative text-center transition-all duration-300 ease-in-out"
                                            style={isSingleServer ? {
                                                width: `${chartSize}px`,
                                                height: `${chartSize + 40}px`,
                                                flex: '0 0 auto'
                                            } : {
                                                maxWidth: `${chartSize}px`,
                                                maxHeight: `${chartSize + 40}px`,
                                                flex: '1 1 auto'
                                            }}
                                        >
                                            <div style={{
                                                width: `${chartSize}px`,
                                                height: `${chartSize}px`,
                                                margin: '0 auto'
                                            }}>
                                                <Pie
                                                    data={createChartData(usage, color)}
                                                    options={getChartOptions(isSingleServer)}
                                                />
                                            </div>
                                            <div
                                                className="absolute inset-0 flex items-center justify-center font-bold transition-all duration-300 ease-in-out"
                                                style={{
                                                    color: `rgba(${color}, 1)`,
                                                    fontSize: isSingleServer ? '2rem' : '0.75rem',
                                                    top: '0',
                                                    height: `${chartSize}px`
                                                }}
                                            >
                                                {usage.toFixed(1)}%
                                            </div>
                                            <h2
                                                className="font-bold uppercase font-sans transition-all duration-300 ease-in-out"
                                                style={{
                                                    color: textColor,
                                                    fontSize: isSingleServer ? '1.25rem' : '0.75rem',
                                                    marginTop: isSingleServer ? '0.5rem' : '0.25rem'
                                                }}
                                            >
                                                {label}
                                            </h2>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default React.memo(PieChart);