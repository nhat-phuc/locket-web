import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categoryColor?: string | null;
  author: string;
  image?: string | null;
  tags: string;
  readTime: string;
  views: number;
  createdAt: string;
}

export default function PostCard({ post }: { post: Post }) {
  const tags = post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const color = post.categoryColor || "var(--accent-bright)";

  return (
    <Link href={`/bai-viet/${post.slug}`} className="post-card">
      <div className="post-card-img">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt={post.title} loading="lazy" />
        ) : (
          <div className="post-card-placeholder">📝</div>
        )}
        <span className="post-card-cat" style={{ background: color }}>
          {post.category}
        </span>
        <span className="post-card-read">⏱ {post.readTime}</span>
      </div>
      <div className="post-card-body">
        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-excerpt">{post.excerpt}</p>
        {tags.length > 0 && (
          <div className="post-card-tags">
            {tags.slice(0, 3).map((t, i) => (
              <span key={i} className="post-card-tag">#{t}</span>
            ))}
          </div>
        )}
        <div className="post-card-footer">
          <span className="post-card-author">✍ {post.author}</span>
          <span className="post-card-views">👁 {post.views}</span>
        </div>
      </div>
    </Link>
  );
}
