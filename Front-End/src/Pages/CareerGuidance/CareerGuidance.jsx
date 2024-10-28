// import { useEffect, useState } from "react";
// import "./Styles/cg.css";
// import backgroundImage from "../CareerGuidance/img/careerprogress.jpg";

// export default function CareerGuidance() {
//   const [recommendation, setRecommendation] = useState(null);
//   const [firstJobRole, setFirstJobRole] = useState("Intern Software Engineer");
//   const [dreamJobTitle, setDreamJobTitle] = useState(
//     "Senior Software Engineer"
//   );

//   const renderLines = (text) => {
//     if (!text) return <p>No information available.</p>;
//     // Split by newlines or commas
//     const lines = text.split(",").filter((line) => line.trim() !== "");
//     return (
//       <ul>
//         {lines.map((line, index) => (
//           <li key={index} className="list-disc ml-4">
//             {line}
//           </li>
//         ))}
//       </ul>
//     );
//   };

//   const fetchRecommendation = async () => {
//     const studentData = {
//       first_job_role: firstJobRole,
//       dream_job_title: dreamJobTitle,
//     };

//     try {
//       const response = await fetch("http://localhost:8000/recommendation/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(studentData),
//       });
//       const data = await response.json();
//       setRecommendation(data.recommendation);
//     } catch (error) {
//       console.error("Error fetching recommendation:", error);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     fetchRecommendation();
//   };

//   return (
//     <div
//       class="dashboard-content"
//       style={{
//         backgroundColor: "#C4E1F6",
//       }}
//     >
//       <div class="">
//         <main class="">
//           {/* <div className="" style={{ marginBottom: "20px",backgroundColor:"#C4E1F6" ,width:"full",padding: "10px"}}> */}
//           {!recommendation ? (
//             <div
//               className="form-container"
//               style={{
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 height: "100vh",
//                 backgroundColor: "#C4E1F6",
//               }}
//             >
//               <form
//                 onSubmit={handleSubmit}
//                 className=""
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   backgroundColor: "#ffffff",
//                   padding: "20px",
//                   // border: "2px solid",
//                   borderRadius: "25px",
//                   gap: "20px",
//                   alignItems: "center",
//                 }}
//                 //   style={{ display: "flex", gap: "20px", alignItems: "center" }}
//               >
//                 <div className="form-group" style={{ flex: 1 }}>
//                   <label htmlFor="first_job_role" className="label">
//                     First Job Role
//                   </label>
//                   <input
//                     id="first_job_role"
//                     type="text"
//                     value={firstJobRole}
//                     onChange={(e) => setFirstJobRole(e.target.value)}
//                     className="input"
//                     placeholder="Enter first job role"
//                     style={{ width: "100%" }}
//                   />
//                 </div>

//                 <div className="form-group" style={{ flex: 1 }}>
//                   <label htmlFor="dream_job_title" className="label">
//                     Dream Job Title
//                   </label>
//                   <input
//                     id="dream_job_title"
//                     type="text"
//                     value={dreamJobTitle}
//                     onChange={(e) => setDreamJobTitle(e.target.value)}
//                     className="input"
//                     placeholder="Enter dream job title"
//                     style={{ width: "100%" }}
//                   />
//                 </div>

//                 <div
//                   style={{
//                     width: "full",
//                     height: "80px",
//                     display: "flex",
//                     alignItems: "end",
//                     marginBottom: "7px",
//                   }}
//                 >
//                   <button
//                     type="submit"
//                     className="button"
//                     style={{ flex: "0 0 auto" }}
//                   >
//                     Get Recommendation
//                   </button>
//                 </div>
//               </form>
//             </div>
//           ) : (
//             <div className="" style={{ marginBottom: "20px" }}>
//               <form
//                 onSubmit={handleSubmit}
//                 style={{
//                   display: "flex",
//                   gap: "20px",
//                   alignItems: "center",
//                   backgroundColor: "#ffffff",
//                   padding: "20px",
//                   borderRadius: "20px",
//                 }}
//               >
//                 <div className="form-group" style={{ flex: 1 }}>
//                   <label htmlFor="first_job_role" className="label">
//                     First Job Role
//                   </label>
//                   <input
//                     id="first_job_role"
//                     type="text"
//                     value={firstJobRole}
//                     onChange={(e) => setFirstJobRole(e.target.value)}
//                     className="input"
//                     placeholder="Enter first job role"
//                     style={{ width: "100%" }}
//                   />
//                 </div>

//                 <div className="form-group" style={{ flex: 1 }}>
//                   <label htmlFor="dream_job_title" className="label">
//                     Dream Job Title
//                   </label>
//                   <input
//                     id="dream_job_title"
//                     type="text"
//                     value={dreamJobTitle}
//                     onChange={(e) => setDreamJobTitle(e.target.value)}
//                     className="input"
//                     placeholder="Enter dream job title"
//                     style={{ width: "100%" }}
//                   />
//                 </div>

