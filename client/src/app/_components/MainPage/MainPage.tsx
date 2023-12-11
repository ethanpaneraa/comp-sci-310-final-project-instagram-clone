import React from "react"; 
import NavigationBar from "../NavigationBar/NavigationBar";
import Feed from "../Feed/Feed";
export default function MainPage() {

    return (
        <div className="bg-white dark:bg-white">
            <NavigationBar />
            <Feed />
        </div>
    );
};