import React, { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

interface ServerModalUpdateServerProps {
    isOpen: boolean;
    serverId: number | null;
    onClose: () => void;
}

const ServerModalUpdateServer: React.FC<ServerModalUpdateServerProps> = ({ isOpen, serverId, onClose }) => {
    const [inforServer, setInforServer] = useState<Server | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getInforServer = useCallback(async () => {
        if (serverId) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/serverAdmin/Server/${serverId}`);
                const data = await response.json();
                setInforServer(data);
            } catch (error) {
                console.error('Error fetching server data:', error);
            }
        }
    }, [serverId]);

    useEffect(() => {
        if (isOpen && serverId) {
            getInforServer();
        }
    }, [isOpen, serverId, getInforServer]);

    const handleInputChange = (field: string, value: string) => {
        setInforServer((prev) => prev ? { ...prev, [field]: value } : null);
    };

    const handleInputChangeNumber = (field: string, value: string) => {
        if (isNaN(Number(value))) {
            setError('Please enter a valid value!');
            return;
        }
        setError(null);
        setInforServer((prev) => prev ? { ...prev, [field]: value } : null);
    };
    const handleInputChangeNumber100 = (field: string, value: string) => {
        const numetric = Number(value);
        if (isNaN(numetric) || numetric < 0 || numetric > 100) {
            setError('Please enter a valid value between 0 and 100!');
            return;
        }
        setError(null);
        setInforServer((prev) => prev ? { ...prev, [field]: value } : null);
    };
    

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        const updatedTime = dayjs().locale('vi').format('YYYY-MM-DD HH:mm:ss');
    
        setInforServer((prev) => {
            if (!prev) return null;
            return { ...prev, updated_at: updatedTime };
        });
    
        console.log("Updated At:", updatedTime);
    
        setTimeout(async () => {
            if (inforServer) {
                try {
                    const updatedData = { ...inforServer, updated_at: updatedTime };
    
                    const response = await fetch(`http://127.0.0.1:5000/serverAdmin/Server/${serverId}`, {
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
            }
        }, 100);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg w-auto md:w-[800px]">
            <h2 className={`truncate text-xl mb-4 max-w-[360px] md:max-w-auto`}>Read {inforServer?.name} Server</h2>
                {inforServer ? (
                    <form onSubmit={handleSubmit}>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="serverName">Server Name:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
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
                                <label htmlFor="ramThreshold">Ram Threshold:</label>
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
                                    onChange={(e) => handleInputChangeNumber('cpu_count_threshold', e.target.value)}
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="ramCountThreshold">RAM Count Threshold:</label>
                                <input
                                    id="ramCountThreshold"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.ram_count_threshold}
                                    onChange={(e) => handleInputChangeNumber('ram_count_threshold', e.target.value)}
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="diskCountThreshold">Disk Count Threshold:</label>
                                <div className='flex flex-col'>
                                    <input
                                        id="diskCountThreshold"
                                        className="border border-gray-300 rounded p-1"
                                        type="text"
                                        value={inforServer.disk_count_threshold}
                                        onChange={(e) => handleInputChangeNumber('disk_count_threshold', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="channel">Channel:</label>
                                <input
                                    id="channel"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.channel}
                                    onChange={(e) => handleInputChange('channel', e.target.value)}
                                />
                            </div>
                            {/* <div className='flex items-center justify-between'>
                                <label htmlFor="status">Status:</label>
                                <input
                                    id="status"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.status}
                                    readonly
                                />
                            </div> */}

                            <div className='flex items-center justify-between'>
                                <label htmlFor="status">Status:</label>
                                <select
                                    id="status"
                                    className="border border-gray-300 rounded p-2 w-[63%] md:w-[55.5%]"
                                    value={inforServer.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Fail">Fail</option>
                                </select>
                            </div>

                            <div className='flex items-center justify-between'>
                                <label htmlFor="createdAt">Created At:</label>
                                <input
                                    id="createdAt"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.created_at.toString()}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="updatedAt">Updated At:</label>
                                <input
                                    id="updatedAt"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.updated_at.toString()}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="flex justify-between mt-4">
                            <span className='block h-6'>
                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </span>
                            <div className='flex gap-2'>
                                <button type="button" onClick={() => {onClose(); setError(null);}} className="bg-gray-300 p-2 rounded">Close</button>
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
