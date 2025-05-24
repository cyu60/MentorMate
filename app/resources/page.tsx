
import { Footer } from "@/components/layout/footer";
import ResourcesLayout from "@/components/resources/resourcesLayout";

export default function Resources() {
    return (
    <div className="min-h-full bg-gray-50 pt-10 text-center">            
            <div className="text-center mb-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900">
                    Resources
                </h1>
                <p className="mt-2 text-gray-600">
                    Check out these resources to help you get started with your projects.
                </p>
            </div>

            <ResourcesLayout />

            <div className="absolute bottom-0 w-full">   
                <Footer />
            </div>
        </div>
    );
}