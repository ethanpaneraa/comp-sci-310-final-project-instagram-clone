"use client"; 
import React from "react"; 
import NavigationBar from "../_components/NavigationBar/NavigationBar";
import Profile from "../_components/Profile/Profile";

export default function Page({ params }: { params: { profileid: string } }) {

    return (
        <div className="flex flex-col bg-white dark:bg-white w-full">
            <div className="flex flex-grow min-h-screen pt-16">
                <NavigationBar />
                <div className="flex flex-grow min-h-screen pt-16 lg:pl-64">
                    <Profile profileid={params.profileid} />
                </div>
            </div>
        </div>
    );
};