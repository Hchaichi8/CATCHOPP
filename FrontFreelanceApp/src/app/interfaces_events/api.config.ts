/**
 * API Configuration for Events & Communities Module
 * All requests go through the API Gateway (port 8085)
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8085',
  ENDPOINTS: {
    GROUPS: '/api/groups',
    EVENTS: '/api/events',
    CLUBS: '/api/clubs',
    POSTS: '/api/posts',
    GROUP_MEMBERS: '/api/group-members',
    COMMENTS: '/api/comments',
    REACTIONS: '/api/reactions',
    COMMENT_REACTIONS: '/api/comment-reactions',
    JOIN_REQUESTS: '/api/join-requests',
    REPORTS: '/api/reports'
  }
};

// Helper function to build full URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

