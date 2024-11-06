import { User } from "src/app/model/user.model";
let token: string | null = null;

if (typeof window !== "undefined") {
    token = localStorage.getItem('token');
}

export const fetchUserExists = async (id: string): Promise<boolean> => {
    const response = await fetch(`http://localhost:8081/api/user/existsById?id=${id}`,{
        method: "GET",
        headers: {
            'Authorization': token ? `Bearer ${token}` : '', // JWT 토큰을 Bearer 형식으로 추가
            "Content-Type": "application/json",
        },});
    if (!response.ok) {
        throw new Error('Failed to fetch user existence');
    }
    return response.json();
};

export const fetchUserById = async (id: string): Promise<User> => {
    const response = await fetch(`http://localhost:8081/api/user/findById?id=${id}`,{
        method: "GET",
        headers: {
            'Authorization': token ? `Bearer ${token}` : '', // JWT 토큰을 Bearer 형식으로 추가
            "Content-Type": "application/json",
        },});
    if (!response.ok) {
        throw new Error('Failed to fetch user by ID');
    }
    return response.json();
};

export const fetchAllUsers = async (): Promise<User[]> => {
    const response = await fetch(`http://localhost:8081/api/user/findAll`,{
        method: "GET",
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            "Content-Type": "application/json",
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch all users');
    }
    return response.json();
};

export const fetchUserCount = async (): Promise<number> => {
    const response = await fetch(`http://localhost:8081/api/user/count`);
    if (!response.ok) {
        throw new Error('Failed to fetch user count');
    }
    return response.json();
};

export const deleteUserById = async (id: string): Promise<void> => {
    const response = await fetch(`http://localhost:8081/api/user/deleteById?id=${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Failed to delete user');
    }
};


export const updateUser = async (user: User): Promise<User> => {
    const response = await fetch(`http://localhost:8081/api/user/update`, {
        method: 'PUT',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    if (!response.ok) {
        throw new Error('Failed to update user');
    }
    return response.json();
};

export const loginUser = async (username: string, password: string): Promise<string> => {
    const response = await fetch(`http://localhost:8081/api/user/login?username=${username}&password=${password}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to log in');
    }


    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.token;
    } else {
        return response.text();
    }
};

export const registerUser = async (user: Partial<User>, thumbnails: File[] = []): Promise<User> => {
    const formData = new FormData();
    formData.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));

    // 썸네일이 있을 경우에만 추가
    if (thumbnails.length > 0) {
        thumbnails.forEach((thumbnail) => {
            formData.append("thumbnails", thumbnail);
        });
    }

    const response = await fetch("http://localhost:8081/api/user/register", {
        method: "POST",
        body: formData,
    });

    console.log("Register user response status:", response.status);
    console.log("Register user response:", await response.text());

    if (!response.ok) {
        throw new Error("Failed to register user");
    }
    return response.json();
};


// 이미지 파일만 업로드하는 함수
export const uploadThumbnailApi = async (userId: string, thumbnails: File[]): Promise<string[]> => {
    const formData = new FormData();
    formData.append('userId', userId);

    thumbnails.forEach((thumbnail) => {
        formData.append('files', thumbnail);
    });

    const response = await fetch('http://localhost:8081/api/thumbnails/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Failed to upload thumbnails');
    }

    return response.json();
};


export const toggleEnable = async (userId: string, enabled: boolean): Promise<void> => {
    const response = await fetch(`http://localhost:8081/api/user/toggleEnable?userId=${userId}&enabled=${enabled}`, {
        method: 'PUT',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to toggle user enable status');
    }
};

export const increaseScoreApi = async (userId: string): Promise<void> => {
    const response = await fetch(`http://localhost:8081/api/score/scoreUp?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to increase score');
    }
};

export const decreaseScoreApi = async (userId: string): Promise<void> => {
    const response = await fetch(`http://localhost:8081/api/score/scoreDown?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to decrease score');
    }
};




