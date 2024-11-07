import { User } from "src/app/model/user.model";
import {
    fetchUserExists,
    fetchUserById,
    fetchAllUsers,
    fetchUserCount,
    deleteUserById,
    updateUser,
    registerUser,
    loginUser,
    uploadThumbnailApi,
    toggleEnable as toggleEnableApi,
    increaseScoreApi,
    decreaseScoreApi,
} from "src/app/api/user/user.api";

export const checkUserExists = async (id: string, showModalAlert: (msg: string) => void): Promise<boolean> => {
    try {
        return await fetchUserExists(id);
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const getUserById = async (id: string, showModalAlert: (msg: string) => void): Promise<User> => {
    try {
        return await fetchUserById(id);
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const getAllUsers = async (showModalAlert: (msg: string) => void): Promise<User[]> => {
    try {
        return await fetchAllUsers();
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const getUserCount = async (showModalAlert: (msg: string) => void): Promise<number> => {
    try {
        return await fetchUserCount();
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const removeUserById = async (id: string, showModalAlert: (msg: string) => void): Promise<void> => {
    try {
        await deleteUserById(id);
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const modifyUser = async (user: User, showModalAlert: (msg: string) => void): Promise<User> => {
    try {
        return await updateUser(user);
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const addUser = async (
    username: string,
    password: string,
    nickname: string,
    name: string,
    age: number | string,
    tel: string,
    gender: string,
    thumbnails: File[],
    showModalAlert: (msg: string) => void
) => {
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
        const registeredUser = await registerUser(user);
        if (thumbnails.length > 0) {
            await uploadThumbnailApi(registeredUser.id, thumbnails);
        }
        return registeredUser;
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const updateUserImgId = async (userId: string, imgId: string, showModalAlert: (msg: string) => void) => {
    try {
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
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const authenticateUser = async (
    username: string,
    password: string,
    showModalAlert: (msg: string) => void
): Promise<string> => {
    try {
        return await loginUser(username, password);
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const toggleEnable = async (userId: string, enabled: boolean, showModalAlert: (msg: string) => void): Promise<void> => {
    try {
        await toggleEnableApi(userId, enabled);
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const increaseScore = async (userId: string, showModalAlert: (msg: string) => void): Promise<void> => {
    try {
        await increaseScoreApi(userId);
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};

export const decreaseScore = async (userId: string, showModalAlert: (msg: string) => void): Promise<void> => {
    try {
        await decreaseScoreApi(userId);
    } catch (error: any) {
        showModalAlert(error);
        throw error;
    }
};