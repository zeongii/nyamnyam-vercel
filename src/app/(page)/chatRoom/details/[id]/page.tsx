import React, { useEffect, useState, useRef } from 'react';
import { sendMessageService, subscribeMessages } from 'src/app/service/chat/chat.api';
import { markMessageAsRead } from 'src/app/api/chat/chat.api';
import { ChatModel } from 'src/app/model/chat.model';
import EmojiPicker from "src/app/components/EmojiPicker";
import Image from 'next/image';
import { getChatRoomDetails } from '@/app/service/chatRoom/chatRoom.api';
import { ChatRoomModel } from '@/app/model/chatRoom.model';

const ChatRoomDetails = ({ chatRoomId, sender }) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatModel[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [chatRoomDetails, setChatRoomDetails] = useState<ChatRoomModel | null>(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('ko-KR', { hour: '2-digit', minute: '2-digit' }).format(date);
  };

  useEffect(() => {
    if (!selectedChatRoomId) return;

    // 채팅방 상세 정보 가져오기
    const fetchChatRoomDetails = async () => {
      try {
        const details = await getChatRoomDetails(selectedChatRoomId);
        setChatRoomDetails(details);
      } catch (error) {
        console.error('채팅방 상세 정보를 가져오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRoomDetails();

    const eventSource = new EventSource(`http://localhost:8081/api/chats/${selectedChatRoomId}`);
    eventSource.onmessage = async (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
        if (!messageExists) {
          // 이미 읽은 메시지인 경우 API 호출 방지
          if (!newMessage.readBy[sender]) {
            markMessageAsRead(newMessage.id, sender)
              .then(() => {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === newMessage.id
                      ? { ...msg, isRead: true, readBy: { ...msg.readBy, [sender]: true } }
                      : msg
                  )
                );
              })
              .catch((error) => console.error('Failed to mark message as read:', error));
          }
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });
    };

    eventSource.onerror = (event) => {
      console.error("EventSource 에러:", event);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [selectedChatRoomId, sender]);

  const countNotReadParticipants = (message: ChatModel) => {
    const readByCount = Object.keys(message.readBy).length;
    return message.totalParticipants - readByCount;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === '') return;

    const newMessageData = {
      sender,
      message: newMessage,
      readBy: { [sender]: true },
    };

    try {
      const sentMessage = await sendMessageService(selectedChatRoomId, newMessageData);
      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(msg => msg.id === sentMessage.id);
        return messageExists ? prevMessages : [...prevMessages, sentMessage];
      });
      setNewMessage('');
    } catch (error) {
      console.error(error);
      alert('메시지 전송 중 오류가 발생했습니다.');
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="uk-width-2-3@l">
      <div className="chat-messages-box">
        <div className="chat-messages-head">
          {selectedChatRoomId ? (
            <div className="user-item">
              <div className="user-item__avatar">
                <Image src="/assets/img/user-list-4.png" alt="user" width={40} height={40} />
              </div>
              <div className="user-item__desc" style={{ width: 'full' }}>
                <div className="user-item__name" style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                  {chatRoomId.find(room => room.id === selectedChatRoomId)?.name || "Unknown Room"}
                </div>
              </div>
            </div>
          ) : (
            <h3>선택된 채팅방이 없습니다.</h3>
          )}
        </div>
        {selectedChatRoomId && (
          <>
            <div className="chat-messages-body flex-1 overflow-y-auto p-4 bg-white shadow-md rounded-lg space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`w-full messages-item ${msg.sender !== sender ? '--your-message' : '--friend-message'} flex`}
                >
                  <div className="messages-item__avatar flex items-center mr-2">
                    <Image src={msg.sender !== sender ? "/assets/img/user-list-3.png" : "/assets/img/user-list-4.png"} alt="img" width={40} height={40} />
                  </div>
                  <div className="flex flex-col justify-start">
                    <div className="flex items-center">
                      <p className="text-sm font-semibold">{msg.sender}</p>
                    </div>
                    <div className="messages-item__text">{msg.message}</div>
                    <div className="messages-item__time text-gray-500 text-xs ml-auto">{formatTime(new Date(msg.createdAt))}</div>
                    {countNotReadParticipants(msg) > 0 && (
                      <span style={{ color: 'red', fontSize: '0.8em' }}>
                        {countNotReadParticipants(msg)} unread
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-messages-footer">
              <form onSubmit={handleSendMessage} className="chat-messages-form flex mt-4">
                <div className="chat-messages-form-controls flex-grow">
                  <button
                    type="button"
                    onClick={toggleEmojiPicker}
                    className="emoji-picker-button px-2 py-1 rounded-md mr-2 border"
                  >
                    😊
                  </button>

                  {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-16 left-0 z-50">
                      <EmojiPicker onSelectEmoji={handleEmojiClick} />
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="chat-messages-input border border-gray-300 p-2"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatRoomDetails;