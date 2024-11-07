import { User } from "src/app/model/user.model";
import axios from "axios";

let token: string | null = null;

if (typeof window !== "undefined") {
    token = localStorage.getItem('token');
}
export const fetchAllUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`http://localhost:8081/api/user/findAll`, {
            method: "GET",
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        return response.json();
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

// 사용자 수 가져오기
export const fetchUserCount = async (): Promise<number> => {
    try {
        const response = await fetch(`http://localhost:8081/api/user/count`, {
            method: "GET",
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        return response.json();
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

// 사용자 삭제
export const deleteUserById = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`http://localhost:8081/api/user/deleteById?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

export const updateUser = async (user: Partial<User>, thumbnails: File[] = []): Promise<User> => {
    const formData = new FormData();
    formData.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));

    // thumbnails가 있을 경우 추가
    thumbnails.forEach(thumbnail => formData.append("thumbnails", thumbnail));

    try {
        const response = await fetch(`http://localhost:8081/api/user/update`, {
            method: 'PUT',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        return response.json();
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};




// 사용자 존재 여부 확인
export const fetchUserExists = async (id: string): Promise<boolean> => {
    try {
        const response = await fetch(`http://localhost:8081/api/user/existsById?id=${id}`, {
            method: "GET",
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        return response.json();
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

// 사용자 ID로 정보 가져오기
export const fetchUserById = async (id: string): Promise<User> => {
    try {
        const response = await fetch(`http://localhost:8081/api/user/findById?id=${id}`, {
            method: "GET",
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        return response.json();
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

// 사용자 등록 (회원가입)
export const registerUser = async (user: Partial<User>, thumbnails: File[] = []): Promise<User> => {
    const formData = new FormData();
    formData.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));
    thumbnails.forEach(thumbnail => formData.append("thumbnails", thumbnail));

    try {
        const response = await fetch("http://localhost:8081/api/user/register", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            if (response.status === 409) throw new Error("이미 사용 중인 사용자 이름입니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        return response.json();
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

// 사용자 로그인
export const loginUser = async (username: string, password: string): Promise<string> => {
    try {
        const response = await fetch(`http://localhost:8081/api/user/login?username=${username}&password=${password}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            // 401 에러와 같은 특정 상태 코드를 명시적으로 처리
            if (response.status === 401) throw new Error("아이디 또는 비밀번호가 잘못되었습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }

        // 응답이 JSON 객체인 경우 JSON 파싱, 그렇지 않으면 단순 문자열로 처리
        const contentType = response.headers.get('Content-Type');
        const data = contentType && contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        return typeof data === 'string' ? data : data.token; // 토큰 반환
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};


// 썸네일 업로드
export const uploadThumbnailApi = async (userId: string, thumbnails: File[]): Promise<string[]> => {
    const formData = new FormData();
    thumbnails.forEach(thumbnail => formData.append('images', thumbnail));

    try {
        const response = await axios.post(`http://localhost:8081/api/thumbnails/upload`, formData, {
            params: { userId },
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 500) {
            return Promise.reject("썸네일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        }
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

// 사용자 활성화 상태 토글
export const toggleEnable = async (userId: string, enabled: boolean): Promise<void> => {
    try {
        const response = await fetch(`http://localhost:8081/api/user/toggleEnable?userId=${userId}&enabled=${enabled}`, {
            method: 'PUT',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

// 사용자 점수 증가
export const increaseScoreApi = async (userId: string): Promise<void> => {
    try {
        const response = await fetch(`http://localhost:8081/api/score/scoreUp?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};

// 사용자 점수 감소
export const decreaseScoreApi = async (userId: string): Promise<void> => {
    try {
        const response = await fetch(`http://localhost:8081/api/score/scoreDown?userId=${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error("사용자를 찾을 수 없습니다.");
            throw new Error("서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
    } catch (error: any) {
        return Promise.reject(error.message || "예기치 못한 오류가 발생했습니다.");
    }
};
