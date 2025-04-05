
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Footer } from "@/components/layout/footer";
import Resource from "@/components/resources";

export default function Resources() {
    return (
    <div className="min-h-full bg-gray-50 pt-10 text-center">
            <AuthNavbar />
            
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900">
                    Resources
                </h1>
                <p className="mt-2 text-gray-600">
                    Check out these resources to help you get started with your projects.
                </p>
            </div>

            <Resource />

            <div className="absolute bottom-0 w-full">   
                <Footer />
            </div>
        </div>
    );
}