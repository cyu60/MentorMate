import type React from "react"
import Link from "next/link"
// import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar";

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 "> 
            <Navbar />
            <div className="flex items-center justify-center p-4">
                <div className="max-w-3xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="md:flex">
                    <div className="md:flex-shrink-0">
                        {/* <Image
                            className="h-48 w-full object-cover md:w-48"
                            src="/mentormate.png"
                            alt="MentorMate"
                            width={192}
                            height={192}
                        /> */}
                    </div>
                    <div className="p-8">
                        <div className="uppercase tracking-wide text-sm text-blue-700 font-semibold">About Us</div>
                        <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Welcome to MentorMate
                        </h1>
                        <p className="mt-4 max-w-2xl text-xl text-gray-700">
                        We are dedicated to providing the best mentorship and guidance to help you achieve your goals.
                        </p>
                        <div className="mt-6 prose prose-indigo prose-lg text-gray-700 mx-auto">
                        <p>
                            Our team of experienced mentors is here to support you every step of the way. Whether you&apos;re looking to
                            improve your skills, advance your career, or simply learn something new, we&apos;ve got you covered.
                        </p>
                        <p>Thank you for choosing MentorMate. We look forward to working with you!</p>
                        </div>
                        <div className="mt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                        >
                            Get Started
                            <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
                        </Link>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutPage

