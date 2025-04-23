import api from './api';

const CommentService = {
  // Create a new comment
  createComment: async (blogId, content) => {
    const response = await api.post('/comments/create', { blogId, content });
    return response.data;
  },

  // Reply to a comment
  replyToComment: async (commentId, content, replyTo) => {
    const response = await api.post('/comments/reply', { 
      commentId, 
      content,
      replyTo
    });
    return response.data;
  },

  // Get all comments for a blog
  getBlogComments: async (blogId) => {
    const response = await api.post('/comments', { blogId });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Like or unlike a comment
  likeComment: async (commentId) => {
    const response = await api.post('/comments/like', { commentId });
    return response.data;
  }
};

export default CommentService; 