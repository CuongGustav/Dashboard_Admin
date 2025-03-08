import React from "react";

interface ModalCreateServerProps {
  showModal: boolean;
  closeModal: () => void;
}

const ModalCreateServer: React.FC<ModalCreateServerProps> = ({ showModal, closeModal }) => {
  if (!showModal) return null; 

  return (
    <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-1/3">
        <h2 className="text-2xl font-semibold mb-4">Create New Server</h2>
        <div>
          <input
            type="text"
            className="border border-gray-300 rounded-md p-2 w-full mb-3"
            placeholder="Enter server name"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
            onClick={closeModal}
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Save Server
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCreateServer;
