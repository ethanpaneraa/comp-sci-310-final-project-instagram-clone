"use client"; 
"use client"; 
import React from "react"; 
import NavigationBar from "../_components/NavigationBar/NavigationBar";
import Followers from "../_components/Followers/Followers";
export default function FollowersPage() {

    return (
        <>
        <div className="flex flex-col bg-white dark:bg-white w-full">
            <div className="flex flex-grow min-h-screen pt-16">
                <NavigationBar />
                <div className="flex flex-grow min-h-screen lg:pl-64">
                    <Followers />
                </div>
            </div>
        </div>
        </>
    );
};