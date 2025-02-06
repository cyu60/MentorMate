import type React from "react"
import Link from "next/link"
import { ArrowRight, Users, Lightbulb, Target } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-2">
        <Navbar />

        <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    About{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">MentorMate</span>
                </h1>
                {/* <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                    Empowering individuals through personalized mentorship and guidance.
                </p> */}
            </div>

            <div className="space-y-4 text-center">
                {/* <h2 className="text-3xl font-bold text-gray-900">Welcome to MentorMate</h2> */}
                <p className="text-lg text-gray-700">
                    We are dedicated to providing the best mentorship and guidance to help you achieve your goals. Our team of
                    experienced mentors is here to support you every step of the way.
                </p>
                <p className="text-lg text-gray-700">
                    Whether you're looking to improve your skills, advance your career, or simply learn something new, we've got
                    you covered.
                </p>
                <div>
                    <Link
                    href="/login"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-gray-800 transition-colors duration-300"
                    >
                    Get Started
                    <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                    </Link>
                </div>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
                {
                icon: Users,
                title: "Expert Mentors",
                description: "Our mentors are industry professionals with years of experience.",
                },
                {
                icon: Lightbulb,
                title: "Personalized Guidance",
                description: "Tailored advice and support to meet your unique needs and goals.",
                },
                {
                icon: Target,
                title: "Goal-Oriented Approach",
                description: "We help you set and achieve meaningful personal and professional goals.",
                },
            ].map((item, index) => (
                <div key={index} className="text-center bg-white/50 p-4 rounded-md">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-900 mb-4 mx-auto">
                        <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                </div>
            ))}
            </div>

            <div className="mt-16 bg-blue-900 rounded-2xl shadow-xl overflow-hidden">
                <div className="py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    <span className="block">Ready to start your journey?</span>
                    <span className="block text-blue-200">Join MentorMate today.</span>
                    </h2>

                    <div className="mt-8 flex justify-center">
                        <div className="inline-flex rounded-md shadow">
                            <Link
                            href="/sign-up"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-900 bg-white hover:bg-blue-50 transition-colors duration-300"
                            >
                            Sign Up
                            </Link>
                        </div>
                        <div className="ml-3 inline-flex rounded-md shadow">
                            <Link
                            href="/learn-more"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-800 hover:bg-blue-400 transition-colors duration-300"
                            >
                            Learn More
                            </Link>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default AboutPage

