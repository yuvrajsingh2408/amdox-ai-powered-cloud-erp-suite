import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, ArrowLeft, Loader2, Search, Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Article {
  id: string;
  category: string;
  title: string;
  content: string;
  views: number;
  bookmarks: number;
}

const KnowledgeBase: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const portalType = localStorage.getItem('portal_type');

  // Bookmarks state
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/portals/kb?category=${category}&search=${search}`);
      setArticles(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [category, search]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(portalType === 'CUSTOMER' ? '/portals/customer/dashboard' : '/portals/vendor/dashboard')} 
            className="p-1 hover:bg-slate-900 rounded text-slate-400"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5.5 w-5.5 text-indigo-400" />
              <span>Customer Help & Knowledge Base</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Search manuals, view corporate FAQs, and bookmark relevant articles.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-semibold ${!category ? 'text-indigo-400 border border-indigo-900/60' : 'text-slate-400'}`}
          >
            All Categories
          </button>
          <button
            onClick={() => setCategory('FAQ')}
            className={`px-3 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-semibold ${category === 'FAQ' ? 'text-indigo-400 border border-indigo-900/60' : 'text-slate-400'}`}
          >
            FAQs
          </button>
          <button
            onClick={() => setCategory('MANUAL')}
            className={`px-3 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg text-xs font-semibold ${category === 'MANUAL' ? 'text-indigo-400 border border-indigo-900/60' : 'text-slate-400'}`}
          >
            Manuals
          </button>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#0F172A] border border-slate-855 rounded-lg text-xs text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs">Indexing article libraries...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-slate-655 text-xs border border-dashed border-slate-850 rounded-2xl">
          No articles match your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {articles.map((art) => (
            <div key={art.id} className="p-5 bg-[#0F172A] border border-slate-900 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{art.category}</span>
                  <button
                    onClick={() => toggleFavorite(art.id)}
                    className="p-1 text-slate-500 hover:text-yellow-500 transition-colors"
                  >
                    <Star className={`h-4 w-4 ${favorites[art.id] ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-200">{art.title}</h3>
                <p className="text-slate-400 leading-relaxed text-[11px]">{art.content}</p>
              </div>

              <div className="flex items-center gap-4 text-[9px] text-slate-500 pt-3 border-t border-slate-900/60 font-medium">
                <span>Views: {art.views}</span>
                <span>Bookmarks: {art.bookmarks + (favorites[art.id] ? 1 : 0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default KnowledgeBase;
export { KnowledgeBase };
