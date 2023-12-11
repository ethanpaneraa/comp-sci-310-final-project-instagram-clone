import React from "react";
import { useEffect, useState } from "react";
import axios from "axios"; 


type Profile = {
    userid: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    bucketfolder: string;
    followers: number;
};

type Post = {
    postid: number;
    post_likes: number;
    bucketkey: string;
    firstname: string;
    lastname: string;
    username: string;
    followers: number;
    caption: string;
    comments: Comment[];

};

type Comment = {
    commentid: number;
    userid: number;
    comment: string;
    created_at: string;
}; 

type user = {
    username: string, 
    email: string, 
    lastname: string, 
    firstname: string, 
    password: string,
    userid: number, 
};

export default function Profile( { profileid }: { profileid: string} ) {
       
    console.log(profileid);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [user, setUser] = useState<user>({
        username: "", 
        email: "", 
        lastname: "", 
        firstname: "", 
        password: "",
        userid: 0,
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            const response = await axios.get(`http://localhost:3000/api/users/profile/info/${profileid}`);
            if (response.data.message === "success") {
                const fetchedProfile: Profile[] = response.data.data;
                console.log(fetchedProfile);
                if (fetchedProfile.length > 0) {
                    setProfile(fetchedProfile[0]);
                };
            };
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const fetchUserPost = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/users/profile/post/${profileid}`);
                if (response.data.message === "success") {
                    const fetchedPosts: Post[] = response.data.data;
                    await Promise.all((fetchedPosts.map(async (post) => {
                        try {
                            const imageResponse = await axios.get(
                                `http://localhost:3000/api/posts/image/${encodeURIComponent(post.bucketkey)}`,
                                { responseType: 'arraybuffer' }
                            );
                            post.bucketkey = `data:image/jpeg;base64,${Buffer.from(imageResponse.data, 'binary').toString('base64')}`;
                        } catch (error) {
                            console.error('Error fetching image for post:', post.postid, error);
                        };
                    })))
                    setPosts(fetchedPosts);
                    
                };
            } catch (error) {
                console.error("Error fetching profile:", error);
            };
        };
        fetchUserPost();
    }, []); 

    useEffect(() => {
        const userFromStorage = localStorage.getItem("user");
        if (userFromStorage) {
            const parsedUser = JSON.parse(userFromStorage);
            if (parsedUser && parsedUser.data) {
                setUser(parsedUser.data);
                console.log("user found in local storage:", parsedUser.data);
            }
        };
    }, []);

    const handleFollow = async () => {
        try {
            const response = await axios.put("http://localhost:3000/api/users/follow", {
                to: profileid,
                from: user.userid,  
            });
            if (response.data.message === "success") {
                const followedProfile = response.data.data;
                setProfile((profile) => {
                    if (profile) {
                        return {
                            ...profile,
                            followers: followedProfile.followers,
                        };
                    };
                    return profile;
                });
                alert("You are now following this user!");
            };
        } catch (error) {
            console.log("Error following user:", error);
        };
    };

    const handleUnfollow = async () => {
        try {
            const response = await axios.put("http://localhost:3000/api/users/unfollow", {
                to: profileid,
                from: user.userid,
            });
            if (response.data.message === "success") {
                const unfollowedProfile = response.data.data;
                setProfile((profile) => {
                    if (profile) {
                        return {
                            ...profile,
                            followers: unfollowedProfile.followers,
                        };
                    };
                    return profile;
                });
                alert("You are no longer following this user!");
            };
        } catch (error) {
            console.log("Error unfollowing user:", error);
        };
    };

    return (
        <div className="container mx-auto bg-white dark:bg-white">
            <div className="pt-[4rem]">
                {profile && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold text-black dark:text-black">{profile.username}</h2>
                            <p className="text-sm text-gray-600 text-black dark:text-black">{profile.firstname} {profile.lastname}</p>
                            <button onClick={handleFollow} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg mt-4">
                                {profile.userid === user.userid ? "" : "Follow"}
                            </button>
                            <button onClick={handleUnfollow} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg mt-4">
                                {profile.userid === user.userid ? "" : "Unfollow"}
                            </button>
                        </div>
                        <div className="flex justify-center items-center">
                            <div className="text-center px-4">
                                <span className="text-lg font-semibold text-black dark:text-black"><strong>{posts.length}</strong></span>
                                <p className="text-sm text-gray-600">Posts</p>
                            </div>
                            <div className="border-r-2 border-gray-300"></div>
                            <div className="text-center px-4">
                                <span className="text-lg font-semibold text-black dark:text-black"><strong>{profile.followers || 0}</strong></span>
                                <p className="text-sm text-gray-600">Followers</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {posts.map((post) => (
                    <div key={post.postid} className="bg-white border rounded-lg overflow-hidden">
                        <img src={post.bucketkey} alt="Post" className="w-full h-64 object-cover" />
                        <div className="p-4">
                            <div className="font-semibold mb-2">{post.username}</div>
                            <p className="text-sm text-gray-600 mb-2">{post.caption}</p>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{post.post_likes} likes</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};