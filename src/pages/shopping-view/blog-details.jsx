import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://blogs.aachiammafoods.com/wp-json/wp/v2/posts?slug=${id}&_embed`);
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        const data = await response.json();
        if (data.length > 0) {
          setPost(data[0]);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#08665F]"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-24 pb-20 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || 'Post not found'}</h2>
        <Button onClick={() => navigate('/blog')} variant="outline" className="border-[#08665F] text-[#08665F] hover:bg-[#08665F] hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Button>
      </div>
    );
  }

  const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1626200419188-f5628eb54a18?w=1200&auto=format&fit=crop&q=80';
  const authorName = post._embedded?.author?.[0]?.name || 'Admin';
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Banner */}
      <div className="w-full bg-[#08665F] py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <button 
            onClick={() => navigate('/blog')}
            className="self-start flex items-center text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back to all articles
          </button>
          <h1 
            className="text-2xl md:text-4xl font-extrabold text-white tracking-wide"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-100 text-sm mt-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>5 min read</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 md:mt-12">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {/* Featured Image */}
          {imageUrl && (
            <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-gray-100">
              <img 
                src={imageUrl} 
                alt="Featured" 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          
          {/* Content */}
          <div className="p-6 md:p-12 prose prose-lg max-w-none prose-a:text-[#08665F] hover:prose-a:text-[#064e48] prose-img:rounded-xl">
            <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
          </div>
        </div>
      </div>
    </div>
  );
}
