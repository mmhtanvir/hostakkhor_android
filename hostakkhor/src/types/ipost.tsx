export interface IPost {
  id?: number;
  path?: string;
  created_at?: number;
  authorId: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    id?: string;
  };
  content: string;
  images?: string[];
  audioFiles?: string[];
  videos?: string[];
  category: string;
  likes: number;
  comments: number;
  likedBy: string[];
  communityId?: string;
  pageId?: string;
  visibility?: "public" | "private";
  pinned?: boolean;
}