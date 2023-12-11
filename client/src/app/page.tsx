"use client"; 
import { NextUIProvider } from '@nextui-org/react' 
import HomePage from './_components/Home/Home'
export default function Home() {
  return (
  <>
    <NextUIProvider>
      <HomePage />
    </NextUIProvider>
  </>
  )
}
