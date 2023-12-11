"use client";
import React from "react"; 
import { useState, useEffect } from "react"; 
import { NextUIProvider } from "@nextui-org/react"; 
import LoginForm from "../LoginForm/LoginForm";
import RegisterForm from "../RegisterForm/RegisterForm";
import MainPage from "../MainPage/MainPage";
import axios from "axios";
import { Main } from "next/document";

type user = {
    username: string, 
    email: string, 
    lastname: string, 
    firstname: string, 
    password: string,
};

type LoginData = {
    email: string;
    password: string;
};

type RegisterData = {
    username: string;
    email: string;
    lastname: string;
    firstname: string;
    password: string;
};


export default function HomePage() {

    const [user, setUser] = useState<user>({
        username: "", 
        email: "", 
        lastname: "", 
        firstname: "", 
        password: "",
    });

    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [toggleForm, setToggleForm] = useState(false);

    const handleLogin = (loginData: LoginData) => {
        axios.post("http://localhost:3000/api/users/login", loginData).then((res) => {
            console.log(res.data);
            setUser(res.data);
            setIsUserLoggedIn(true);
            localStorage.setItem("loggedIN", "true");
            localStorage.setItem("user", JSON.stringify(res.data));
            console.log(localStorage.getItem("user"));
        }).catch((err) => {
            console.log(err);
        });
    };
    
    const handleRegister = (registerData: RegisterData) => {
        axios.post("http://localhost:3000/api/users/register", registerData).then((res) => {
            console.log(res.data);
            setUser(res.data);
            setIsUserLoggedIn(true);
            localStorage.setItem("loggedIN", "true");
            localStorage.setItem("user", JSON.stringify(res.data));
            console.log(localStorage.getItem("user"));
            window.location.href = "/"; 
        }).catch((err) => {
            console.log(err);
        });
    };

    useEffect(() => {
        const loggedIn = localStorage.getItem("loggedIN");
        if (loggedIn === "true") {
            setIsUserLoggedIn(true);
            console.log("User is logged in");
            console.log(localStorage.getItem("user"));
        }
    }, []);

    return (
        <>
            <NextUIProvider>
                {isUserLoggedIn ? (
                    <>
                        <MainPage />
                    </>
                ) : (
                    toggleForm ? (
                        <RegisterForm 
                            handleRegister={handleRegister} 
                            setToggleForm={setToggleForm}
                            toggleForm={toggleForm}
                        />
                    ) : (
                        <LoginForm 
                            handleLogin={handleLogin} 
                            setToggleForm={setToggleForm} 
                            toggleForm={toggleForm}
                        />
                    )
                )}
            </NextUIProvider>
        </>
    );
};