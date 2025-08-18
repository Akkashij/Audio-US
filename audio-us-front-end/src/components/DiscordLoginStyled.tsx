"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils" // Vẫn sử dụng cn utility để kết hợp các lớp Tailwind

export default function DiscordLoginStyled() {
  const [loading, setLoading] = useState(false)

  const handleDiscordLogin = () => {
    try {
      setLoading(true)
      window.location.href = process.env.NEXT_PUBLIC_DISCORD_OAUTH_URL || "https://discord.com/oauth2/authorize"
    } catch (error) {
      console.error("Login error:", error)
      alert("Failed to start login process. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Cột trái: Form đăng nhập */}
      <div className="w-full lg:w-1/3 flex items-center justify-center bg-white p-8">
        <div className="max-w-md w-full space-y-6 text-center lg:text-left">
          {/* Phần Logo */}
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
            <Image
              src="/icons/audio-us-logo.png"
              alt="AudioUS Logo"
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold text-[#5865F2] tracking-tight">AudioUS</span>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-3xl font-extrabold text-gray-900">Log in to your account</h1>
          <p className="text-base text-gray-600">Continue with Discord to access your account.</p>

          {/* Nút Đăng nhập Discord */}
          <button
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-md bg-[#5865F2] hover:bg-[#4E5D94] text-white font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5865F2] focus:ring-opacity-50",
              loading ? "opacity-60 cursor-not-allowed" : "", // Áp dụng lớp disabled nếu loading
            )}
            onClick={handleDiscordLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Image
                  src="/icons/audio-us-logo.png?height=22&width=22"
                  alt="Discord Icon"
                  width={22}
                  height={22}
                  className="mr-1"
                />
                <span>Continue with Discord</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cột phải: Tiếp thị/Minh họa */}
      <div className="hidden lg:flex w-full lg:w-2/3 items-center justify-center bg-[#23272A] p-8">
        <div className="max-w-xl text-white text-center lg:text-left space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">
            AudioUS: Empowering audio collaboration for modern teams.
          </h2>
          <p className="text-lg text-gray-300">
            Seamlessly connect, create, and collaborate on audio projects with AI-powered features and secure
            communication.
          </p>
          {/* Placeholder cho hình minh họa hoặc thiết kế trừu tượng */}
          <div className="mt-8 flex justify-center lg:justify-start">
          </div>
        </div>
      </div>
    </div>
  )
}
