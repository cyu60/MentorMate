import type React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/**
 * Rewritten AboutPage with citations integrated from the provided text
 */
const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-2">
      <Navbar />
      <div className="max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-4 space-y-10">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            About{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
              MentorMates
            </span>
          </h1>
        </div>

        {/* Introductory Text */}
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            MentorMates investigates how generative AI can enhance formative
            feedback in educational contexts, with a special focus on hackathons
            and project-based learning. Our research explores the intersection
            of AI and pedagogy to understand how automated systems can provide
            meaningful, personalized feedback that drives student growth. By
            studying the core elements of effective feedback and their
            implementation through AI, we aim to develop solutions that scale
            high-quality mentorship while maintaining the human touch that makes
            feedback impactful.
          </p>
        </div>

        {/* Formative Feedback Overview */}
        <section className="bg-white/50 p-4 rounded-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Formative Feedback Overview (Engineering & CS)
          </h2>
          <p className="text-gray-700 mb-4">
            Research in engineering and computer science education underscores
            the critical role of formative feedback in improving student
            learning{" "}
            <a href="#ref1" className="text-blue-900 hover:underline">
              [1]
            </a>
            . Effective formative feedback is characterized by several key
            elements that make it more meaningful for learners:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li>
              <strong>Goal-Oriented:</strong> Feedback should be linked to clear
              learning goals or criteria, ensuring purposefulness.
            </li>
            <li>
              <strong>Specific and Clear:</strong> Concrete strengths and
              weaknesses must be highlighted.
            </li>
            <li>
              <strong>Actionable:</strong> Learners should easily identify next
              steps for improvement.
            </li>
            <li>
              <strong>Timely:</strong> Prompt and continuous feedback greatly
              enhances real-time corrections.
            </li>
            <li>
              <strong>Understandable:</strong> Communicated in a
              student-friendly way without overly technical jargon.
            </li>
            <li>
              <strong>Supportive:</strong> Encouraging and motivational tone
              fosters self-efficacy.
            </li>
          </ul>
          <p className="text-gray-700 mt-4">
            In short, formative feedback in engineering and CS should
            continuously &quot;feed forward&quot; into the learning process,
            making the student&apos;s learning visible and providing concrete
            guidance for improvement. When done well (specific, actionable,
            timely, and encouraging), such feedback has been shown to
            significantly enhance student achievement and skill development{" "}
            <a href="#ref1" className="text-blue-900 hover:underline">
              [1]
            </a>
            .
          </p>
        </section>

        {/* Generative AI in Hackathons */}
        <section className="bg-white/50 p-4 rounded-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Generative AI in Hackathons
          </h2>
          <p className="text-gray-700 mb-4">
            Hackathon environments are fast-paced and project-driven, and
            generative AI is emerging as a powerful tool to boost formative
            feedback during these events. AI models can act as virtual mentors
            for teams, providing on-demand suggestions, corrections, and
            insights. Participants often leverage AI tools to accelerate their
            work, receive instant feedback, and refine their projects more
            efficiently{" "}
            <a href="#ref2" className="text-blue-900 hover:underline">
              [2]
            </a>
            .
          </p>
          <p className="text-gray-700 mb-4">
            However, challenges like over-reliance, AI bias, ethical concerns,
            and fairness in judging do arise. Some participants default to
            AI-suggested ideas without critical thinking, and questions of
            originality and attribution surface. To mitigate these issues,
            hackathon organizers are encouraged to implement guidelines that
            promote collaborative learning and equitable AI use{" "}
            <a href="#ref2" className="text-blue-900 hover:underline">
              [2]
            </a>
            .
          </p>
        </section>

        {/* Expanding to Broader Educational Contexts */}
        <section className="bg-white/50 p-4 rounded-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Expanding to Broader Educational Contexts
          </h2>
          <p className="text-gray-700 mb-4">
            Beyond hackathons, generative AI is transforming formative feedback
            in more formal educational settings, particularly in computer
            science classrooms. Automated and AI-driven feedback systems can
            handle programming assignments at scale, providing instant
            evaluations and actionable hints while the problem is fresh in the
            student&apos;s mind{" "}
            <a href="#ref3" className="text-blue-900 hover:underline">
              [3]
            </a>
            .
          </p>
          <p className="text-gray-700 mb-4">
            Key research indicates that specific, actionable feedback leads to
            better learning outcomes than generic feedback. For instance,
            highlighting the exact difference between a student&apos;s output
            and the expected result can curb trial-and-error guessing, prompting
            genuine engagement with the material{" "}
            <a href="#ref3" className="text-blue-900 hover:underline">
              [3]
            </a>
            .
          </p>
          <p className="text-gray-700 mb-4">
            While AI-driven tools offer scalability, consistency, and
            personalization, their limitations include potentially superficial
            feedback or unrecognized innovative solutions. Educators must ensure
            AI feedback systems are refined and used in ways that encourage
            deeper thinking, rather than simply handing out correct answers{" "}
            <a href="#ref4" className="text-blue-900 hover:underline">
              [4]
            </a>
            .
          </p>
        </section>

        {/* References section with ids for linking */}
        <section className="bg-white/50 p-4 rounded-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-3" id="references">
            References
          </h2>
          <ol className="list-decimal list-inside space-y-2 pl-4 text-gray-700">
            <li id="ref1">
              <a
                href="https://www.researchgate.net/publication/344697432_Leveraging_the_Force_of_Formative_Assessment_and_Feedback_for_Effective_Engineering_Education"
                className="text-blue-900 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Leveraging the Force of Formative Assessment and Feedback for
                Effective Engineering Education
              </a>
              . ResearchGate, 2020.
            </li>
            <li id="ref2">
              <a
                href="https://www.mdpi.com/2504-2289/8/12/188"
                className="text-blue-900 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Integrating Generative AI in Hackathons: Opportunities,
                Challenges, and Educational Implications
              </a>
              . MDPI, 2023.
            </li>
            <li id="ref3">
              <a
                href="https://par.nsf.gov/servlets/purl/10281509"
                className="text-blue-900 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Towards understanding the effective design of automated
                formative feedback for programming assignments
              </a>
              . NSF Public Access Repository, 2023.
            </li>
            <li id="ref4">
              <a
                href="https://www.ucl.ac.uk/teaching-learning/case-studies/2024/oct/developing-students-genai-literacy-hackathons"
                className="text-blue-900 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Developing students&apos; GenAI literacy with hackathons
              </a>
              . UCL Teaching & Learning, 2024.
            </li>
          </ol>
        </section>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Link
            href="/login?mode=signup"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-900 hover:bg-gray-800 transition-colors duration-300"
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
