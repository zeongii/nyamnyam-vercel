"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import Link from "next/link";
import Star from "../../star/page";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { getLikeCount, hasLikedPost, likePost, unLikePost } from "../../upvote/page";

const reportReasons = [
    "광고글이에요",
    "해당 식당에서 찍은 사진이 아니에요",
    "별점과 후기 내용이 일치하지 않아요",
    "비속어가 포함되어 있어요",
    "다른 사용자에게 불쾌감을 주는 포스트예요",
    "공개하면 안되는 개인정보가 포함되어 있어요",
    "악의적인 포스트를 지속적으로 작성하는 사용자예요",
    "기타 사유"
];

export default function Home() {
    const [posts, setPosts] = useState<PostModel[]>([]);
    const [likedPost, setLikedPosts] = useState<number[]>([]);
    const [likeCount, setLikeCounts] = useState<{ [key: number]: number }>({});
    const currentUserId = 1; // giveId : 테스트로 1값 설정
    const router = useRouter();
    const { restaurantId } = useParams();
    const [selectedReasons, setSelectedReasons] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        if (restaurantId) {
            fetchPosts();
        }
    }, [restaurantId]);

    const fetchPosts = () => {
        fetch(`http://localhost:8080/api/posts/${restaurantId}/group`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(async (data) => {
                setPosts(data);

                const likeStatus = data.map(async (post: PostModel) => {
                    const liked = await checkLikedStatus(post.id);
                    const count = await getLikeCount(post.id);
                    return { postId: post.id, liked, count };
                });

                const result = await Promise.all(likeStatus);

                const likedPostId = result
                    .filter(result => result.liked)
                    .map(result => result.postId);

                const likeCountMap = result.reduce((acc, result) => {
                    acc[result.postId] = result.count;
                    return acc;
                }, {} as { [key: number]: number });

                setLikedPosts(likedPostId);
                setLikeCounts(likeCountMap);
            })
            .catch((error) => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    };

    const handleDetails = (id: number) => {
        router.push(`/post/${restaurantId}/details/${id}`);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { year: '2-digit', month: '2-digit', day: '2-digit' };
        const formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(date);

        const [year, month, day] = formattedDate.split('.').map(part => part.trim());
        return `${year}년 ${month}월 ${day}일`;
    };

    const checkLikedStatus = async (postId: number) => {
        const upvote: UpvoteModel = {
            id: 0,
            giveId: currentUserId,
            haveId: 0,
            postId: postId
        };
        return await hasLikedPost(upvote) ? postId : null;
    };

    const handleLike = async (postId: number) => {
        const upvote: UpvoteModel = {
            id: 0,
            giveId: currentUserId,
            haveId: 0,
            postId: postId
        };

        if (likedPost.includes(postId)) {
            setLikedPosts(prevLikedPosts => prevLikedPosts.filter(id => id !== postId));
            setLikeCounts(prevCounts => ({
                ...prevCounts,
                [postId]: Math.max((prevCounts[postId] || 0) - 1, 0)
            }));

            const success = await unLikePost(upvote);
            if (!success) {
                setLikedPosts(prevLikedPosts => [...prevLikedPosts, postId]);
                setLikeCounts(prevCounts => ({
                    ...prevCounts,
                    [postId]: (prevCounts[postId] || 0) + 1
                }));
            }
        } else {
            setLikedPosts(prevLikedPosts => [...prevLikedPosts, postId]);
            setLikeCounts(prevCounts => ({
                ...prevCounts,
                [postId]: (prevCounts[postId] || 0) + 1
            }));

            const success = await likePost(upvote);
            if (!success) {
                setLikedPosts(prevLikedPosts => prevLikedPosts.filter(id => id !== postId));
                setLikeCounts(prevCounts => ({
                    ...prevCounts,
                    [postId]: Math.max((prevCounts[postId] || 0) - 1, 0)
                }));
            }
        }
    };

    const postReport = async (postId: number) => {
        const selectedReason = selectedReasons[postId];

        if (!selectedReason) {
            alert("신고 사유를 선택해주세요.");
            return;
        }

        const reportModel = {
            userId: currentUserId,
            postId: postId,
            reason: selectedReason
        };

        try {
            const response = await fetch('http://localhost:8080/api/report/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportModel),
            });

            if (!response.ok) {
                throw new Error('신고 실패');
            }

            const result = await response.json();
            if (result) {
                alert('신고가 성공적으로 제출되었습니다.');
            } else {
                alert('신고 제출에 실패하였습니다.');
            }
        } catch (error) {
            console.error('신고 중 오류 발생:', error);
            alert('신고 중 오류가 발생했습니다.');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center p-6 bg-gray-100">
            <div className="w-full flex justify-end mb-4">
                <button
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mr-2"
                    onClick={() => router.push(`/post/register/${restaurantId}`)}>
                    등록하기
                </button>
                <button
                    className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mr-2"
                    onClick={() => router.push(`/restaurant/${restaurantId}`)}>
                    뒤로가기
                </button>
            </div>
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
                <div className="flex flex-col space-y-4">
                    {posts.map((p) => (
                        <div key={p.id}
                             className="flex flex-col md:flex-row border border-indigo-600 rounded-lg p-4 shadow-lg bg-white">
                            <div className="md:w-full">
                                <div onClick={(e) => {
                                    e.stopPropagation();
                                    handleDetails(p.id ?? 0);
                                }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h2 className="text-xl font-semibold mb-2">닉네임: {p.nickname}</h2>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // 클릭 이벤트 전파 방지
                                                handleLike(p.id);
                                            }}
                                            className="flex items-center text-black rounded-lg py-2 px-4"
                                        >
                                            <FontAwesomeIcon
                                                icon={likeCount[p.id] > 0 ? solidHeart : regularHeart}
                                                style={{ color: likeCount[p.id] > 0 ? 'pink' : 'gray' }}
                                            />
                                            <span className="ml-2">{likeCount[p.id] || 0}</span>
                                        </button>
                                    </div>
                                    <div className="inline-flex space-x-2 mb-2">
                                        <Star w="w-4" h="h-4" readonly={true} rate={p.averageRating} />
                                        <h1>{p.averageRating.toFixed(1)} / 5</h1>
                                    </div>
                                    <div className="mb-2">
                                        <p className="text-gray-700">{p.content}</p>
                                    </div>
                                    <div className="flex flex-col space-y-2 mb-2">
                                        <div className="inline-flex space-x-2">
                                            <p>맛: </p>
                                            <Star w="w-4" h="h-4" readonly={true} rate={p.taste} />
                                        </div>
                                        <div className="inline-flex space-x-2">
                                            <p>청결: </p>
                                            <Star w="w-4" h="h-4" readonly={true} rate={p.clean} />
                                        </div>
                                        <div className="inline-flex space-x-2">
                                            <p>서비스: </p>
                                            <Star w="w-4" h="h-4" readonly={true} rate={p.service} />
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <p>태그: {p.tags && p.tags.length > 0 ? p.tags.join(", ") : "태그 없음"}</p>
                                    </div>
                                    <div className="mb-2">
                                        <p>작성일: {formatDate(p.entryDate)}</p>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <select
                                        className="border rounded p-2"
                                        value={selectedReasons[p.id] || ""}
                                        onChange={(e) => {
                                            e.stopPropagation(); // 클릭 이벤트 전파 방지
                                            setSelectedReasons(prev => ({
                                                ...prev,
                                                [p.id]: e.target.value
                                            }));
                                        }}
                                    >
                                        <option value="">신고 사유 선택</option>
                                        {reportReasons.map((reason, index) => (
                                            <option key={index} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            postReport(p.id);
                                        }}
                                    >
                                        신고하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
