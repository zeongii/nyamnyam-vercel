'use client'

import React, { FormEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Rate from 'src/app/components/Rate'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css/bundle';
import * as Icon from "@phosphor-icons/react/dist/ssr";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { useParams, useRouter } from 'next/navigation'
import { ReplyModel } from 'src/app/model/reply.model'
import { PostModel } from 'src/app/model/post.model'
import { deletePostService, fetchPostService } from 'src/app/service/post/post.service'
import { getImageService } from 'src/app/service/image/image.service'
import { fetchRestaurantService } from 'src/app/service/restaurant/restaurant.service'
import { checkLikedService, toggleLikeService } from 'src/app/service/upvote/upvote.service'
import { deleteReplyService, editSaveReplyService, submitReplyService, toggleReplyService } from 'src/app/service/reply/reply.service'
import Star from 'src/app/components/Star'


const Default = () => {
    const [posts, setPosts] = useState<PostModel[]>([]);
    const [restaurant, setRestaurant] = useState<RestaurantModel | null>(null);
    const [images, setImages] = useState<{ [key: number]: string[] }>({});
    const [likedPost, setLikedPosts] = useState<number[]>([]);
    const [likeCount, setLikeCounts] = useState<{ [key: number]: number }>({});
    const [replyToggles, setReplyToggles] = useState<{ [key: number]: boolean }>({});
    const [replies, setReplies] = useState<{ [key: number]: ReplyModel[] }>({});
    const [replyInput, setReplyInput] = useState<{ [key: number]: string }>({});
    const [editReply, setEditReply] = useState<{ [key: number]: boolean }>({});
    const [editInput, setEditInput] = useState<{ [key: number]: string }>({});
    const currentUserId = 1; // 확인용
    const router = useRouter();
    const { restaurantId } = useParams();
    const [selectedReasons, setSelectedReasons] = useState<{ [key: number]: string }>({});

    // 스타일
    const labelStyle = "text-sm font-medium mb-0 mr-1 leading-none align-middle";
    const starContainerStyle = "flex items-center";

    useEffect(() => {
        if (restaurantId) {
            fetchPosts(Number(restaurantId));
            fetchRestaurant();
        }
    }, [restaurantId]);

    const fetchPosts = async (restaurantId: number) => {
        try {
            const postData = await fetchPostService(restaurantId);

            setPosts(postData.map((data) => data.post));
            setLikedPosts(postData.filter((data) => data.liked).map((data) => data.post.id));

            setLikeCounts(
                postData.reduce((acc, data) => {
                    acc[data.post.id] = data.count;
                    return acc;
                }, {} as { [key: number]: number })
            );

            const updatedImages: { [key: number]: string[] } = {};
            for (const data of postData) {
                const imageURLs = await getImageService(data.post.id);
                updatedImages[data.post.id] = imageURLs;
            }
            setImages(updatedImages);

        } catch (error) {
            console.error("loadPosts error:", error);
        }
    };

    const fetchRestaurant = async () => {
        if (restaurantId) {
            const data = await fetchRestaurantService(Number(restaurantId));
            if (data) setRestaurant(data);
        }
    };

    const fetchImage = async (postId: number) => {
        const imageURLs = await getImageService(postId)

        setImages(prevImages => ({
            ...prevImages,
            [postId]: imageURLs,
        }));
    }

    const handleDelete = async (postId: number) => {
        if (window.confirm("게시글을 삭제하시겠습니까?")) {
            const success = await deletePostService(postId);

            if (success) {
                alert("게시글이 삭제되었습니다.");
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                router.push(`/post/${restaurantId}`);
            }
        }
    };

    // 댓글 버튼 
    const toggleReply = async (id: number) => {
        const { toggled, replies } = await toggleReplyService(id, replyToggles);
        console.log("toggleReply: ", replies);

        setReplyToggles((prevToggles) => ({
            ...prevToggles,
            [id]: toggled[id],
        }));

        setReplies(prevReplies => ({
            ...prevReplies,
            [id]: replies || prevReplies[id],
        }));
    }

    // 댓글 작성 (서버 연결)
    const replySubmit = async (postId: number, e: FormEvent) => {
        e.preventDefault();

        const replyContent = replyInput[postId];
        if (!replyContent) {
            alert('댓글을 입력하세요.');
            return;
        }
        const result = await submitReplyService(postId, replyContent, currentUserId, replyToggles);

        if (result && result.success) {
            const { newReply } = result;

            setReplies((prevReplies) => ({
                ...prevReplies,
                [postId]: [...(prevReplies[postId] || []), newReply],
            }));

            setReplyInput((prevInput) => ({
                ...prevInput,
                [postId]: '',
            }));
        }
    };

    // 댓글 작성 & 수정 
    const replyInputChange = (id: number, content: string, isEdit: boolean) => {
        if (isEdit) { // 댓글 작성 (postId)
            setReplyInput((prevInput) => ({
                ...prevInput,
                [id]: content,
            }));
        } else { // 댓글 수정 (replyId)
            setEditInput((prevInput) => ({
                ...prevInput,
                [id]: content,
            }));
        }
    }

    // 수정 & 저장 버튼 
    const replyEditClick = (replyId: number, currentContent: string) => {
        setEditReply((prevEdit) => ({
            ...prevEdit,
            [replyId]: true,
        }));
        setEditInput((prevInput) => ({
            ...prevInput,
            [replyId]: currentContent,
        }));
    };

    // 수정내용 저장 (서버연결)
    const replyEditSave = async (replyId: number, postId: number) => {
        const updateReply = await editSaveReplyService(replyId, postId, editInput[replyId], currentUserId);
        if (updateReply) {
            setReplies((prevReplies) => ({
                ...prevReplies,
                [postId]: prevReplies[postId]?.map((reply) =>
                    reply.id === replyId ? updateReply : reply
                ),
            }));

            setEditReply((prevEditReply) => ({
                ...prevEditReply,
                [replyId]: false,
            }));
        } else {
            console.log("댓글 수정 실패");
        }
    };

    // 댓글 삭제 
    const replyDelete = async (replyId: number, postId: number) => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

        const updatedReplies = await deleteReplyService(replyId, postId, replies);

        if (updatedReplies) {
            setReplies(prevReplies => ({
                ...prevReplies,
                [postId]: updatedReplies
            }));
        }
    };

    // 날짜 포맷 지정 
    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = { year: '2-digit', month: '2-digit', day: '2-digit' };
        const formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(date);

        const [year, month, day] = formattedDate.split('.').map(part => part.trim());
        return `${year}년 ${month}월 ${day}일`;
    };

    // 좋아요 상태 확인 
    const checkLikedStatus = async (postId: number) => {
        const isLiked = await checkLikedService(postId, currentUserId);
        return isLiked ? postId : null;
    };

    // 좋아요 & 취소 & count
    const handleLike = async (postId: number) => {
        const result = await toggleLikeService(postId, currentUserId, likedPost);

        if (result) {
            setLikedPosts(result.likedPost);
            setLikeCounts((prevCounts) => ({
                ...prevCounts,
                [postId]: (prevCounts[postId] || 0) + result.likeCountDelta,
            }))
        }
    };


    return (
        <>
            <div className="product-detail default" style={{ marginTop: '30px' }}>
                <div className="review-block md:py-20 py-10 bg-surface">
                    <div className="heading flex items-center justify-between flex-wrap gap-4">
                        <div className="heading4">{`${restaurant?.name}`} Review</div>
                        <button
                            className='button-main bg-white text-black border border-black'
                            onClick={() => router.push(`/post/register/${restaurantId}`)}
                        >
                            Write Reviews
                        </button>
                    </div>
                    <div className="top-overview flex justify-between py-6 max-md:flex-col gap-y-6">
                        <div className="rating lg:w-1/4 md:w-[30%] lg:pr-[75px] md:pr-[35px]">
                            <div className="heading flex items-center justify-center flex-wrap gap-3 gap-y-4">
                                <div className="text-display">4.6</div>
                                <div className='flex flex-col items-center'>
                                    <Rate currentRate={5} size={18} />
                                    <div className='text-secondary text-center mt-1'>(1,968 Ratings)</div>
                                </div>
                            </div>
                            <div className="list-rating mt-3">
                                <div className="item flex items-center justify-between gap-1.5">
                                    <div className="flex items-center gap-1">
                                        <div className="caption1">5</div>
                                        <Icon.Star size={14} weight='fill' />
                                    </div>
                                    <div className="progress bg-line relative w-3/4 h-2">
                                        <div className="progress-percent absolute bg-yellow w-[50%] h-full left-0 top-0"></div>
                                    </div>
                                    <div className="caption1">50%</div>
                                </div>
                                <div className="item flex items-center justify-between gap-1.5 mt-1">
                                    <div className="flex items-center gap-1">
                                        <div className="caption1">4</div>
                                        <Icon.Star size={14} weight='fill' />
                                    </div>
                                    <div className="progress bg-line relative w-3/4 h-2">
                                        <div className="progress-percent absolute bg-yellow w-[20%] h-full left-0 top-0"></div>
                                    </div>
                                    <div className="caption1">20%</div>
                                </div>
                                <div className="item flex items-center justify-between gap-1.5 mt-1">
                                    <div className="flex items-center gap-1">
                                        <div className="caption1">3</div>
                                        <Icon.Star size={14} weight='fill' />
                                    </div>
                                    <div className="progress bg-line relative w-3/4 h-2">
                                        <div className="progress-percent absolute bg-yellow w-[10%] h-full left-0 top-0"></div>
                                    </div>
                                    <div className="caption1">10%</div>
                                </div>
                                <div className="item flex items-center justify-between gap-1.5 mt-1">
                                    <div className="flex items-center gap-1">
                                        <div className="caption1">2</div>
                                        <Icon.Star size={14} weight='fill' />
                                    </div>
                                    <div className="progress bg-line relative w-3/4 h-2">
                                        <div className="progress-percent absolute bg-yellow w-[10%] h-full left-0 top-0"></div>
                                    </div>
                                    <div className="caption1">10%</div>
                                </div>
                                <div className="item flex items-center justify-between gap-1.5 mt-1">
                                    <div className="flex items-center gap-2">
                                        <div className="caption1">1</div>
                                        <Icon.Star size={14} weight='fill' />
                                    </div>
                                    <div className="progress bg-line relative w-3/4 h-2">
                                        <div className="progress-percent absolute bg-yellow w-[10%] h-full left-0 top-0"></div>
                                    </div>
                                    <div className="caption1">10%</div>
                                </div>
                            </div>
                        </div>
                        <div className="list-img lg:w-3/4 md:w-[70%] lg:pl-[15px] md:pl-[15px]">
                            <div className="heading5">All Image (128)</div>
                            <div className="list md:mt-6 mt-3">
                                <Swiper
                                    spaceBetween={16}
                                    slidesPerView={3}
                                    modules={[Navigation]}
                                    breakpoints={{
                                        576: {
                                            slidesPerView: 4,
                                            spaceBetween: 16,
                                        },
                                        640: {
                                            slidesPerView: 5,
                                            spaceBetween: 16,
                                        },
                                    }}
                                >
                                    <SwiperSlide>
                                        <Image
                                            src={'/images/product/1000x1000.png'}
                                            width={400}
                                            height={400}
                                            alt=''
                                            className='w-[120px] aspect-square object-cover rounded-lg'
                                        />
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <Image
                                            src={'/images/product/1000x1000.png'}
                                            width={400}
                                            height={400}
                                            alt=''
                                            className='w-[120px] aspect-square object-cover rounded-lg'
                                        />
                                    </SwiperSlide>
                                </Swiper>
                            </div>
                            <div className="sorting flex items-center flex-wrap md:gap-5 gap-3 gap-y-3 mt-6">
                                <div className="text-button">Sort by</div>
                                <div className="item bg-white px-4 py-1 border border-line rounded-full">Newest</div>
                                <div className="item bg-white px-4 py-1 border border-line rounded-full">5 Star</div>
                                <div className="item bg-white px-4 py-1 border border-line rounded-full">4 Star</div>
                                <div className="item bg-white px-4 py-1 border border-line rounded-full">3 Star</div>
                                <div className="item bg-white px-4 py-1 border border-line rounded-full">2 Star</div>
                                <div className="item bg-white px-4 py-1 border border-line rounded-full">1 Star</div>
                            </div>
                        </div>
                    </div>
                    <div className="list-review">
                        <>
                            {posts.map((p) => (
                                <div key={p.id} className="item flex max-lg:flex-col gap-y-4 w-full py-6 border-t border-line">
                                    <div className="left lg:w-1/4 w-full lg:pr-[15px]">
                                        <div className="list-img-review flex gap-2">
                                            {images[p.id] && images[p.id].length > 0 ? (
                                                images[p.id].map((url, index) => (
                                                    <img
                                                        key={index}
                                                        src={url}
                                                        alt={`이미지 ${index + 1}`}
                                                        className="w-[60px] aspect-square rounded-lg"
                                                    />
                                                ))
                                            ) : (
                                                <div className="w-[60px] aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="user mt-3">
                                            <div className="text-title">{p.nickname}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-secondary2">{formatDate(p.entryDate)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="right lg:w-3/4 w-full lg:pl-[15px]">
                                        <div className='flex items-center'>
                                            <Star w="w-4" h="h-4" readonly={true} rate={p.averageRating} />
                                            <p className='ml-2'>{p.averageRating.toFixed(1)} / 5</p>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="flex items-center">
                                                <p className={labelStyle}>맛:</p>
                                                <div className={starContainerStyle}>
                                                    <Star w="w-2" h="h-2" readonly={true} rate={p.taste} />
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <p className={labelStyle}>청결:</p>
                                                <div className={starContainerStyle}>
                                                    <Star w="w-2" h="h-2" readonly={true} rate={p.clean} />
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <p className={labelStyle}>서비스:</p>
                                                <div className={starContainerStyle}>
                                                    <Star w="w-2" h="h-2" readonly={true} rate={p.service} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="body1 mt-3">{p.content}</div>
                                        <div className="mb-4 flex items-center">
                                            <h2 className="text-lg font-bold mb-0 flex-shrink-0 self-center">태그:</h2>
                                            {p.tags && p.tags.length > 0 ? (
                                                <ul className="flex flex-wrap gap-2 items-center">
                                                    {p.tags.map((tag, index) => (
                                                        <li
                                                            key={index}
                                                            className="rounded-full border border-gray-300 bg-white px-3 py-1 text-gray-600 font-semibold shadow-sm hover:bg-gray-100"
                                                        >
                                                            {tag}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="ml-2 text-gray-500">태그 없음</p>
                                            )}
                                        </div>
                                        <div className="action mt-3">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleLike(p.id)}
                                                    className="like-btn flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Icon.Heart
                                                        size={18}
                                                        color={likeCount[p.id] > 0 ? "#FF0000" : "#9FA09C"}
                                                        weight="fill"
                                                    />
                                                    <div className="text-button">{likeCount[p.id] || 0}</div>
                                                </button>
                                                <button onClick={() => toggleReply(p.id)} className="reply-btn text-button text-secondary cursor-pointer hover:text-black">Reply</button>
                                            </div>
                                            {replyToggles[p.id] && (
                                                <>
                                                    <div className="mt-4 w-full">
                                                        {replies[p.id] && replies[p.id].length > 0 ? (
                                                            <ul>
                                                                {replies[p.id].map((reply, index) => (
                                                                    <li key={index} className="mb-2 border-b border-gray-200 pb-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center">
                                                                                <span className="inline-block rounded-full bg-gray-300 px-3 py-1 text-sm font-semibold text-gray-700">
                                                                                    {reply.nickname}
                                                                                </span>
                                                                                {editReply[reply.id] ? (
                                                                                    <span className="ml-2" style={{ width: "600px", display: "inline-block", whiteSpace: "nowrap" }}>
                                                                                        <textarea
                                                                                            name="content"
                                                                                            id="content"
                                                                                            value={editInput[reply.id] || reply.content}
                                                                                            onChange={(e) => replyInputChange(reply.id, e.target.value, false)}
                                                                                            className="border rounded p-2 w-full"
                                                                                            style={{ minHeight: "50px", width: "100%" }}
                                                                                        />
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="ml-2" style={{ width: "auto", display: "inline-block", whiteSpace: "nowrap" }}>
                                                                                        {reply.content}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center">
                                                                                <span className="text-gray-500 mr-4">{formatDate(reply.entryDate)}</span>
                                                                                {reply.userId === currentUserId && (
                                                                                    <div className="flex space-x-2">
                                                                                        <button
                                                                                            className="text-xs bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-3 border border-blue-500 hover:border-transparent rounded"
                                                                                            onClick={() => editReply[reply.id] ? replyEditSave(reply.id, p.id) : replyEditClick(reply.id, reply.content)}
                                                                                        >
                                                                                            {editReply[reply.id] ? '저장' : '수정'}
                                                                                        </button>
                                                                                        <button
                                                                                            className="text-xs bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-1 px-3 border border-red-500 hover:border-transparent rounded"
                                                                                            onClick={() => reply.id && replyDelete(reply.id, p.id)}
                                                                                        >
                                                                                            삭제
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p>댓글 없음</p>
                                                        )}
                                                    </div>
                                                    <form onSubmit={(e) => replySubmit(p.id, e)} className="my-4 flex space-x-4">
                                                        <input
                                                            type="text"
                                                            placeholder="댓글을 입력하세요."
                                                            value={replyInput[p.id] || ""}
                                                            onChange={(e) => replyInputChange(p.id, e.target.value, true)}
                                                            className="border rounded p-2 flex-grow" />
                                                        <button
                                                            type="submit"
                                                            className="bg-transparent hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded mr-2"

                                                        >
                                                            등록
                                                        </button>
                                                    </form>
                                                </>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </>

                        <div className="text-button more-review-btn text-center mt-2 underline">View More Comments</div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Default