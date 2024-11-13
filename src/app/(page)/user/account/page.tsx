"use client";
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { User } from "@/app/model/user.model";
import nookies from "nookies";
import Link from "next/link";
import { fetchDeleteFollow, fetchIsFollow, fetchRegisterFollow } from "@/app/service/follow/follow.service";
import { FollowModel } from "@/app/model/follow.model";

import { useRouter } from 'next/navigation';
import { fetchUserById } from "@/app/api/user/user.api";
import { checkChatRoom, insertChatRoom } from '@/app/api/chatRoom/chatRoom.api';
import Modal from '@/app/components/Modal';

interface AccountProps {
    selectUser: User;
}


export default function Account(selectUser: Partial<AccountProps>) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    const cookie = nookies.get();
    const userId = cookie.userId;
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const myInfo = await fetchUserById(userId);
                setUser(myInfo);
            } catch (error) {
                console.error("Error fetching user:", error);
            }

            if (selectUser.selectUser) {
                setSelectedUser(selectUser.selectUser);
            }

            const checkFollowStatus = async () => {
                const followingUser = selectUser?.selectUser.nickname;
                const result = await fetchIsFollow(followingUser, localStorage.getItem('nickname'));
                setIsFollowing(result);
            };

            await checkFollowStatus();
        };

        fetchData();
    }, [selectUser, userId]);

    const handleFollow = async () => {
        const followModel: FollowModel = {
            id: 0,
            follower: selectUser?.selectUser.nickname,
            following: user.nickname,
        };

        try {
            await fetchRegisterFollow(followModel);
            setIsFollowing(true);
        } catch (error) {
            console.error("Failed to follow:", error);
        }
    };

    const handleUnfollow = async () => {

        const follower = selectUser?.selectUser.nickname
        const following = user.nickname


        try {
            await fetchDeleteFollow(follower, following);
            setIsFollowing(false);
        } catch (error) {
            console.error('Failed to unfollow:', error);
        }
    };


    const handleCreateRoom = () => {
        setAlertMessage("채팅방이 생성되었습니다.");
        setAlertOpen(true);
    };
    const handleCreateChatRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        const newChatRoom: any = {
            name: "님과의 채팅방",
            participants: [user.nickname, selectedUser.nickname],
        };

        const checkResult = await checkChatRoom(newChatRoom);

        if (checkResult.status === 200 && checkResult.data) {
            const existingChatRoom = checkResult.data;
            const id = existingChatRoom.id;
            router.push(`/chatRoom/${id}`);
        } else {
            const createResult = await insertChatRoom(newChatRoom);


            if (createResult.status === 200 && createResult.data) {
                const createdChatRoom = createResult.data;
                const id = createdChatRoom.id;
                router.push(`/chatRoom/${id}`);
            } else {
                console.error("채팅방 생성 실패", createResult);
            }
        }
    };


    return (
        <div className="w-full xl:pr-[3.125rem] lg:pr-[28px] md:pr-[16px]">
            <div className="user-infor bg-surface lg:px-7 px-4 lg:py-10 py-5 md:rounded-[20px] rounded-xl">
                <div className="heading flex flex-col items-center justify-center">
                    <div className="avatar">
                        <Image
                            src={'/assets/img/profile.png'}
                            width={300}
                            height={300}
                            alt='avatar'
                            className='md:w-[140px] w-[120px] md:h-[140px] h-[120px] rounded-full'
                        />
                    </div>
                    <div className="name heading6 mt-4 text-left">{selectUser?.selectUser?.nickname}</div>
                    <div className="mail heading6 font-normal normal-case text-secondary mt-1 text-sm text-left">

                        <span className="text-border"> 냠냠온도: </span>

                        <span className="tag px-4 py-1.5 rounded-full bg-blue-100 text-blue-800">
                            {selectUser?.selectUser?.score}
                        </span>
                    </div>
                </div>
                <div className="menu-tab w-full max-w-none lg:mt-10 mt-6">
                    <div className="item flex items-center gap-3 w-full px-5 py-4 rounded-lg">
                        <h5 className="heading6"></h5>
                    </div>
                </div>
                {
                    selectUser.selectUser?.id === userId ? (
                        <Link href="/user/follow" passHref>
                            <button type="submit"
                                    className="px-4 py-2 bg-[#41B3A3] text-white rounded hover:bg-[#178E7F]">
                                팔로우
                            </button>
                        </Link>
                    ) : isFollowing ? (
                        <button
                            onClick={handleUnfollow}
                            className="px-4 py-2 bg-[#41B3A3] text-white rounded hover:bg-[#178E7F]">
                            언팔로우
                        </button>
                    ) : (
                        <button onClick={handleFollow}
                                className="px-4 py-2 bg-[#41B3A3] text-white rounded hover:bg-[#178E7F]">
                            팔로우하기
                        </button>
                    )
                }
                <button
                    className="px-4 py-2 ml-4 bg-[#3A9181] text-white rounded hover:bg-[#2C7365]"
                    onClick={handleCreateRoom} // 버튼 클릭 시 함수 실행
                >
                    채팅하기
                </button>
                <Modal isOpen={alertOpen} onClose={() => setAlertOpen(false)}>
                    <div className="p-4 text-center mt-5">
                        <h3 className="font-semibold text-lg">{alertMessage}</h3>
                        <button
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-200 mr-4" // 오른쪽에 간격 추가
                            onClick={handleCreateChatRoom}
                        >
                            확인
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

