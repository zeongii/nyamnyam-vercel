// src/app/service/user.service.ts
import { User } from "src/app/model/user.model";
import {
    fetchUserExists,
    fetchUserById,
    fetchAllUsers,
    fetchUserCount,
    deleteUserById,
    updateUser,
    registerUser,
    loginUser, uploadThumbnailApi,
    toggleEnable as toggleEnableApi,
    increaseScoreApi,decreaseScoreApi,
} from "src/app/api/user/user.api";

// 사용자 존재 여부 확인 서비스
export const checkUserExists = async (id: string): Promise<boolean> => {
    return await fetchUserExists(id);
};

// 사용자 정보 가져오기 서비스
export const getUserById = async (id: string): Promise<User> => {
    return await fetchUserById(id);
};

// 모든 사용자 가져오기 서비스
export const getAllUsers = async (): Promise<User[]> => {
    return await fetchAllUsers();
};

// 사용자 수 가져오기 서비스
export const getUserCount = async (): Promise<number> => {
    return await fetchUserCount();
};

// 사용자 삭제 서비스
export const removeUserById = async (id: string): Promise<void> => {
    await deleteUserById(id);
};

// 사용자 정보 업데이트 서비스
export const modifyUser = async (user: User): Promise<User> => {
    return await updateUser(user);
};

// 회원가입과 썸네일 업로드를 연계하는 함수
export const addUser = async (
    username: string,
    password: string,
    nickname: string,
    name: string,
    age: number | string,
    tel: string,
    gender: string,
    thumbnails: File[]
) => {
    console.log("Adding user:", { username, password, nickname, name, age, tel, gender });

    const user: Partial<User> = {
        username,
        password,
        nickname,
        name,
        age: Number(age),
        tel,
        gender,
        enabled: true,
        role: "USER",
        score: 36.5
    };

    try {
        // 사용자 정보만 등록
        const registeredUser = await registerUser(user);
        console.log("User registered:", registeredUser);

        // 등록 후 썸네일 업로드
        if (thumbnails.length > 0) {
            const thumbnailUrls = await uploadThumbnailApi(registeredUser.id, thumbnails);
            console.log("Uploaded thumbnail URLs:", thumbnailUrls);
        }

        return registeredUser;
    } catch (error) {
        console.error("Registration failed:", error);
        throw new Error("Failed to register user");
    }
};


export const updateUserImgId = async (userId: string, imgId: string) => {
    const response = await fetch(`http://localhost:8081/api/user/updateImgId`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, imgId }),
    });

    if (!response.ok) {
        throw new Error('Failed to update user imgId');
    }

    console.log("User imgId updated successfully");
};

// 사용자 로그인 서비스
export const authenticateUser = async (username: string, password: string): Promise<string> => {
    return await loginUser(username, password);
};

export const toggleEnable = async (userId: string, enabled: boolean): Promise<void> => {
    await toggleEnableApi(userId, enabled);
};

export const increaseScore = async (userId: string): Promise<void> => {
    await increaseScoreApi(userId);
};

// 점수 감소 서비스
export const decreaseScore = async (userId: string): Promise<void> => {
    await decreaseScoreApi(userId);
};


