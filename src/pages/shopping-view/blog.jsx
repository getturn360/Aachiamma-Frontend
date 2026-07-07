import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://blogs.aachiammafoods.com/wp-json/wp/v2/posts?_embed');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Banner */}
      <div className="w-full bg-[#08665F] py-16 md:py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-wide">
            Our Stories & Recipes
          </h1>
          <p className="text-slate-100 text-base md:text-lg max-w-2xl mt-2 font-medium">
            Dive into the traditions, ingredients, and stories behind Aachiammafoods. 
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12 md:mt-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#08665F]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            Error: {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => {
                const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://images.unsplash.com/photo-1626200419188-f5628eb54a18?w=800&auto=format&fit=crop&q=80';
                
                return (
                  <div 
                    key={post.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img 
                        src={imageUrl} 
                        alt="Featured" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 
                        className="font-bold text-xl text-gray-900 leading-tight mb-3 group-hover:text-[#08665F] transition-colors"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      
                      <div 
                        className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                      />
                      
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[#08665F] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                          Read Article <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {posts.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No articles found.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
