import React from "react"; 
import { useState } from "react"; 
import axios from "axios";

export default function CreatePost() {
    const [image, setImage] = useState<File | null>(null);
    const [caption, setCaption] = useState("");
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          setImage(e.target.files[0]);
        }
    };

    const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCaption(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        if (!image) {
            alert("Please select an image to upload");
            setUploading(false);
            return;
        }

        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const userID = user.data.userid;
            console.log(userID);
            if (!userID) {
                alert("UserID not found");
                setUploading(false);
                return;
            }

            const formData = new FormData();
            formData.append("image", image);
            formData.append("caption", caption);
            formData.append("userid", userID.toString());

            const response = await axios.post("http://localhost:3000/api/posts/create", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(response.data);
            alert("Post created successfully");
            setCaption("");
            setImage(null);
            window.location.href = "/";

        } catch (err) {
            console.error("Error uploading image: ", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white max-w-md mx-auto my-10 bg-white dark:bg-white bg-white flex justify-center items-center min-h-screen">
            <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto my-10">
                <h2 className="text-2xl font-bold text-center text-gray-700">Create a New Post</h2>
                <div className="bg-white dark:bg-white">
                    <label htmlFor="image" className="block mb-2 text-sm font-medium text-gray-700">Upload Image</label>
                    <input type="file" id="image" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                </div>
                <div className="bg-white dark:bg-white">
                    <label htmlFor="caption" className="block mb-2 text-sm font-medium text-gray-700">Caption</label>
                    <input type="text" id="caption" value={caption} onChange={handleCaptionChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="Enter your caption" />
                </div>
                <button type="submit" disabled={uploading} className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-300">
                    {uploading ? 'Uploading...' : 'Upload Post'}
                </button>
            </form>
        </div>
    );
};
