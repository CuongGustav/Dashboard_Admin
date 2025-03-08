import React, { useState, useEffect, useCallback } from 'react';


interface ServerModalUpdateServerProps {
    isOpen: boolean;
    serverId: number | null;
    onClose: () => void;
}

const ServerModalUpdateServer: React.FC<ServerModalUpdateServerProps> = ({ isOpen, serverId, onClose }) => {
    const [inforServer, setInforServer] = useState<Server | null>(null);
    const [users, setUsers] = useState<User[]>([])
    

    const getInforServer = useCallback(async () => {
        if (serverId) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/serverAdmin/Server/${serverId}`);
                const data= await response.json();
                setInforServer(data);
            } catch (error) {
                console.error('Error fetching server data:', error);
            }
        }
    }, [serverId]);

    const getAllUserByServer = useCallback(async () => {
        if(serverId) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/serverAdmin/UserByServerId/${serverId}`);
                const data= await response.json();
                console.log(data)
                setUsers(data);
            } catch (error) {
                console.error('Error fetching server data:', error);
            }
        }
    }, [serverId])

    useEffect(() => {
        if (isOpen && serverId) {
            getInforServer();
            getAllUserByServer();
        }
    }, [isOpen, serverId, getInforServer, getAllUserByServer]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex justify-center items-center h-full">
            <div className="bg-white p-6 rounded-lg w-auto md:w-[800px]">
                <h2 className={`truncate text-xl mb-4 max-w-[360px] md:max-w-auto`}>Read {inforServer?.name} Server</h2>
                {inforServer ? (
                    <form>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="serverName" className='pr-1'>Server Name:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1"
                                    type="text"
                                    value={inforServer.name}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="serverName" >CPU_Threshold:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.cpu_threshold}    
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="serverName" >RAM_Threshold:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.ram_threshold}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between'>
                                <label htmlFor="serverName" >Disk Threshold:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.disk_threshold}
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="serverName" >CPU Count Threshold:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.cpu_count_threshold}
                                    readOnly
                            />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="serverName" >RAM Count Threshold:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.ram_count_threshold}
                                    readOnly

                                />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="serverName" >Disk Count Threshold:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.disk_count_threshold}
                                    readOnly

                                />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="serverName" >Channel:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.channel}
                                    readOnly

                                />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="serverName" >Status:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.status}
                                    readOnly

                                />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="serverName" >User In Charge :</label>
                                <select
                                    id="serverName"
                                    className="border border-gray-300 rounded p-2 w-[55%] "
                                >
                                    {users?.map((user, index) => (
                                    <option key={index} value={user.username}>
                                        {user.username}
                                    </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="serverName" >Created At:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.created_at.toString()} 
                                    readOnly
                                />
                            </div>
                            <div className='flex items-center justify-between '>
                                <label htmlFor="serverName" >Update At:</label>
                                <input
                                    id="serverName"
                                    className="border border-gray-300 rounded p-1 "
                                    type="text"
                                    value={inforServer.updated_at.toString()}
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
