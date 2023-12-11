"use client"; 
import React from "react"; 
import { NextUIProvider } from "@nextui-org/react";
import LoginForm from "../_components/LoginForm/LoginForm";

export default function LoginPage() {
    return (
        <>
            <NextUIProvider>
                <LoginForm />
            </NextUIProvider>
        </>
    );
};