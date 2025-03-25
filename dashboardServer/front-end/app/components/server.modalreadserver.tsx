import React, { useState, useEffect, useCallback } from 'react';


interface ServerModalUpdateServerProps {
    isOpen: boolean;
    // serverName: number | null;
    serverName: string |null;
    onClose: () => void;
}

const backEndAPI = process.env.NEXT_PUBLIC_API_BASE_URL;

const ServerModalUpdateServer: React.FC<ServerModalUpdateServerProps> = ({ isOpen, serverName, onClose }) => {
    const [inforServer, setInforServer] = useState<ServerJson | null>(null);
    

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg w-auto md:w-[800px]">
                <h2 className={`truncate text-xl mb-4 max-w-[360px] md:max-w-auto`}>Read {inforServer?.server_name} Server</h2>
                {inforServer ? (
                    <form>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="serverName" className='pr-1'>Server Name:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.server_name}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="cpuThreshold" >CPU_Threshold:</label>
                                <input
                                    id="cpuThreshold"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.cpu_threshold}    
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="ramThreshold" >RAM_Threshold:</label>
                                <input
                                    id="ramThreshold"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.ram_threshold}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="diskThreshold" >Disk Threshold:</label>
                                <input
                                    id="diskThreshold"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.disk_threshold}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="cpuCountThreshold" >CPU Count Threshold:</label>
                                <input
                                    id="cpuCountThreshold"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.cpu_count_threshold}
                                    readOnly
                            />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="ramCountThreshold" >RAM Count Threshold:</label>
                                <input
                                    id="ramCountThreshold"
                                    className="border border-gray-300 rounded p-1 "
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
                                    value={inforServer.google_chat_webhooks}
                                    readOnly

                                />
                            </div>
                        </div>
                        
                        
                        <div className="flex gap-2 justify-end mt-4">
                            <button type="button" onClick={onClose} className="bg-gray-300 p-2 rounded">Đóng</button>
                        </div>
                    </form>
                ) : (
                    <p>Đang tải thông tin server...</p>
                )}
            </div>
        </div>
    );
};

export default ServerModalUpdateServer;
