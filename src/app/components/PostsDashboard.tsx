import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Send, Image as ImageIcon, Heart, MessageCircle, X, ArrowLeft, Search, 
  Car, Utensils, CheckCircle, Hash, Trash2, MapPin, Navigation
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { Post } from '../types';
import { ActiveMeetupSession } from './ActiveMeetupSession';

// Random Colors for Tags
const TAG_COLORS = [
  'bg-red-50 text-red-600 border-red-100', 
  'bg-blue-50 text-blue-600 border-blue-100', 
  'bg-green-50 text-green-600 border-green-100', 
  'bg-purple-50 text-purple-600 border-purple-100', 
  'bg-orange-50 text-orange-600 border-orange-100',
];
const getRandomColor = () => TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

interface PostsDashboardProps {
    onBack: () => void;
}

export function PostsDashboard({ onBack }: PostsDashboardProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMeetupId, setActiveMeetupId] = useState<string | null>(null);
  
  // --- Form State ---
  const [activeCategory, setActiveCategory] = useState<'general' | 'travel' | 'food' | 'errand'>('general');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Tags
  const [tagName, setTagName] = useState('');
  const [tags, setTags] = useState<{ name: string; color: string }[]>([]);

  // Category Specific Inputs
  const [tripOrigin, setTripOrigin] = useState('GEC Campus');
  const [tripDest, setTripDest] = useState('');
  const [tripTime, setTripTime] = useState('');
  const [tripMode, setTripMode] = useState<'car' | 'bike'>('car');
  const [seats, setSeats] = useState(3);
  const [restaurant, setRestaurant] = useState('');
  const [deadline, setDeadline] = useState('');

  // View State
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  useEffect(() => {
    fetchPosts();
    // Realtime Subscription
    const channel = supabase.channel('public:posts_unified')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, fetchPosts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

 const fetchPosts = async () => {
    console.log("🔍 Attempting to fetch posts...");

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *, 
        profiles(full_name, email), 
        likes(user_id), 
        comments(id, user_id, content, created_at, profiles(full_name))
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error("❌ FETCH ERROR:", error);
        alert(`Error fetching posts: ${error.message}`);
    } else {
        console.log("✅ Posts fetched successfully:", data);
        setPosts(data as unknown as Post[]);
    }
  };

  // --- Handlers ---

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addTag = () => {
    if (tagName.trim() && tags.length < 5) {
      setTags([...tags, { name: tagName.trim(), color: getRandomColor() }]);
      setTagName('');
    }
  };

  const handleSubmit = async () => {
    if (!session) return;
    setLoading(true);

    try {
      let imageUrl = null;
      
      // 1. Upload Image (If selected)
      if (selectedImage) {
        const fileName = `${Math.random()}.${selectedImage.name.split('.').pop()}`;
        const filePath = `${session.user.id}/${fileName}`;
        
        await supabase.storage.from('post_images').upload(filePath, selectedImage);
        const { data } = supabase.storage.from('post_images').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // 2. Prepare Tags
      let finalTags = tags.map(t => t.name);
      if (tagName.trim()) finalTags.push(tagName.trim());

      // 3. Prepare Data Object
      const postData: any = {
        user_id: session.user.id,
        content,
        category: activeCategory,
        image_url: imageUrl,
        tags: finalTags,
      };

      // Add category specifics
      if (activeCategory === 'travel') {
        postData.trip_origin = tripOrigin;
        postData.trip_destination = tripDest;
        postData.trip_datetime = tripTime; 
        postData.trip_mode = tripMode;
        postData.seats_available = seats;
      } else if (activeCategory === 'food') {
        postData.restaurant_name = restaurant;
        postData.order_deadline = deadline;
      } else if (activeCategory === 'errand') {
        postData.status = 'open';
      }

      // 4. Insert to Database
      const { error } = await supabase.from('posts').insert(postData);
      if (error) throw error;

      // 5. Reset Form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setTags([]);
      setTripDest('');
      setRestaurant('');
      
    } catch (e) {
      console.error(e);
      alert('Failed to post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if(window.confirm("Delete this post?")) await supabase.from('posts').delete().eq('id', postId);
  };

  const handleLike = async (postId: string) => {
    if (!session) return;
    const post = posts.find(p => p.id === postId);
    const liked = post?.likes?.some((l: any) => l.user_id === session.user.id);
    
    // Toggle Logic
    if (liked) {
        await supabase.from('likes').delete().match({ user_id: session.user.id, post_id: postId });
    } else {
        await supabase.from('likes').insert({ user_id: session.user.id, post_id: postId });
    }
  };

  const handleCommentSubmit = async (postId: string) => {
      if (!commentText.trim() || !session) return;
      await supabase.from('comments').insert({ user_id: session.user.id, post_id: postId, content: commentText });
      setCommentText('');
  };

  // --- Meetup / Interaction Logic ---
  const handleJoinRide = async (post: Post) => {
      if((post.seats_available || 0) <= 0) return;
      if(!window.confirm("Request to join?")) return;
      await supabase.from('posts').update({ seats_available: (post.seats_available || 1) - 1 }).eq('id', post.id);
      await supabase.from('comments').insert({ post_id: post.id, user_id: session.user.id, content: `🚗 I'm joining this ride! (Seat booked)` });
  };

  const handleAcceptErrand = async (post: Post) => {
      if(!window.confirm("Accept this task?")) return;
      await supabase.from('posts').update({ status: 'in_progress', accepted_by: session.user.id }).eq('id', post.id);
      await supabase.from('comments').insert({ post_id: post.id, user_id: session.user.id, content: `✅ I've accepted this request!` });
  };

  const handleShareLocation = async (postId: string, guestId: string) => {
    if (!window.confirm("Share your LIVE location?")) return;
    const { data } = await supabase.from('meetups').insert({
        post_id: postId,
        host_id: session.user.id,
        guest_id: guestId,
        is_active: true
    }).select().single();

    if (data) {
        await supabase.from('comments').insert({
            post_id: postId,
            user_id: session.user.id,
            content: `📍 LIVE LOCATION SHARED. [MEETUP_ID:${data.id}]` 
        });
        setActiveMeetupId(data.id);
    }
  };

  const handleJoinMeetup = (content: string) => {
    const match = content.match(/\[MEETUP_ID:(.*?)\]/);
    if (match && match[1]) setActiveMeetupId(match[1]);
  };

  // Search Filter
  const filteredPosts = posts.filter(post => {
      const matchesSearch = searchQuery === '' || 
          post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags?.some((t: any) => (typeof t === 'string' ? t : t.name).toLowerCase().includes(searchQuery.toLowerCase())) ||
          post.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'general' ? true : post.category === activeCategory;
      return matchesSearch && matchesCategory; 
  });

  return (
    <div className="h-full bg-slate-50 flex flex-col relative">
      {/* Live Meetup Overlay */}
      {activeMeetupId && session && (
        <ActiveMeetupSession session={session} meetupId={activeMeetupId} onClose={() => setActiveMeetupId(null)} />
      )}

      {/* Header */}
      <div className="bg-white px-4 py-3 border-b sticky top-0 z-20 space-y-3 shadow-sm">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <h1 className="font-bold text-slate-800 text-lg">Community</h1>
        </div>
        <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2">
            <Search size={16} className="text-slate-400 mr-2"/>
            <input 
                className="bg-transparent text-sm outline-none flex-1 placeholder:text-slate-400"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* POST CREATOR BOX */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
            {/* Category Tabs */}
            <div className="flex border-b bg-slate-50 mb-2 rounded-t-xl overflow-hidden">
                {[{ id: 'general', label: 'Post', icon: MessageCircle }, { id: 'travel', label: 'Ride', icon: Car }, { id: 'food', label: 'Food', icon: Utensils }, { id: 'errand', label: 'Task', icon: CheckCircle }].map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id as any)} className={`flex-1 py-2 text-xs font-bold flex flex-col items-center gap-1 ${activeCategory === cat.id ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}>
                    <cat.icon size={16} /> {cat.label}
                </button>
                ))}
            </div>
            
            {/* Dynamic Inputs based on Category */}
            {activeCategory === 'travel' && (
                <div className="grid grid-cols-2 gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <input className="text-sm p-2 rounded border outline-none" placeholder="From" value={tripOrigin} onChange={e => setTripOrigin(e.target.value)} />
                    <input className="text-sm p-2 rounded border outline-none" placeholder="To" value={tripDest} onChange={e => setTripDest(e.target.value)} />
                    <input type="datetime-local" className="text-sm p-2 rounded border outline-none" value={tripTime} onChange={e => setTripTime(e.target.value)} />
                    <select className="text-sm p-2 rounded border outline-none bg-white" value={tripMode} onChange={e => setTripMode(e.target.value as any)}>
                        <option value="car">Car</option><option value="bike">Bike</option>
                    </select>
                </div>
            )}
            {activeCategory === 'food' && (
                 <div className="flex gap-2 bg-orange-50 p-3 rounded-xl border border-orange-100 items-center">
                    <Utensils size={16} className="text-orange-500"/>
                    <input className="flex-1 text-sm bg-transparent outline-none text-orange-800" placeholder="Restaurant Name?" value={restaurant} onChange={e => setRestaurant(e.target.value)} />
                    <input type="time" className="text-sm outline-none w-20 bg-white rounded p-1" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>
            )}

            {/* Text Input */}
            <textarea className="w-full text-sm outline-none resize-none placeholder:text-slate-400 min-h-[80px]" rows={3} placeholder="What's happening?" value={content} onChange={e => setContent(e.target.value)} />
            
            {/* Tag List Display */}
            {tags.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                    {tags.map((t, i) => <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full ${t.color} flex items-center gap-1`}>#{t.name} <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))}><X size={10}/></button></span>)}
                </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
                <div className="relative mb-2">
                    <img src={imagePreview} className="w-full h-32 object-cover rounded-lg border border-slate-100" />
                    <button onClick={() => {setSelectedImage(null); setImagePreview(null);}} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12}/></button>
                </div>
            )}
            
            {/* Bottom Toolbar */}
            <div className="flex justify-between items-center pt-3 border-t">
                <div className="flex items-center gap-2">
                     <button onClick={() => fileInputRef.current?.click()} className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-slate-50"><ImageIcon size={20}/></button>
                     <input type="file" ref={fileInputRef} onChange={handleImageSelect} hidden accept="image/*"/>
                     
                     <div className="flex items-center gap-1 bg-slate-50 rounded-full px-3 py-1.5 border border-slate-200">
                          <Hash size={14} className="text-slate-400"/>
                          <input className="bg-transparent text-xs outline-none w-20" placeholder="Add tag..." value={tagName} onChange={e => setTagName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} />
                          {tagName && <button onClick={addTag}><Send size={12} className="text-blue-500"/></button>}
                     </div>
                </div>
                
                {/* BLUE BUTTON */}
                <Button size="sm" onClick={handleSubmit} disabled={loading || !content.trim()} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95">
                    {loading ? 'Posting...' : 'Post'}
                </Button>
            </div>
        </div>

        {/* FEED */}
        <div className="space-y-4 pb-20">
            {filteredPosts.map(post => {
                const isOwner = session?.user?.id === post.user_id;
                return (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                    {/* Category Stripes */}
                    {post.category === 'travel' && <div className="bg-blue-500 h-1 w-full"></div>}
                    {post.category === 'food' && <div className="bg-orange-500 h-1 w-full"></div>}
                    {post.category === 'errand' && <div className="bg-emerald-500 h-1 w-full"></div>}

                    <div className="p-4">
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600 border border-slate-200 shadow-sm">{post.profiles?.full_name?.[0] || 'U'}</div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-slate-900">{post.profiles?.full_name}</p>
                                    {isOwner && <button onClick={() => handleDelete(post.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={14}/></button>}
                                </div>
                                <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                            </div>
                        </div>

                        {/* Travel Details */}
                        {post.category === 'travel' && (
                             <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg mb-3 border border-blue-100 text-xs font-medium text-blue-700">
                                <Car size={14}/> <span>{post.trip_origin}</span> → <span>{post.trip_destination}</span>
                             </div>
                        )}

                        {/* Content */}
                        <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">{post.content}</p>
                        {post.image_url && <img src={post.image_url} className="w-full rounded-xl mb-3 max-h-72 object-cover shadow-sm" />}
                        
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {post.tags.map((t: any, i: number) => <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">#{typeof t === 'string' ? t : t.name}</span>)}
                            </div>
                        )}
                        
                        {/* Interactions */}
                        <div className="flex items-center gap-6 text-slate-400 text-sm pt-3 border-t">
                             <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 transition-colors ${post.likes?.some((l:any) => l.user_id === session?.user?.id) ? 'text-pink-500' : 'hover:text-pink-500'}`}>
                                <Heart size={18} className={post.likes?.some((l:any) => l.user_id === session?.user?.id) ? 'fill-current' : ''}/> {post.likes?.length || 0}
                             </button>
                             <button onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className={`flex items-center gap-1.5 transition-colors ${expandedPostId === post.id ? 'text-blue-500' : 'hover:text-blue-500'}`}>
                                <MessageCircle size={18} className={expandedPostId === post.id ? 'fill-current' : ''}/> {post.comments?.length || 0}
                             </button>
                        </div>
                    </div>
                    
                    {/* Comments */}
                    {expandedPostId === post.id && (
                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100">
                            <div className="space-y-2.5 mb-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {post.comments?.map((c:any) => (
                                    <div key={c.id} className="flex justify-between items-start bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex-1">
                                            <span className="font-bold text-xs text-slate-700 block mb-0.5">{c.profiles?.full_name}</span>
                                            {c.content.includes('[MEETUP_ID:') ? (
                                                <button onClick={() => handleJoinMeetup(c.content)} className="mt-1 flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-blue-100 hover:bg-blue-100 transition-all animate-pulse">
                                                    <Navigation size={12} className="fill-current"/> TRACK LIVE LOCATION
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-600">{c.content}</span>
                                            )}
                                        </div>
                                        {isOwner && c.user_id !== session.user.id && !c.content.includes('[MEETUP_ID:') && (
                                            <button onClick={() => handleShareLocation(post.id, c.user_id)} className="ml-2 text-slate-300 hover:text-green-500 p-1.5 hover:bg-green-50 rounded-full transition-all">
                                                <MapPin size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 items-center bg-white p-1 rounded-full border border-slate-200 pl-3">
                                <input className="flex-1 text-xs outline-none bg-transparent" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)} />
                                <button onClick={() => handleCommentSubmit(post.id)} disabled={!commentText.trim()} className="text-blue-500 p-1.5 rounded-full hover:bg-blue-50 disabled:opacity-50"><Send size={16} className="fill-current"/></button>
                            </div>
                        </div>
                    )}
                </div>
            )})}
        </div>
      </div>
    </div>
  );
}