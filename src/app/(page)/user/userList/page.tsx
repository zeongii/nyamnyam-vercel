"use client";
import React, { useEffect, useState } from "react";
import { fetchAllUsers, fetchUserById, toggleEnable } from "@/app/api/user/user.api";
import { User } from "@/app/model/user.model";
import Modal from "@/app/components/Modal";
import Account from "@/app/(page)/user/account/page";
import nookies from "nookies";

const UserTable = ({ users = [], onUpdateUsers }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [sortColumn, setSortColumn] = useState("username");
    const [sortDirection, setSortDirection] = useState("asc");
    const itemsPerPage = 10;

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;

    const sortedUsers = [...users].sort((a, b) => {
        const isAsc = sortDirection === "asc";
        if (a[sortColumn] < b[sortColumn]) {
            return isAsc ? -1 : 1;
        }
        if (a[sortColumn] > b[sortColumn]) {
            return isAsc ? 1 : -1;
        }
        return 0;
    });

    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleToggleEnable = async (userId: string, currentStatus: boolean) => {
        try {
            await toggleEnable(userId, !currentStatus);
            const updatedUsers = users.map((user) =>
                user.id === userId ? { ...user, enabled: !currentStatus } : user
            );
            onUpdateUsers(updatedUsers); // 부모 컴포넌트의 상태를 업데이트
        } catch (error) {
            console.error("Failed to toggle enable status");
        }
    };

    const openModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleSort = (column) => {
        setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
        setSortColumn(column);
    };

    return (
        <div className="list overflow-x-auto w-full mt-5">
            <table className="w-full max-[1400px]:w-[700px] max-md:w-[700px]">
                <thead className="border-b border-line">
                <tr>
                    <th className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                        Enable
                    </th>
                    <th scope="col"
                        className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                        username
                    </th>
                    <th scope="col"
                        className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap">
                        nickname
                    </th>
                    <th scope="col"
                        className="pb-3 text-left text-sm font-bold uppercase text-secondary whitespace-nowrap"
                        onClick={() => handleSort('role')}>
                        role
                    </th>
                    <th scope="col"
                        className="pb-3 text-right text-sm font-bold uppercase text-secondary whitespace-nowrap"
                        onClick={() => handleSort('score')}>
                        score
                    </th>
                </tr>
                </thead>
                <tbody>
                {currentUsers.map((u) => (
                    <tr className="item duration-300 border-b border-line" key={u.username}>
                        <td className="py-3 text-left">
                            <input
                                type="checkbox"
                                checked={u.enabled}
                                onChange={() => handleToggleEnable(u.id, u.enabled)}
                            />
                        </td>
                        <th scope="row" className="py-3 text-left" onClick={() => openModal(u)}>
                            <strong className="text-title cursor-pointer">{u.username}</strong>
                        </th>
                        <td className="py-3 cursor-pointer">
                            <div className="info flex flex-col">
                                <strong className="product_name text-button">{u.nickname}</strong>
                            </div>
                        </td>
                        <td className="py-3 price">{u.role}</td>
                        <td className="py-3 text-right">
                                <span
                                    className={`tag px-4 py-1.5 rounded-full bg-opacity-10 ${u.score < 40 ? 'bg-sky-500 text-sky-500' :
                                        u.score < 50 ? 'bg-green-400 text-green-400' :
                                            u.score < 60 ? 'bg-yellow-500 text-yellow-500' :
                                                u.score < 80 ? 'bg-orange-400 text-orange-400' :
                                                    u.score < 100 ? 'bg-red-500 text-red-500' :
                                                        'bg-gray text-gray'} caption1 font-semibold`}>
                                    {u.score}
                                </span>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="pagination mt-4 flex justify-between">
                <button onClick={handlePrevious} disabled={currentPage === 1}
                        className="bg-[#4fc8cc] text-white py-1 px-3 rounded">
                    이전
                </button>
                <span>페이지 {currentPage} / {totalPages}</span>
                <button onClick={handleNext} disabled={currentPage === totalPages}
                        className="bg-[#4fc8cc] text-white py-1 px-3 rounded">
                    다음
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {selectedUser && <Account selectUser={selectedUser}/>}
            </Modal>
        </div>
    );
};

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const userList = async () => {
            const data = await fetchAllUsers();
            setUsers(data);
        };
        userList();
    }, []);

    return (
        <div>
            <UserTable users={users} onUpdateUsers={setUsers}/>
        </div>
    );
}