//                 <div
//                   style={{
//                     width: "full",
//                     height: "80px",
//                     display: "flex",
//                     alignItems: "end",
//                     marginBottom: "7px",
//                   }}
//                 >
//                   <button
//                     type="submit"
//                     className="button"
//                     style={{ flex: "0 0 auto" }}
//                   >
//                     Get Recommendation
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}

//           {recommendation ? (
//             // <div class="parent">
//             //   <div class="div1"> </div>
//             //   <div class="div2"> </div>
//             //   <div class="div3"> </div>
//             //   <div class="div4"> </div>
//             //   <div class="div5"> </div>
//             //   <div class="div6"> </div>
//             //   <div class="div7"> </div>
//             //   <div class="div8"> </div>
//             // </div>
//             <div class="parent">
//               <div
//                 class="p-4 bg-white shadow-lg rounded-lg div1"
//                 style={{
//                   marginBottom: "20px",
//                   backgroundImage: `url(${backgroundImage})`, // Use the imported background image
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                   backgroundRepeat: "no-repeat",
//                 }}
//               >
//                 <div
//                   style={{
//                     top: "50%",
//                     left: "50%",
//                     backgroundColor: "#FFBD73",
//                     padding: "20px",
//                     borderRadius: "25px", // Rounded corners
//                     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Shadow for the pop-up
//                     zIndex: "1000", // Ensure it's above other content
//                     textAlign: "center", // Center the text
//                     marginBottom: "20px",
//                   }}
//                 >
//                   <h3 className="font-semibold text-lg text-center">
//                     Career Progress
//                   </h3>
//                 </div>
//                 <h3 class="font-semibold text-lg">
//                   You can undertake courses like:
//                 </h3>
//                 <p>{renderLines(recommendation.courses)}</p>
//               </div>
//               <div
//                 class="p-4 bg-white shadow-lg rounded-lg div2"
//                 style={{ marginBottom: "20px" }}
//               >
//                 <h3 class="font-semibold text-lg">
//                   You can do Certifications like:
//                 </h3>
//                 <p>{renderLines(recommendation.certifications)}</p>
//               </div>
//               <div
//                 class="p-4 bg-white shadow-lg rounded-lg div3"
//                 style={{ marginBottom: "20px" }}
//               >
//                 <div
//                   style={{
//                     top: "50%",
//                     left: "50%",
//                     backgroundColor: "#F5F4B3",
//                     padding: "20px",
//                     borderRadius: "25px", // Rounded corners
//                     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Shadow for the pop-up
//                     zIndex: "1000", // Ensure it's above other content
//                     textAlign: "center", // Center the text
//                     marginBottom: "20px",
//                   }}
//                 >
//                   <h3 className="font-semibold text-lg text-center">
//                     Skill Gap Analysis
//                   </h3>
//                 </div>

//                 <h3 class="font-semibold text-lg">
//                   You need to develop programming languages like:
//                 </h3>
//                 <p>{renderLines(recommendation.languages)}</p>
//               </div>
//               <div
//                 class="p-4 bg-white shadow-lg rounded-lg div4"
//                 style={{ marginBottom: "20px" }}
//               >
//                 <h3 class="font-semibold text-lg">Specialize in IT Skills:</h3>
//                 <p>{renderLines(recommendation.skills)}</p>
//               </div>
//               <div
//                 class="p-4 bg-white shadow-lg rounded-lg div5"
//                 style={{ marginBottom: "20px" }}
//               >
//                 <div
//                   style={{
//                     top: "50%",
//                     left: "50%",
//                     backgroundColor: "#8ABFA3",
//                     padding: "20px",
//                     borderRadius: "25px", // Rounded corners
//                     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Shadow for the pop-up
//                     zIndex: "1000", // Ensure it's above other content
//                     textAlign: "center", // Center the text
//                     marginBottom: "20px",
//                   }}
//                 >
//                   <h3 className="font-semibold text-lg text-center">
//                     Mentorship Suggestions
//                   </h3>
//                 </div>
//                 <h3 class="font-semibold text-lg">Advice for Students</h3>
//                 <p>{renderLines(recommendation.advice)}</p>
//               </div>
//               <div
//                 class="p-4 bg-white shadow-lg rounded-lg div6"
//                 style={{ marginBottom: "20px" }}
//               >
//                 <h3 class="font-semibold text-lg">
//                   Extracurricular Activities
//                 </h3>
//                 <p>{renderLines(recommendation.extracurricular)}</p>
//               </div>
//               <div
//                 class="p-4 bg-white shadow-lg rounded-lg div7"
//                 style={{ marginBottom: "20px" }}
//               >
//                 <h3 class="font-semibold text-lg">
//                   Mentorship and guidance play a role in career advancement:
//                 </h3>
//                 <p>{renderLines(recommendation.mentorship)}</p>
//               </div>
//               <div
//                 class="p-4 bg-white shadow-lg rounded-lg div8 "
//                 style={{ marginBottom: "20px" }}
//               >
//                 <h3 class="font-semibold text-lg">
//                   You can stay updated with the latest trends and technologies
//                   in the IT sector by:
//                 </h3>
//                 <p>{renderLines(recommendation.update)}</p>
//               </div>
//             </div>
//           ) : (
//             <p>Loading recommendations...</p>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import "./Styles/cg.css";
import backgroundImage from "../CareerGuidance/img/cp4.png"; // Image outside CareerGuidance folder
import backgroundImage2 from "../CareerGuidance/img/certification2.png";
import backgroundImage3 from "../CareerGuidance/img/skillgapanalysis.png";
import backgroundImage4 from "../CareerGuidance/img/skills.png";
import backgroundImage5 from "../CareerGuidance/img/mentoringstd.png";
import backgroundImage6 from "../CareerGuidance/img/ecactivities.png";
import backgroundImage7 from "../CareerGuidance/img/mentor.png";
import backgroundImage8 from "../CareerGuidance/img/onlinecourses.png";

