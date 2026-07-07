import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACCENT = "#08665F";

const DEMO_POSTS = [
  {
    id: 1,
    title: "The Secret to Perfect Homemade Pickles",
    excerpt: "Discover the age-old techniques we use in our Agraharam kitchen to lock in the authentic taste of tradition.",
    
    
  
    
    imageUrl: "https://images.unsplash.com/photo-1626200419188-f5628eb54a18?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    title: "Why Sun-Drying Spices Makes All the Difference",
    excerpt: "Before the grinding begins, our spices spend days under the warm sun. Here's why this natural process is crucial for flavour.",
   
    
    imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    title: "5 Traditional Snacks for Your Evening Tea",
    excerpt: "Elevate your teatime with these classic, crunchy Kondattam and savory bites straight from our ancestral recipes.",
    
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
  }
];

export default function BlogPage() {
  const navigate = useNavigate();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DEMO_POSTS.map(post => (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                />
              </div>
              
              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                
                <h3 className="font-bold text-xl text-gray-900 leading-tight mb-3 group-hover:text-[#08665F] transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  
                  <button className="text-[#08665F] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Placeholder for Pagination or More Posts */}
        <div className="mt-16 flex justify-center">
          <Button variant="outline" className="font-semibold px-8 py-6 rounded-xl border-gray-200 text-gray-600 hover:text-[#08665F] hover:bg-gray-50 hover:border-gray-300">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
}
