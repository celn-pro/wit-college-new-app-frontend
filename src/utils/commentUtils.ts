import { Comment } from "../services/newsService";

export const sortComments = (comments: Comment[], sortOrder: 'newest' | 'oldest'): Comment[] => {
  return [...comments].sort((a, b) =>
    sortOrder === 'newest'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};