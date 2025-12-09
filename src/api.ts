// src/api.ts
export type User = {
    id: number;
    email: string;
    location: string | null;
};

export type BaseItem = {
    id: number;
    title: string;
    description: string;
    location: string;
    status: string;         // "pending" | "finished"
    created_at: string;     // ISO date string
    user_id: number;
};

export type LostItem = BaseItem & {
    date_lost: string; // "YYYY-MM-DD"
    type?: "Lost";
};

export type FoundItem = BaseItem & {
    // not included in LostItems.to-dict, but present in FoundItems
    date_found?: string;
    type?: "Found";
};

export type AnyItem = (LostItem & { type: "Lost" }) | (FoundItem & { type: "Found" });

type ApiUserResponse = {
    message: string;
    user: User;
};

type ApiItemResponse = {
    message: string;
    item: BaseItem & { date_lost?: string; date_found?: string };
};

const API_BASE = "";
// w/ CRA proxy in package.josn, keep empty and just use relative URLs
// IF remove proxy, change to "http://127.0.0.1:5000".

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let errorText = `Request failed with status ${res.status}`;
        try {
            const body = await res.json();
            if (body.message) errorText = body.message;
            // some error responses use "error" instead of "message"
            if ((body as any).error) errorText = (body as any).error;
        } catch {
            // ignore JSON parse errors
        }
        throw new Error(errorText);
    }
    return res.json() as Promise<T>;
}

// ---------- Auth ----------
export async function register(email: string, password: string, location?: string | null): Promise<User> {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, location }),
    });

    const data = await handleResponse<ApiUserResponse>(res);
    return data.user;
}

export async function login(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse<ApiUserResponse>(res);
    return data.user;
}

// ---------- items ----------
export async function getAllItems(): Promise<AnyItem[]> {
  const res = await fetch(`${API_BASE}/items`, {
    method: "GET",
  });

  const data = await handleResponse<(BaseItem & { date_lost?: string; date_found?: string; type: "Lost" | "Found" })[]>(res);

  return data as AnyItem[];
}

export type PostLostItemInput = {
    title: string;
    description: string;
    user_id: number;
    location: string;
    date_lost: string; // "YYYY-MM-DD"
}

export async function postLostItem(input: PostLostItemInput): Promise<LostItem> {
    const res = await fetch(`${API_BASE}/items/lost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    const data = await handleResponse<ApiItemResponse>(res);
    // backend returns { message, item: {...} }
    return { ...(data.item as LostItem), type: "Lost" };
}

export type PostFoundItemInput = {
    title: string;
    description: string;
    user_id: number;
    location: string;
    date_found: string; // "YYYY-MM-DD"
}

export async function postFoundItem(input: PostFoundItemInput): Promise<FoundItem> {
    const res = await fetch(`${API_BASE}/items/found`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    const data = await handleResponse<ApiItemResponse>(res);
    return {...(data.item as FoundItem), type: "Found" };
}

export async function claimItem(itemID: number, claimantID: number, message?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/items/${itemID}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            claimant_id: claimantID,
            message: message ?? "",
        }),
    });

    await handleResponse<{ message: string }>(res);
}

export const api = {
    register,
    login,
    getAllItems,
    postLostItem,
    postFoundItem,
    claimItem,
};

