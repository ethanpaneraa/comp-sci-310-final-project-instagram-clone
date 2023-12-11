import React from "react"; 
import { useState, useEffect } from "react";
import axios from "axios"; 
type user = {
    username: string, 
    email: string, 
    lastname: string, 
    firstname: string, 
    password: string,
    userid: number, 
};

export default function Followers() {

    const [user, setUser] = useState<user>({
        username: "", 
        email: "", 
        lastname: "", 
        firstname: "", 
        password: "",
        userid: 0,
    });
    const [followers, setFollowers] = useState<user[]>([]);

    useEffect(() => {
        const userFromStorage = localStorage.getItem("user");
        if (userFromStorage) {
            const user = JSON.parse(userFromStorage);
            setUser(user.data);
            console.log(user.data); 
        }
    }, []);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/users/followers/${user.userid}`);
                if (response.data.message === 'success') {
                    const fetchedFollowers: user[] = response.data.data;
                    setFollowers(fetchedFollowers);
                    console.log(fetchedFollowers);
                }
            } catch (error) {
                console.error('Error fetching followers:', error);
            }; 
        };
        if (user.userid) {
            fetchFollowers();
        }
    }, [user.userid]);


    return (
        <>
            <div className="container mx-auto p-4 mt-20 bg-white dark:bg-white">
                <h1 className="text-xl font-bold mb-4 text-black dark:text-black">Followers</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-black dark:text-black">
                    {followers.map((follower, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded shadow">
                            <h2 className="text-lg font-semibold text-black dark:text-black">{follower.username}</h2>
                            <p>{follower.firstname} {follower.lastname}</p>
                            <p className="text-sm text-gray-600 text-black dark:text-black">{follower.email}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};