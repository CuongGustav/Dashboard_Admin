'use client'

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'   

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const emptyChartData = {
    labels: [],
    datasets: [
        {
            label: 'No Data',
            data: [],
            backgroundColor: 'rgba(0, 0, 0, 0.1)', 
            borderColor: 'rgba(0, 0, 0, 0.1)', 
            borderWidth: 1,
        },
    ],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
            beginAtZero: true,
        },
    },
};

const BarChart = () => {
    interface Server {
        id: string | number;
        name: string;
    }

    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServers, setSelectedServers] = useState<(string | number)[]>([]);
    
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await fetch('/data/listserver.json');
                const data = await response.json();
                setServers(data);
            } catch (error) {
                console.error('Error fetching server list:', error);
            }
        };
        
        fetchServers();
    }, []);

    const handleSelectServer = (serverId: string | number) => {
        setSelectedServers(prev => 
            prev.includes(serverId) 
                ? prev.filter(id => id !== serverId) 
                : [...prev, serverId]
        );
    };

    const fetchServerData = async (serverId: string | number) => {
        try {
            const response = await fetch(`/data/dataserver${serverId}.json`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching data for server ${serverId}:`, error);
            return null;
        }
    };
 
    
    const [chartData, setChartData] = useState<ChartData<'bar'> | null>(null);

    useEffect(() => {
        if (selectedServers.length === 0) {
            setChartData(null);
            return;
        }

        const fetchData = async () => {
            const datasets = await Promise.all(
                selectedServers.map(async (serverId) => {
                    const data = await fetchServerData(serverId);
                    if (!data) return null;
                    return {
                        label: `Server ${serverId}`,
                        data: [
                            parseFloat(data.cpu_history.at(-1) || '0'),
                            parseFloat(data.ram_history.at(-1) || '0'),
                            parseFloat(data.disk_history.at(-1)?.split(' ')[0] || '0')
                        ],
                        backgroundColor: `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.5)`,
                        borderColor: 'rgba(0, 0, 0, 0.8)',
                        borderWidth: 1
                    };
                })
            );
            setChartData({
                labels: ['CPU Usage', 'RAM Usage', 'Disk Usage'],
                datasets: datasets.filter(ds => ds !== null)
            });
        };

        fetchData();
    }, [selectedServers]);

    return (
        <div 
            style={{
            
                width: '95%',
                height: '600px',
                backgroundColor: '#f8f9fa',
                boxShadow: '0 0 10px rgba(78, 0, 52, 0.1)',
                borderRadius: '8px',
                padding: '15px'
            }}
            className="container mt-3 d-flex align-items-centre"
        >
            <div className="justify-start">
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <MenuButton className="inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
                            Select Servers
                            <i className="fa-solid fa-caret-down ps-1"></i>
                        </MenuButton>
                    </div>
                    <MenuItems
                        transition
                        className="absolute left-0 z-10 mt-1 w-[200px] origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                    >
                        <div className="py-1">
                            {servers.map((server) => (
                                <MenuItem key={server.id}>
                                    <label className="block px-4 py-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-check-input me-2"
                                            checked={selectedServers.includes(server.id)}
                                            onChange={(e) => {
                                                e.preventDefault();
                                                handleSelectServer(server.id);
                                            }}
                                        />
                                        {server.name}
                                    </label>
                                </MenuItem>
                            ))}
                        </div>
                    </MenuItems>
                </Menu>
            </div>
            <div className="flex-grow-1" style={{height: '540px'}} >
                {chartData ? <Bar data={chartData} options={chartOptions}/> : <Bar data={emptyChartData} options={chartOptions}/>}
            </div>
        </div>
    );
};


export default BarChart;
