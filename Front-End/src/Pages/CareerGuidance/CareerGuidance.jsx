import { useEffect, useState } from "react";
import "./Styles/cg.css";

export default function CareerGuidance() {
    const [recommendation, setRecommendation] = useState(null);
    const [firstJobRole, setFirstJobRole] = useState("Intern Software Engineer");
    const [dreamJobTitle, setDreamJobTitle] = useState(
        "Senior Software Engineer"
    );

    const renderLines = (text) => {
        if (!text) return <p>No information available.</p>;
        // Split by newlines or commas
        const lines = text.split(",").filter((line) => line.trim() !== "");
        return (
            <ul>
                {lines.map((line, index) => (
                    <li key={index} className="list-disc ml-4">
                        {line}
                    </li>
                ))}
            </ul>
        );
    };

    const fetchRecommendation = async () => {
        const studentData = {
            first_job_role: firstJobRole,
            dream_job_title: dreamJobTitle,
        };

        try {
            const response = await fetch("http://localhost:8000/recommendation/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(studentData),
            });
            const data = await response.json();
            setRecommendation(data.recommendation);
        } catch (error) {
            console.error("Error fetching recommendation:", error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchRecommendation();
    };

    return (
        <div class="dashboard-content">
            <div class="">
                <main class="">
                    <div class="" style={{ marginBottom: '20px' }}>
                        <form onSubmit={handleSubmit} class="form">
                            <div class="form-group">
                                <label for="first_job_role" class="label">
                                    First Job Role
                                </label>
                                <input
                                    id="first_job_role"
                                    type="text"
                                    value={firstJobRole}
                                    onChange={(e) => setFirstJobRole(e.target.value)}
                                    class="input"
                                    placeholder="Enter first job role"
                                />
                            </div>

                            <div class="form-group">
                                <label for="dream_job_title" class="label">
                                    Dream Job Title
                                </label>
                                <input
                                    id="dream_job_title"
                                    type="text"
                                    value={dreamJobTitle}
                                    onChange={(e) => setDreamJobTitle(e.target.value)}
                                    class="input"
                                    placeholder="Enter dream job title"
                                />
                            </div>

                            <button type="submit" class="button">
                                Get Recommendation
                            </button>
                        </form>
                    </div>
                    {recommendation ? (
                        <div class="">
                            <div class="p-4 bg-white shadow-lg rounded-lg" style={{ marginBottom: '20px' }}>
                                <h3 class="font-semibold text-lg">
                                    You can undertake courses like:
                                </h3>
                                <p>{renderLines(recommendation.courses)}</p>
                            </div>
                            <div class="p-4 bg-white shadow-lg rounded-lg" style={{ marginBottom: '20px' }}>
                                <h3 class="font-semibold text-lg">
                                    You can do Certifications like:
                                </h3>
                                <p>{renderLines(recommendation.certifications)}</p>
                            </div>
                            <div class="p-4 bg-white shadow-lg rounded-lg" style={{ marginBottom: '20px' }}>
                                <h3 class="font-semibold text-lg">
                                    You need to develop programming languages like:
                                </h3>
                                <p>{renderLines(recommendation.languages)}</p>
                            </div>
                            <div class="p-4 bg-white shadow-lg rounded-lg" style={{ marginBottom: '20px' }}>
                                <h3 class="font-semibold text-lg">Specialize in IT Skills:</h3>
                                <p>{renderLines(recommendation.skills)}</p>
                            </div>
                            <div class="p-4 bg-white shadow-lg rounded-lg" style={{ marginBottom: '20px' }}>
                                <h3 class="font-semibold text-lg">Advice for Students</h3>
                                <p>{renderLines(recommendation.advice)}</p>
                            </div>
                            <div class="p-4 bg-white shadow-lg rounded-lg" style={{ marginBottom: '20px' }}>
                                <h3 class="font-semibold text-lg">Extracurricular Activities</h3>
                                <p>{renderLines(recommendation.extracurricular)}</p>
                            </div>
                            <div class="p-4 bg-white shadow-lg rounded-lg" style={{ marginBottom: '20px' }}>
                                <h3 class="font-semibold text-lg">
                                    Mentorship and guidance play a role in career advancement:
                                </h3>
                                <p>{renderLines(recommendation.mentorship)}</p>
                            </div>
                            <div class="p-4 bg-white shadow-lg rounded-lg" style={{ marginBottom: '20px' }}>
                                <h3 class="font-semibold text-lg">
                                    You can stay updated with the latest trends and technologies in
                                    the IT sector by:
                                </h3>
                                <p>{renderLines(recommendation.update)}</p>
                            </div>
                        </div>
                    ) : (
                        <p>Loading recommendations...</p>
                    )}
                </main>
            </div>
        </div>
    );
}
