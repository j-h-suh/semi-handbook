'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, type Post, type Comment } from '@/lib/supabase';
import { MessageSquarePlus, X, Send, Clock, Tag, Pencil, Trash2, MessageCircle } from 'lucide-react';

const CATEGORIES = ['전체', '질문', '수정요청', '자유'] as const;
const WRITE_CATEGORIES = ['질문', '수정요청', '자유'] as const;

// Simple SHA-256 hash
async function hashPassword(pw: string): Promise<string> {
    const data = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function BoardClient() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>('전체');
    const [showWrite, setShowWrite] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Write/Edit form
    const [form, setForm] = useState({ nickname: '', category: '자유', title: '', content: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    // Password prompt for edit/delete
    const [pwPrompt, setPwPrompt] = useState<{ action: 'edit' | 'delete'; post: Post } | null>(null);
    const [pwInput, setPwInput] = useState('');
    const [pwError, setPwError] = useState('');

    // Comments
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentForm, setCommentForm] = useState({ nickname: '', content: '', password: '' });
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const commentGuard = useRef(false);

    // Comment password prompt
    const [commentPwPrompt, setCommentPwPrompt] = useState<{ action: 'edit' | 'delete'; comment: Comment } | null>(null);
    const [commentPwInput, setCommentPwInput] = useState('');
    const [commentPwError, setCommentPwError] = useState('');
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (activeCategory !== '전체') {
            query = query.eq('category', activeCategory);
        }
        const { data } = await query;
        setPosts(data ?? []);

        // Fetch comment counts
        if (data && data.length > 0) {
            const ids = data.map((p: Post) => p.id);
            const { data: counts } = await supabase
                .from('comments')
                .select('post_id')
                .in('post_id', ids);
            const countMap: Record<number, number> = {};
            (counts ?? []).forEach((c: { post_id: number }) => {
                countMap[c.post_id] = (countMap[c.post_id] || 0) + 1;
            });
            setCommentCounts(countMap);
        }
        setLoading(false);
    }, [activeCategory]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    // Fetch comments when a post is selected
    useEffect(() => {
        if (!selectedPost) { setComments([]); return; }
        supabase.from('comments').select('*').eq('post_id', selectedPost.id).order('created_at', { ascending: true })
            .then(({ data }) => setComments(data ?? []));
    }, [selectedPost]);

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim() || !form.password.trim()) return;
        setSubmitting(true);
        const pw_hash = await hashPassword(form.password);

        if (editingPost) {
            // Update existing post
            await supabase.from('posts').update({
                nickname: form.nickname.trim() || '익명',
                category: form.category,
                title: form.title.trim(),
                content: form.content.trim(),
            }).eq('id', editingPost.id).eq('password_hash', pw_hash);
        } else {
            // Insert new post
            await supabase.from('posts').insert({
                nickname: form.nickname.trim() || '익명',
                category: form.category,
                title: form.title.trim(),
                content: form.content.trim(),
                password_hash: pw_hash,
            });
        }
        setForm({ nickname: '', category: '자유', title: '', content: '', password: '' });
        setShowWrite(false);
        setEditingPost(null);
        setSubmitting(false);
        fetchPosts();
    };

    const handlePasswordAction = async () => {
        if (!pwPrompt || !pwInput.trim()) return;
        const pw_hash = await hashPassword(pwInput);

        if (pw_hash !== pwPrompt.post.password_hash) {
            setPwError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (pwPrompt.action === 'delete') {
            await supabase.from('posts').delete().eq('id', pwPrompt.post.id).eq('password_hash', pw_hash);
            setSelectedPost(null);
            fetchPosts();
        } else {
            // Open edit form
            setForm({
                nickname: pwPrompt.post.nickname,
                category: pwPrompt.post.category,
                title: pwPrompt.post.title,
                content: pwPrompt.post.content,
                password: pwInput,
            });
            setEditingPost(pwPrompt.post);
            setSelectedPost(null);
            setShowWrite(true);
        }
        setPwPrompt(null);
        setPwInput('');
        setPwError('');
    };

    const handleCommentSubmit = async () => {
        if (!selectedPost || !commentForm.content.trim() || !commentForm.password.trim() || commentGuard.current) return;
        commentGuard.current = true;
        setCommentSubmitting(true);
        const pw_hash = await hashPassword(commentForm.password);
        await supabase.from('comments').insert({
            post_id: selectedPost.id,
            nickname: commentForm.nickname.trim() || '익명',
            content: commentForm.content.trim(),
            password_hash: pw_hash,
        });
        setCommentForm({ nickname: '', content: '', password: '' });
        const { data } = await supabase.from('comments').select('*').eq('post_id', selectedPost.id).order('created_at', { ascending: true });
        setComments(data ?? []);
        setCommentSubmitting(false);
        commentGuard.current = false;
    };

    const handleCommentPwAction = async () => {
        if (!commentPwPrompt || !commentPwInput.trim()) return;
        const pw_hash = await hashPassword(commentPwInput);
        if (pw_hash !== commentPwPrompt.comment.password_hash) {
            setCommentPwError('비밀번호가 일치하지 않습니다.');
            return;
        }
        if (commentPwPrompt.action === 'delete') {
            await supabase.from('comments').delete().eq('id', commentPwPrompt.comment.id);
        } else {
            setEditingComment(commentPwPrompt.comment);
            setEditCommentContent(commentPwPrompt.comment.content);
        }
        setCommentPwPrompt(null);
        setCommentPwInput('');
        setCommentPwError('');
        if (commentPwPrompt.action === 'delete' && selectedPost) {
            const { data } = await supabase.from('comments').select('*').eq('post_id', selectedPost.id).order('created_at', { ascending: true });
            setComments(data ?? []);
        }
    };

    const handleCommentEditSave = async () => {
        if (!editingComment || !editCommentContent.trim() || !selectedPost) return;
        await supabase.from('comments').update({ content: editCommentContent.trim() }).eq('id', editingComment.id);
        setEditingComment(null);
        setEditCommentContent('');
        const { data } = await supabase.from('comments').select('*').eq('post_id', selectedPost.id).order('created_at', { ascending: true });
        setComments(data ?? []);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const hours = d.getHours().toString().padStart(2, '0');
        const mins = d.getMinutes().toString().padStart(2, '0');
        return `${month}/${day} ${hours}:${mins}`;
    };

    const categoryColor = (cat: string) => {
        switch (cat) {
            case '질문': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case '수정요청': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-400 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full px-8 py-12 lg:px-12">
            <header className="mb-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                            게시판
                        </h1>
                        <p className="mt-3 text-sm text-slate-500">
                            질문, 수정 요청, 자유 의견을 남겨주세요.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditingPost(null); setForm({ nickname: '', category: '자유', title: '', content: '', password: '' }); setShowWrite(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-xl hover:bg-cyan-500/25 transition-colors cursor-pointer"
                    >
                        <MessageSquarePlus size={16} />
                        글쓰기
                    </button>
                </div>
            </header>

            {/* Category filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                            activeCategory === cat
                                ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 font-medium'
                                : 'bg-white/3 border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Posts list */}
            {loading ? (
                <div className="py-12 text-center text-sm text-slate-600">불러오는 중...</div>
            ) : posts.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-600">
                    아직 글이 없습니다. 첫 번째 글을 작성해보세요!
                </div>
            ) : (
                <div className="space-y-2">
                    {posts.map(post => (
                        <button
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            className="w-full text-left px-5 py-4 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[11px] px-2 py-0.5 rounded-md border ${categoryColor(post.category)}`}>
                                    {post.category}
                                </span>
                                <span className="text-base font-medium text-slate-200 line-clamp-1">{post.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <span>{post.nickname}</span>
                                <span className="flex items-center gap-1"><Clock size={11} />{formatDate(post.created_at)}</span>
                                {(commentCounts[post.id] ?? 0) > 0 && (
                                    <span className="flex items-center gap-1 text-cyan-600">
                                        <MessageCircle size={11} />{commentCounts[post.id]}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Post detail modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={() => setSelectedPost(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg mx-4 bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 cursor-pointer">
                            <X size={18} />
                        </button>
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-[11px] px-2 py-0.5 rounded-md border ${categoryColor(selectedPost.category)}`}>
                                {selectedPost.category}
                            </span>
                            <span className="text-xs text-slate-600">{selectedPost.nickname} · {formatDate(selectedPost.created_at)}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white mb-4">{selectedPost.title}</h2>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-4">{selectedPost.content}</p>

                        {/* Comments section */}
                        <div className="border-t border-white/5 pt-4 mb-4">
                            <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-3">
                                <MessageCircle size={13} />댓글 {comments.length > 0 && `(${comments.length})`}
                            </h3>
                            {comments.length > 0 && (
                                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
                                    {comments.map(c => (
                                        <div key={c.id} className="text-xs bg-white/3 rounded-lg px-3 py-2 group">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-medium text-slate-300">{c.nickname}</span>
                                                <span className="text-slate-700">{formatDate(c.created_at)}</span>
                                                <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                                    <button onClick={() => { setCommentPwPrompt({ action: 'edit', comment: c }); setCommentPwInput(''); setCommentPwError(''); }} className="text-slate-600 hover:text-slate-400 cursor-pointer"><Pencil size={10} /></button>
                                                    <button onClick={() => { setCommentPwPrompt({ action: 'delete', comment: c }); setCommentPwInput(''); setCommentPwError(''); }} className="text-slate-600 hover:text-rose-400 cursor-pointer"><Trash2 size={10} /></button>
                                                </div>
                                            </div>
                                            {editingComment?.id === c.id ? (
                                                <div className="flex gap-1 mt-1">
                                                    <input value={editCommentContent} onChange={e => setEditCommentContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCommentEditSave()} className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-slate-200 focus:outline-none" autoFocus />
                                                    <button onClick={handleCommentEditSave} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded text-[10px] cursor-pointer">저장</button>
                                                    <button onClick={() => setEditingComment(null)} className="px-2 py-1 bg-white/5 text-slate-500 rounded text-[10px] cursor-pointer">취소</button>
                                                </div>
                                            ) : (
                                                <p className="text-slate-400">{c.content}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="닉네임"
                                    value={commentForm.nickname}
                                    onChange={e => setCommentForm(f => ({ ...f, nickname: e.target.value }))}
                                    className="w-20 px-2 py-1.5 bg-white/5 border border-white/8 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30"
                                />
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={commentForm.password}
                                    onChange={e => setCommentForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-20 px-2 py-1.5 bg-white/5 border border-white/8 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30"
                                />
                                <input
                                    type="text"
                                    placeholder="댓글 입력..."
                                    value={commentForm.content}
                                    onChange={e => setCommentForm(f => ({ ...f, content: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && handleCommentSubmit()}
                                    className="flex-1 px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30"
                                />
                                <button
                                    onClick={handleCommentSubmit}
                                    disabled={!commentForm.content.trim() || !commentForm.password.trim() || commentSubmitting}
                                    className="px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/20 disabled:opacity-30 transition-colors cursor-pointer"
                                >
                                    <Send size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Edit / Delete buttons */}
                        <div className="flex gap-2 justify-end border-t border-white/5 pt-4">
                            <button
                                onClick={() => { setPwPrompt({ action: 'edit', post: selectedPost }); setPwInput(''); setPwError(''); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg transition-colors cursor-pointer"
                            >
                                <Pencil size={12} />수정
                            </button>
                            <button
                                onClick={() => { setPwPrompt({ action: 'delete', post: selectedPost }); setPwInput(''); setPwError(''); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-lg transition-colors cursor-pointer"
                            >
                                <Trash2 size={12} />삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password prompt modal */}
            {pwPrompt && (
                <div className="fixed inset-0 z-[95] flex items-center justify-center" onClick={() => setPwPrompt(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-xs mx-4 bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-sm font-bold text-white mb-3">
                            {pwPrompt.action === 'delete' ? '삭제' : '수정'} 비밀번호 확인
                        </h3>
                        <input
                            type="password"
                            placeholder="비밀번호 입력"
                            value={pwInput}
                            onChange={e => { setPwInput(e.target.value); setPwError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handlePasswordAction()}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 mb-2"
                            autoFocus
                        />
                        {pwError && <p className="text-xs text-rose-400 mb-2">{pwError}</p>}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPwPrompt(null)}
                                className="flex-1 px-3 py-2 text-xs text-slate-400 bg-white/5 border border-white/8 rounded-lg cursor-pointer"
                            >
                                취소
                            </button>
                            <button
                                onClick={handlePasswordAction}
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer ${
                                    pwPrompt.action === 'delete'
                                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                                        : 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                                }`}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comment password prompt modal */}
            {commentPwPrompt && (
                <div className="fixed inset-0 z-[95] flex items-center justify-center" onClick={() => setCommentPwPrompt(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-xs mx-4 bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-sm font-bold text-white mb-3">
                            댓글 {commentPwPrompt.action === 'delete' ? '삭제' : '수정'} 비밀번호 확인
                        </h3>
                        <input
                            type="password"
                            placeholder="비밀번호 입력"
                            value={commentPwInput}
                            onChange={e => { setCommentPwInput(e.target.value); setCommentPwError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleCommentPwAction()}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 mb-2"
                            autoFocus
                        />
                        {commentPwError && <p className="text-xs text-rose-400 mb-2">{commentPwError}</p>}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCommentPwPrompt(null)}
                                className="flex-1 px-3 py-2 text-xs text-slate-400 bg-white/5 border border-white/8 rounded-lg cursor-pointer"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleCommentPwAction}
                                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer ${
                                    commentPwPrompt.action === 'delete'
                                        ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                                        : 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                                }`}
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Write/Edit modal */}
            {showWrite && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={() => { setShowWrite(false); setEditingPost(null); }}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-lg mx-4 bg-[#0f1729] border border-white/10 rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setShowWrite(false); setEditingPost(null); }} className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 cursor-pointer">
                            <X size={18} />
                        </button>
                        <h2 className="text-lg font-bold text-white mb-5">{editingPost ? '수정하기' : '글쓰기'}</h2>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="닉네임 (비워두면 '익명')"
                                value={form.nickname}
                                onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
                            />
                            <div className="flex gap-2">
                                {WRITE_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setForm(f => ({ ...f, category: cat }))}
                                        className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                                            form.category === cat
                                                ? categoryColor(cat) + ' font-medium'
                                                : 'bg-white/3 border-white/8 text-slate-500 hover:text-slate-300'
                                        }`}
                                    >
                                        <Tag size={11} />{cat}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="제목"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
                            />
                            <textarea
                                placeholder="내용"
                                rows={5}
                                value={form.content}
                                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 resize-none"
                            />
                            {!editingPost && (
                                <input
                                    type="password"
                                    placeholder="비밀번호 (수정/삭제 시 필요)"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40"
                                />
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={!form.title.trim() || !form.content.trim() || (!editingPost && !form.password.trim()) || submitting}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-xl hover:bg-cyan-500/25 disabled:opacity-40 disabled:cursor-default transition-colors cursor-pointer"
                            >
                                <Send size={14} />
                                {submitting ? '등록 중...' : editingPost ? '수정 완료' : '등록'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
