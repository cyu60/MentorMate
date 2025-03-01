import type React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-2">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            About{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
              MentorMate
            </span>
          </h1>
          <p className="max-w-prose mx-auto text-lg text-gray-700">
            Exploring the synergy of generative AI and personalized formative feedback.
          </p>
        </div>

        {/* Introductory Text */}
        <div className="bg-white/70 shadow-lg p-6 rounded-xl transition-shadow hover:shadow-2xl">
          <p className="mx-auto text-md text-gray-800 text-justify">
            MentorMate investigates how generative AI can enhance formative feedback in educational contexts, with a special focus on hackathons and project-based learning. Our research explores the intersection of AI and pedagogy to understand how automated systems can provide meaningful, personalized feedback that drives student growth. By studying the core elements of effective feedback and their implementation through AI, we aim to develop solutions that scale high-quality mentorship while maintaining the human touch that makes feedback impactful.
          </p>
        </div>

        {/* Formative Feedback Overview */}
        <section className="bg-white/70 shadow-lg p-6 rounded-xl transition-shadow hover:shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Formative Feedback Overview (Engineering &amp; CS)
          </h2>
          <p className="text-gray-800 text-md mb-4">
            Research in engineering and computer science education underscores the critical role of formative feedback in improving student learning{" "}
            <a href="#ref1" className="text-blue-900 underline hover:text-blue-700">
              [1]
            </a>.
            Effective formative feedback is characterized by several key elements that make it more meaningful for learners:
          </p>
          <ul className="space-y-4 text-md">
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-900 flex-shrink-0 mt-1 mr-2" />
              <span>
                <strong>Goal-Oriented:</strong> Feedback should be linked to clear learning goals or criteria, ensuring purposefulness.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-900 flex-shrink-0 mt-1 mr-2" />
              <span>
                <strong>Specific and Clear:</strong> Concrete strengths and weaknesses must be highlighted.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-900 flex-shrink-0 mt-1 mr-2" />
              <span>
                <strong>Actionable:</strong> Learners should easily identify next steps for improvement.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-900 flex-shrink-0 mt-1 mr-2" />
              <span>
                <strong>Timely:</strong> Prompt and continuous feedback greatly enhances real-time corrections.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-900 flex-shrink-0 mt-1 mr-2" />
              <span>
                <strong>Understandable:</strong> Communicated in a student-friendly way without overly technical jargon.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-900 flex-shrink-0 mt-1 mr-2" />
              <span>
                <strong>Supportive:</strong> Encouraging and motivational tone fosters self-efficacy.
              </span>
            </li>
          </ul>
          <p className="text-gray-800 mt-4 text-md">
            In short, formative feedback in engineering and CS should continuously “feed forward” into the learning process, making the student&apos;s learning visible and providing concrete guidance for improvement. When done well (specific, actionable, timely, and encouraging), such feedback has been shown to significantly enhance student achievement and skill development{" "}
            <a href="#ref1" className="text-blue-900 underline hover:text-blue-700">
              [1]
            </a>.
          </p>
        </section>

        {/* Generative AI in Hackathons */}
        <section className="bg-white/70 shadow-lg p-6 rounded-xl transition-shadow hover:shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Generative AI in Hackathons</h2>
          <p className="text-gray-800 mb-4">
            Hackathon environments are fast-paced and project-driven, and generative AI is emerging as a powerful tool to boost formative feedback during these events. AI models can act as virtual mentors for teams, providing on-demand suggestions, corrections, and insights. Participants often leverage AI tools to accelerate their work, receive instant feedback, and refine their projects more efficiently{" "}
            <a href="#ref2" className="text-blue-900 underline hover:text-blue-700">
              [2]
            </a>.
          </p>
          <p className="text-gray-800 mb-4">
            However, challenges like over-reliance, AI bias, ethical concerns, and fairness in judging do arise. Some participants default to AI-suggested ideas without critical thinking, and questions of originality and attribution surface. To mitigate these issues, hackathon organizers are encouraged to implement guidelines that promote collaborative learning and equitable AI use{" "}
            <a href="#ref2" className="text-blue-900 underline hover:text-blue-700">
              [2]
            </a>.
          </p>
        </section>

        {/* Expanding to Broader Educational Contexts */}
        <section className= "bg-white/70 shadow-lg p-6 rounded-xl transition-shadow hover:shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Expanding to Broader Educational Contexts</h2>
          <p className="text-gray-800 mb-4 text-md">
            Beyond hackathons, generative AI is transforming formative feedback in more formal educational settings, particularly in computer science classrooms. Automated and AI-driven feedback systems can handle programming assignments at scale, providing instant evaluations and actionable hints while the problem is fresh in the student&apos;s mind{" "}
            <a href="#ref3" className="text-blue-900 underline hover:text-blue-700">
              [3]
            </a>.
          </p>
          <p className="text-gray-800 mb-4">
            Key research indicates that specific, actionable feedback leads to better learning outcomes than generic feedback. For instance, highlighting the exact difference between a student&apos;s output and the expected result can curb trial-and-error guessing, prompting genuine engagement with the material{" "}
            <a href="#ref3" className="text-blue-900 underline hover:text-blue-700">
              [3]
            </a>.
          </p>
          <p className="text-gray-800 mb-4">
            While AI-driven tools offer scalability, consistency, and personalization, their limitations include potentially superficial feedback or unrecognized innovative solutions. Educators must ensure AI feedback systems are refined and used in ways that encourage deeper thinking, rather than simply handing out correct answers{" "}
            <a href="#ref4" className="text-blue-900 underline hover:text-blue-700">
              [4]
            </a>.
          </p>
        </section>

        {/* References Section */}
        <section className="p-6 rounded-xl transition-shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-3" id="references">
            References
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-800 text-md">
            <li id="ref1">
              <a
                href="https://www.researchgate.net/publication/344697432_Leveraging_the_Force_of_Formative_Assessment_and_Feedback_for_Effective_Engineering_Education"
                className="text-blue-900 underline hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Leveraging the Force of Formative Assessment and Feedback for Effective Engineering Education
              </a>
              . ResearchGate, 2020.
            </li>
            <li id="ref2">
              <a
                href="https://www.mdpi.com/2504-2289/8/12/188"
                className="text-blue-900 underline hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Integrating Generative AI in Hackathons: Opportunities, Challenges, and Educational Implications
              </a>
              . MDPI, 2023.
            </li>
            <li id="ref3">
              <a
                href="https://par.nsf.gov/servlets/purl/10281509"
                className="text-blue-900 underline hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Towards understanding the effective design of automated formative feedback for programming assignments
              </a>
              . NSF Public Access Repository, 2023.
            </li>
            <li id="ref4">
              <a
                href="https://www.ucl.ac.uk/teaching-learning/case-studies/2024/oct/developing-students-genai-literacy-hackathons"
                className="text-blue-900 underline hover:text-blue-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                Developing students&apos; GenAI literacy with hackathons
              </a>
              . UCL Teaching &amp; Learning, 2024.
            </li>
          </ol>
        </section>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link
            href="/select"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-gray-800 transition-colors duration-300 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
