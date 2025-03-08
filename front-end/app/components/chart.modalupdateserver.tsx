import React from "react"

interface ModalUpdateServerProps {
    serverId: number
    showModal: boolean;
    closeModal: () => void
}

const ModalUpdateServer: React.FC<ModalUpdateServerProps> = ({serverId, showModal, closeModal}) => {
    if(!showModal){
        return null
    }
    if (serverId === null || serverId < 1) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-semibold mb-4">Update Server ID: {serverId} ?</h2>
            <div>
                <p>Thông tin hiển thị sau</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={closeModal}
              >
                Close
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-md">
               Delete Server
              </button>
            </div>
          </div>
        </div>
    );
}

export default ModalUpdateServer