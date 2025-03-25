import React, { useState, useEffect, useCallback } from 'react';
import 'dayjs/locale/vi';

interface ServerModalUpdateServerProps {
    isOpen: boolean;
    serverName: string | null;
    onClose: () => void;
}

const backEndAPI = process.env.NEXT_PUBLIC_API_BASE_URL;

const ServerModalUpdateServer: React.FC<ServerModalUpdateServerProps> = ({ isOpen, serverName, onClose }) => {
    const [inforServer, setInforServer] = useState<ServerJson | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getInforServer = useCallback(async () => {
        if (serverName) {
            try {
                const response = await fetch(`${backEndAPI}/serverAdmin/GetServerByNameJSON?servername=${serverName}`);
                const data = await response.json();
                setInforServer(data);
            } catch (error) {
                console.error('Error fetching server data:', error);
            }
        }
    }, [serverName]);

    useEffect(() => {
        if (isOpen && serverName) {
            getInforServer();
        }
    }, [isOpen, serverName, getInforServer]);

    const handleInputChange = (field: string, value: string | string[]) => {
        setInforServer((prev) => {
            if (!prev) return null;
            return { ...prev, [field]: value };
        });
    };

    const handleInputChangeNumber100 = (field: string, value: string) => {
        const numericValue = Number(value);
        if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
            setError('Please enter a valid value between 0 and 100!');
            return;
        }
        setError(null);
        setInforServer((prev) => prev ? { ...prev, [field]: numericValue } : null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!inforServer) return;

        try {
            const updatedData = {
                server_name: inforServer.server_name,
                cpu_threshold: inforServer.cpu_threshold,
                ram_threshold: inforServer.ram_threshold,
                disk_threshold: inforServer.disk_threshold,
                cpu_count_threshold: inforServer.cpu_count_threshold,
                ram_count_threshold: inforServer.ram_count_threshold,
                disk_count_threshold: inforServer.disk_count_threshold,
                google_chat_webhooks: inforServer.google_chat_webhooks,
            };

            const response = await fetch(`${backEndAPI}/serverAdmin/UpdateServerByNameJSON?servername=${serverName}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            const data = await response.json();
            console.log('Server updated:', data);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Error updating server:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg w-auto md:w-[800px]">
                <h2 className={`truncate text-xl mb-4 max-w-[360px] md:max-w-auto`}>Update {inforServer?.server_name} Server</h2>
                {inforServer ? (
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="serverName">Server Name:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.server_name}
                                    onChange={(e) => handleInputChange('server_name', e.target.value)}
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="cpuThreshold">CPU Threshold:</label>
                                <input
                                    id="cpuThreshold"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.cpu_threshold}
                                    onChange={(e) => handleInputChangeNumber100('cpu_threshold', e.target.value)}
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="ramThreshold">RAM Threshold:</label>
                                <input
                                    id="ramThreshold"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.ram_threshold}
                                    onChange={(e) => handleInputChangeNumber100('ram_threshold', e.target.value)}
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="diskThreshold">Disk Threshold:</label>
                                <input
                                    id="diskThreshold"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.disk_threshold}
                                    onChange={(e) => handleInputChangeNumber100('disk_threshold', e.target.value)}
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="cpuCountThreshold">CPU Count Threshold:</label>
                                <input
                                    id="cpuCountThreshold"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.cpu_count_threshold}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="ramCountThreshold">RAM Count Threshold:</label>
                                <input
                                    id="ramCountThreshold"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.ram_count_threshold}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-start justify-between '>
                                <label htmlFor="diskCountThreshold" >Disk Count Threshold:</label>
                                <input
                                    id="diskCountThreshold"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.disk_count_threshold}
                                    readOnly

                                />
                            </div>
                            <div className='flex items-start justify-between '>
                                <label htmlFor="channel" >Channel:</label>
                                <textarea
                                    id="channel"
                                    className="border border-gray-300 rounded p-1 w-[55%] h-24 "
                                    value={inforServer.google_chat_webhooks.join(', ')}
                                    onChange={(e) => {
                                        const values = e.target.value.split(',').map((item) => item.trim());
                                        handleInputChange('google_chat_webhooks', values);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between mt-4">
                            <span className='block h-6'>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </span>
                            <div className='flex gap-2'>
                                <button type="button" onClick={() => { onClose(); setError(null); }} className="bg-gray-300 p-2 rounded">Close</button>
                                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update</button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default ServerModalUpdateServer;