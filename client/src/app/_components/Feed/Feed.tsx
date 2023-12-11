import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';


interface Post {
    postid: number;
    assetid: number;
    userid: number;
    username: string;
    likes: number;
    caption: string;
    created_at: string;
    bucketkey: string;
    imageUrl?: string;
    comments: Comment[];
};

interface Comment {
    userid: number;
    comment: string;
    username: string;
    commentid: number;
    created_at: string;
}

type user = {
    username: string, 
    email: string, 
    lastname: string, 
    firstname: string, 
    password: string,
    userid: number, 
};

export default function Feed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [comment, setComment] = useState<string>(""); 
    const [showCommentBox, setShowCommentBox] = useState<Record<number, boolean>>({});
    const [user, setUser] = useState<user>({
        username: "", 
        email: "", 
        lastname: "", 
        firstname: "", 
        password: "",
        userid: 0,
    }); 

    useEffect(() => {
        const userFromStorage = localStorage.getItem("user");
        if (userFromStorage) {
            const user = JSON.parse(userFromStorage);
            setUser(user.data);
            console.log(user.data); 
        }; 
    }, [user.userid]);
  
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/posts');
                if (response.data.message === 'success') {
                    let fetchedPosts: Post[] = response.data.data;
    
                    // Correctly handle comments parsing
                    fetchedPosts = fetchedPosts.map(post => ({
                        ...post,
                        comments: typeof post.comments === "string" ? JSON.parse(post.comments) : post.comments
                    }));
    
                    // Fetch images for each post
                    const postsWithImages = await Promise.all(
                        fetchedPosts.map(async post => {
                            try {
                                const imageResponse = await axios.get(`http://localhost:3000/api/posts/image/${encodeURIComponent(post.bucketkey)}`,
                                    { responseType: 'arraybuffer' });
                                const imageUrl = `data:image/jpeg;base64,${Buffer.from(imageResponse.data, 'binary').toString('base64')}`;
                                return { ...post, imageUrl }; // Return modified post
                            } catch (error) {
                                console.error('Error fetching image for post:', post.postid, error);
                                return post; // Return original post in case of error
                            }
                        })
                    );
    
                    console.log('fetchedPosts after image assignment:', postsWithImages);
                    setPosts(postsWithImages);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            }
        };
        fetchPosts();
    }, []);
    

    const handleLike = async (posted: number) => {
        try {
            const response = await axios.put("http://localhost:3000/api/posts/like", {
                postid: posted,
            });
            if (response.data.message === 'success') {
                const likedPost = response.data.data;
                setPosts((posts) => {
                    return posts.map((post) => {
                        if (post.postid === likedPost.postid) {
                            return likedPost;
                        }
                        return post;
                    });
                });
                alert('Post liked successfully');
                window.location.reload(); 
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleCommentSubmit = async (postid: number) => {
        try {
            const response = await axios.post("http://localhost:3000/api/posts/comment", {
                comment: comment,
                userid: user.userid,
                postid: postid, 
                username: user.username,
            });
            if (response) {
                alert('Comment posted successfully');
                window.location.reload();
            };
        } catch (error) {
            console.log('Error commenting on post:', error)
        }
    };

    const toggleCommentBox = (postid: number) => {
        setShowCommentBox((showCommentBox) => {
            return {
                ...showCommentBox,
                [postid]: !showCommentBox[postid],
            };
        });
    };

    return (
        <div className='container mx-auto p-4 mt-20 bg-white dark:bg-white'>
            {posts.map((post) => (
                <div key={post.postid} className="bg-white border rounded-sm max-w-md mx-auto mb-4 dark:bg-white bg-white">
                    <div className="px-4 py-3">
                        <div className="ml-3">
                        <span className="text-sm font-semibold antialiased block leading-tight">{post.caption}</span>
                        <span className="text-gray-600 text-xs block"> <Link href={`/${post.userid}`}><strong>{post.username}</strong></Link>  {new Date(post.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                    {post.imageUrl && <img src={post.imageUrl} alt={post.caption} className='w-full' />}
                    <div className="px-4 py-3">
                        <div className="font-semibold text-sm dark:text-black text-black">{post.caption}</div>
                        </div>
                    <div className="flex items-center justify-between mx-4 mt-3 mb-2">
                        <div className="flex gap-5">
                        <svg onClick={() => {handleLike(post.postid)}} fill="#262626" height="50" viewBox="0 0 48 48" width="50">
                        <svg fill="#262626" height="50" viewBox="0 0 48 48" width="24"><path d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"></path></svg>
                        </svg>
                        <svg onClick={() => toggleCommentBox(post.postid)}  fill="#262626" height="50" viewBox="0 0 48 48" width="50">
                        <svg fill="#262626" height="50" viewBox="0 0 48 48" width="24"><path clipRule="evenodd" d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z" fillRule="evenodd"></path></svg>
                        </svg>
                        </div>
                    </div>
                    <div className='px-4 py-3'>
                        <div className="font-semibold text-sm dark:text-black text-black">Comments</div>
                        {post.comments && post.comments.map((comment) => (
                            <div key={comment.commentid} className="flex items-center justify-between mx-4 mt-3 mb-2">
                                <div className="flex gap-5">
                                    <div className="font-semibold text-sm dark:text-black text-black">{comment.username}</div>
                                    <div className="font-semibold text-sm dark:text-black text-black">{comment.comment}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {showCommentBox[post.postid] && (
                        <div className="px-4 pb-4 text-black dark:text-black">
                            <input 
                                type="text" 
                                value={comment} 
                                onChange={(e) => setComment(e.target.value)}
                                className="border rounded-sm p-2 w-full"
                                placeholder="Add a comment..."
                            />
                            <button 
                                onClick={() => handleCommentSubmit(post.postid)}
                                className="bg-blue-500 text-white rounded-sm p-2 mt-2"
                            >
                                Post Comment
                            </button>
                        </div>
                    )}
                    <div className="font-semibold text-sm mx-4 mt-2 mb-4 dark:text-black text-black">{post.likes} likes</div>
                </div>
            ))}
        </div>
    );
}

