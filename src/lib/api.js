/**
 * API Client for authentication endpoints
 */

const API_BASE_URL = "";

/**
 * Make an API request
 */
async function apiRequest(endpoint, options = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  return {
    success: data.success,
    data: data.data,
    message: data.message,
    status: response.status,
  };
}

/**
 * Auth API methods
 */
export const authAPI = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    return apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
      skipAuth: true,
    });
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    return apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
  },

  /**
   * Request password reset
   */
  forgotPassword: async (email) => {
    return apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token, password) => {
    return apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    });
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return apiRequest("/api/auth/me", {
      method: "GET",
    });
  },

  /**
   * Logout user (client-side only)
   */
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    return !!token;
  },

  /**
   * Get stored user data
   */
  getStoredUser: () => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get stored token
   */
  getToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    return apiRequest("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /**
   * Update profile (fullName and/or username)
   */
  updateProfile: async (profileData) => {
    return apiRequest("/api/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Delete account
   */
  deleteAccount: async (password) => {
    return apiRequest("/api/auth/delete-account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
  },
};

/**
 * Chat API methods
 */
export const chatAPI = {
  /**
   * Get all conversations for current user
   */
  getConversations: async () => {
    return apiRequest("/api/chat/conversations", {
      method: "GET",
    });
  },

  /**
   * Get messages between current user and another user
   */
  getMessages: async (receiverId, limit = 50, before = null) => {
    const params = new URLSearchParams({
      receiverId,
      limit: limit.toString(),
    });
    if (before) {
      params.append("before", before);
    }
    return apiRequest(`/api/chat/messages?${params.toString()}`, {
      method: "GET",
    });
  },

  /**
   * Send a message
   */
  sendMessage: async (receiverId, content, type = "text") => {
    return apiRequest("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, content, type }),
    });
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (chatRoomId) => {
    return apiRequest("/api/chat/mark-read", {
      method: "PUT",
      body: JSON.stringify({ chatRoomId }),
    });
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId) => {
    return apiRequest("/api/chat/messages/delete", {
      method: "DELETE",
      body: JSON.stringify({ messageId }),
    });
  },

  /**
   * Edit a message
   */
  editMessage: async (messageId, newContent) => {
    return apiRequest("/api/chat/messages/edit", {
      method: "PUT",
      body: JSON.stringify({ messageId, newContent }),
    });
  },

  /**
   * Add or remove reaction to a message
   */
  reactToMessage: async (messageId, emoji) => {
    return apiRequest("/api/chat/messages/react", {
      method: "POST",
      body: JSON.stringify({ messageId, emoji }),
    });
  },
};

/**
 * Friends API methods
 */
export const friendsAPI = {
  /**
   * Search for users
   */
  searchUsers: async (query) => {
    return apiRequest(`/api/friends/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
  },

  /**
   * Send friend request
   */
  sendRequest: async (userId, message = "") => {
    return apiRequest("/api/friends/requests", {
      method: "POST",
      body: JSON.stringify({ userId, message }),
    });
  },

  /**
   * Get pending friend requests (received)
   */
  getRequests: async () => {
    return apiRequest("/api/friends/requests", {
      method: "GET",
    });
  },

  /**
   * Accept or reject a friend request
   */
  respondToRequest: async (requestId, action) => {
    return apiRequest("/api/friends/respond", {
      method: "PUT",
      body: JSON.stringify({ requestId, action }),
    });
  },

  /**
   * Get list of friends
   */
  getFriends: async () => {
    return apiRequest("/api/friends", {
      method: "GET",
    });
  },

  /**
   * Remove a friend
   */
  removeFriend: async (userId) => {
    return apiRequest("/api/friends", {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  },
};

export default authAPI;
