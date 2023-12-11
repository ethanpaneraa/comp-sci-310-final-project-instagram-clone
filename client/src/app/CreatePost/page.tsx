"use client"; 
import React from "react"; 
import { NextUIProvider } from "@nextui-org/react";
import NavigationBar from "../_components/NavigationBar/NavigationBar";
import CreatePost from "../_components/CreatePost/CreatePost";

export default function CreatePostPage() {
    return (
        <>
            <NextUIProvider>
                <div className="bg-white dark:bg-white">
                    <NavigationBar />
                    <CreatePost />
                </div>
            </NextUIProvider>
        </>
    );
};