export default function CareerGuidance() {
  const [recommendation, setRecommendation] = useState(null);
  const [firstJobRole, setFirstJobRole] = useState("Intern Software Engineer");
  const [dreamJobTitle, setDreamJobTitle] = useState(
    "Senior Software Engineer"
  );
  const [loading, setLoading] = useState(false); // State to manage loading

  const renderLines = (text) => {
    if (!text) return <p>No information available.</p>;
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

    setLoading(true); // Set loading to true before the fetch
    try {
      const response = await fetch("http://127.0.0.1:8000/api/service4/recommendation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(studentData),
      });
      const data = await response.json();
      setRecommendation(data.recommendation);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setLoading(false); // Set loading to false after the fetch is complete
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRecommendation();
  };

  return (
    <div className="dashboard-content" style={{ backgroundColor: "#C4E1F6" }}>
      <main>
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group left-form">
              <label htmlFor="first_job_role" className="label">
                First Job Role
              </label>
              <input
                id="first_job_role"
                type="text"
                value={firstJobRole}
                onChange={(e) => setFirstJobRole(e.target.value)}
                className="input"
                placeholder="Enter first job role"
              />
            </div>

            <div className="form-group right-form">
              <label htmlFor="dream_job_title" className="label">
                Dream Job Title
              </label>
              <input
                id="dream_job_title"
                type="text"
                value={dreamJobTitle}
                onChange={(e) => setDreamJobTitle(e.target.value)}
                className="input"
                placeholder="Enter dream job title"
              />
            </div>

            <div className="submit-button-container">
              <button type="submit" className="button">
                Get Recommendation
              </button>
            </div>
          </form>
        </div>

        {/* Display loading indicator */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading recommendations...</p>
          </div>
        )}

        {/* Display recommendations below the form */}
        {recommendation && (
          <div className="box-container">
            <div
              className="box"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            >
              <h3 className="enhanced-text">Career Progress</h3>
              <h3>You can undertake courses like:</h3>
              {renderLines(recommendation.courses)}
            </div>
            <div
              className="box"
              style={{ backgroundImage: `url(${backgroundImage2})` }}
            >
              <h3>You can do Certifications like:</h3>
              {renderLines(recommendation.certifications)}
            </div>
            <div
              className="box"
              style={{ backgroundImage: `url(${backgroundImage3})` }}
            >
              <h3 className="enhanced-text">Skill Gap Analysis</h3>
              <h3>You need to develop programming languages like:</h3>
              {renderLines(recommendation.languages)}
            </div>
            <div
              className="box"
              style={{ backgroundImage: `url(${backgroundImage4})` }}
            >
              <h3>Specialize in IT Skills:</h3>
              {renderLines(recommendation.skills)}
            </div>
            <div
              className="box"
              style={{ backgroundImage: `url(${backgroundImage5})` }}
            >
              <h3 className="enhanced-text">Mentonship Suggestions</h3>
              <h3>Advice for Students:</h3>
              {renderLines(recommendation.advice)}
            </div>
            <div
              className="box"
              style={{ backgroundImage: `url(${backgroundImage6})` }}
            >
              <h3>Extracurricular Activities:</h3>
              {renderLines(recommendation.extracurricular)}
            </div>
            <div
              className="box"
              style={{ backgroundImage: `url(${backgroundImage7})` }}
            >
              <h3>Mentorship and guidance in career advancement:</h3>
              {renderLines(recommendation.mentorship)}
            </div>
            <div
              className="box"
              style={{ backgroundImage: `url(${backgroundImage8})` }}
            >
              <h3>Stay updated with the latest trends:</h3>
              {renderLines(recommendation.update)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
