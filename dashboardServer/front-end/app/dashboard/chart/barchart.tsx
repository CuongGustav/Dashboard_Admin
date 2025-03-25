'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { fetchServerHistory, ServerHistory } from '@/app/services/chartService';
import { getServerList } from '@/app/services/serversListService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const emptyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { beginAtZero: true },
    },
    plugins: {
        tooltip: {
            callbacks: {
                title: () => '', // Ẩn tiêu đề "RAM Usage"
                label: (context: TooltipItem<'bar'>) => {
                    const datasetLabel = context.dataset.label || '';
                    const value = context.raw;
                    return `${datasetLabel}: ${value}`;
                }
            }
        }
    }
};


interface Server {
    name: string;
}

const BarChart = () => {
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServers, setSelectedServers] = useState<Set<string>>(new Set());
    const [chartData, setChartData] = useState<ChartData<'bar'>>(emptyChartData);
    const [isSelectAllActive, setIsSelectAllActive] = useState(false); // Thêm state mới

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const colorMapRef = useRef<{ [key: string]: string }>({});
    const fetchVersionRef = useRef<number>(0);

    const getColorForServer = (serverName: string) => {
        if (!colorMapRef.current[serverName]) {
            colorMapRef.current[serverName] = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
        }
        return colorMapRef.current[serverName];
    };

    // useEffect(() => {
    //     const fetchServers = async () => {
    //         try {
    //             const serverList = await getServerList();
    //             setServers(serverList);
    //         } catch (error) {
    //             console.error('Error fetching server list:', error);
    //         }
    //     };
    //     void fetchServers();
    // }, []);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const serverList = await getServerList();
                setServers(serverList);
    
                setSelectedServers(new Set(serverList.map(server => server.name)));
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
            setChartData(emptyChartData);
            return;
        }

        try {
            const datasets = await Promise.all(
                Array.from(currentSelectedServers).map(async (serverName) => {
                    try {
                        const data: ServerHistory = await fetchServerHistory(serverName);
                        const server = servers.find(server => server.name === serverName);
                        return {
                            label: server ? server.name : `Server ${serverName}`,
                            data: [
                                data.cpu_history.at(-1) || 0,
                                data.ram_history.at(-1) || 0,
                                data.disk_history.at(-1) || 0,
                            ],
                            backgroundColor: getColorForServer(serverName),
                            borderColor: 'rgba(0, 0, 0, 0.8)',
                            borderWidth: 1,
                        };
                    } catch (error) {
                        console.error(`Error fetching data for ${serverName}:`, error);
                        return null;
                    }
                })
            );

            if (fetchVersionRef.current === currentFetchVersion) {
                const validDatasets = datasets.filter(dataset => dataset !== null);
                const newChartData = {
                    labels: ['CPU Usage', 'RAM Usage', 'Disk Usage'],
                    datasets: validDatasets,
                };
                setChartData(newChartData);
            }
        } catch (error) {
            console.error('Unexpected error in fetchData:', error);
        }
    }, [selectedServers, servers]);

    const handleSelectServer = (serverName: string) => {
        fetchVersionRef.current += 1;
        setSelectedServers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serverName)) {
                newSet.delete(serverName);
            } else {
                newSet.add(serverName);
            }
            // Cập nhật trạng thái active của Select all
            setIsSelectAllActive(newSet.size === servers.length);
            return newSet;
        });
    };

    const handleSelectAll = async () => {
        fetchVersionRef.current += 1;
        const allSet = new Set(servers.map(server => server.name));
        setSelectedServers(allSet);
        setIsSelectAllActive(true); // Active khi chọn tất cả
        await fetchData();
    };

    const handleRemoveAll = () => {
        fetchVersionRef.current += 1;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setSelectedServers(new Set<string>());
        setChartData(emptyChartData);
        setIsSelectAllActive(false); // Không active khi xóa tất cả
    };

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (selectedServers.size > 0) {
            void fetchData();
            intervalRef.current = setInterval(() => {
                void fetchData();
            }, 10000);
        } else {
            setChartData(emptyChartData);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [fetchData, selectedServers]);

    if (servers.length === 0) {
        return <div>Loading servers...</div>;
    }

    return (
        <div
            style={{
                width: '100%',
                height: '600px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '15px',
            }}
            className="d-flex align-items-center"
        >
            <div className="justify-start">
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <MenuButton className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-700 hover:text-gray-100">
                            Select Servers
                            <i className="fa-solid fa-caret-down ps-1"></i>
                        </MenuButton>
                    </div>
                    <MenuItems
                        transition
                        className="absolute left-0 z-10 mt-1 w-[340px] origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                        style={{ boxShadow: '0 0 10px rgba(78, 0, 52, 0.1)', maxHeight: '500px', overflow: 'auto' }}
                    >
                        <div className="py-1">
                            {servers.map((server) => (
                                <MenuItem key={server.name}>
                                    <label
                                        className="block px-4 py-2 text-sm text-gray-700 cursor-pointer"
                                        onClick={(e) => e.preventDefault()}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            checked={selectedServers.has(server.name)}
                                            onChange={() => handleSelectServer(server.name)}
                                            style={{
                                                alignItems: 'center',
                                                appearance: 'none',
                                                width: '20px',
                                                height: '20px',
                                                border: '2px solid #333',
                                                borderRadius: '4px',
                                                backgroundColor: selectedServers.has(server.name) ? '#3b82f6' : 'white',
                                                cursor: 'pointer',
                                            }}
                                        />
                                        {server.name}
                                    </label>
                                </MenuItem>
                            ))}
                        </div>
                    </MenuItems>
                </Menu>
                <button
                    onClick={!isSelectAllActive ? handleSelectAll : undefined}
                    className={`ml-2 inline-flex justify-center items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-xs border ${
                        isSelectAllActive
                            ? 'bg-gray-700 text-gray-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-700 hover:text-gray-100'
                    }`}
                    style={{ boxShadow: '0 0 10px rgba(78, 0, 52, 0.1)' }}
                >
                    Select all
                </button>
                <button
                    onClick={handleRemoveAll}
                    className="ml-2 inline-flex justify-center items-center gap-x-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-700 hover:text-gray-100 border"
                    style={{ boxShadow: '0 0 10px rgba(78, 0, 52, 0.1)' }}
                >
                    Remove all
                </button>
            </div>
            <div className="flex-grow-1" style={{ height: '520px' }}>
                <Bar data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default BarChart;