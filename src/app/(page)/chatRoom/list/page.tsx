import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { deleteChatRoomsService, getChatRoomData } from '@/app/service/chatRoom/chatRoom.api';
import { getUnreadCount } from '@/app/api/chat/chat.api';
import { ChatRooms } from '@/app/components/ChatRooms';
import Head from 'next/head';
import ChatRoomDetails from '../details/[id]/page';

const ChatRoomList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sender, setSender] = useState('');
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nickname = localStorage.getItem('nickname');
      if (nickname) {
        setSender(nickname);
        fetchChatRooms(nickname); // 기본 데이터 로딩
      }
    }
  }, []);

  const fetchChatRooms = async (nickname) => {
    setLoading(true);
    try {
      const { chatRooms } = await getChatRoomData(nickname);
      setChatRooms(chatRooms);
      await fetchUnreadCounts(chatRooms); // 읽지 않은 메시지 수 가져오기
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async (rooms) => {
    try {
      const updatedRooms = await Promise.all(
        rooms.map(async (room) => {
          const unreadCountResult = await getUnreadCount(room.id, sender);
          return { ...room, unreadCount: unreadCountResult };
        })
      );
      setChatRooms(updatedRooms);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };


  useEffect(() => {
    if (!sender) return;

    const fetchUnreadCounts = async () => {
      try {
        const updatedChatRooms = await Promise.all(
          chatRooms.map(async (room) => {
            const unreadCountResult = await getUnreadCount(room.id, sender);
            return { ...room, unreadCount: unreadCountResult };
          })
        );

        setChatRooms(updatedChatRooms);
      } catch (error) {
        console.error('읽지 않은 메시지 수를 가져오는 중 오류 발생:', error);
      }
    };

    fetchUnreadCounts();
  }, [sender]); // chatRooms를 제거하여 무한 루프 방지

  const filteredChatRooms = chatRooms.filter((room) => {
    const participantsStr = room.participants.join(' ').toLowerCase();
    return (
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participantsStr.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>냠냠</title>
        <meta name="author" content="Templines" />
        <meta name="description" content="TeamHost" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="shortcut icon" href="/assets/img/favicon.png" type="image/x-icon" />
        <link rel="stylesheet" href="/assets/css/libs.min.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" rel="stylesheet" />
      </Head>
      <main className="page-main">
        <h3 className="uk-text-lead">Chats</h3>
        <div className="uk-grid uk-grid-small" data-uk-grid>
          <div className="uk-width-1-3@l">
            <div className="chat-user-list">
              <div className="chat-user-list__box" style={{ width: '90%', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', backgroundColor: '#F9F9F9', height: '900px', overflowY: 'auto' }}>
                <div className="chat-user-list__head" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="avatar">
                    <Image src="/assets/img/profile.png" alt="profile" width={40} height={40} style={{ borderRadius: '50%' }} />
                  </div>
                  <h2 style={{ marginLeft: '16px', fontSize: '20px', fontWeight: 'bold', color: '#4A4A4A' }}>Chat Rooms</h2>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
                <div className="chat-user-list__search" style={{ marginBottom: '8px' }}>
                  <div className="search" style={{ position: 'relative' }}>
                    <i className="ico_search" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', color: '#888' }}></i>
                    <input
                      type="search"
                      name="search"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 36px',
                        borderRadius: '24px',
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        outline: 'none',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </div>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '8px 0' }} />
                <div className="chat-user-list__body">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredChatRooms.map((room) => {
                      const currentUserNickname = "kidon"; // 로그인한 유저 닉네임
                      const otherParticipants = room.participants.filter(participant => participant !== currentUserNickname);
                      const otherParticipantsStr = otherParticipants.length > 0 ? otherParticipants.join(', ') : "No Participants";

                      return (
                        <li key={room.id}>
                          <div className="user-item --active" style={{ padding: '10px 0', backgroundColor: '#FFFFFF', borderRadius: '8px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', marginBottom: '8px' }}>
                            <div className="user-item__avatar">
                              <Image src="/assets/img/user-list-1.png" alt="user" width={40} height={40} style={{ borderRadius: '50%' }} />
                            </div>
                            <div className="user-item__desc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginLeft: '10px' }}>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (room && room.id) {
                                    setSelectedChatRoomId(room.id);
                                  }
                                }}
                                style={{ textDecoration: 'none', color: '#4A4A4A', flexGrow: 2, fontSize: '16px' }}
                              >
                                <div className="user-item__name">
                                  {`${otherParticipantsStr} ${room.name}`}
                                </div>
                              </a>
                            </div>
                            <div className="user-item__info" style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                              <span
                                style={{
                                  display: room.unreadCount > 0 ? 'inline-block' : 'none',
                                  backgroundColor: 'red',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  minWidth: '20px',
                                  textAlign: 'center',
                                  marginRight: '10px'
                                }}
                              >
                                {room.unreadCount}
                              </span>
                              <ChatRooms chatRoomId={room.id} nickname={localStorage.getItem('nickname')} />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="uk-width-2-3@l">
            <ChatRoomDetails chatRoomId={selectedChatRoomId} sender={sender} />
          </div>
        </div>
      </main>
    </>
  );
};

export default ChatRoomList;
