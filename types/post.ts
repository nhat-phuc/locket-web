export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categoryColor?: string;
  author: string;
  authorAvatar?: string;
  image?: string;
  tags: string[];
  readTime: string;
  views: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Review {
  id: string;
  userId?: string;
  name: string;
  initial: string;
  text: string;
  rating: number;
  image?: string;
  time: string;
  isApproved: boolean;
  createdAt: string | Date;
}
