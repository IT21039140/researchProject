import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./commonPages/LogIn/Login";
import Dashboard from "./commonPages/Dashboard/Dashboard";
import RecommendationHome from "./Pages/UniCourseRecommendationPages/RecommendationHome";
import CourseCatalog from "./Pages/UniCourseRecommendationPages/CourseCatalog";
import SortableListComponent from "./Components/UniCourseRecommendationComponenets/DragandDropForm";
import SubjectResultSelector from "./Components/UniCourseRecommendationComponenets/form";
import RankingAnimation from "./Pages/RankingAnimation";
import Leaderboard from "./Pages/UniCourseRecommendationPages/LeaderBoard";
import UserProfile from "./Components/UniCourseRecommendationComponenets/UserProfile";
import RecommendationHistory from "./Pages/UniCourseRecommendationPages/RecommendationHistory";
import  CourseByStream from "./Pages/UniCourseRecommendationPages/CourseByStream";

import MainContent from "./commonPages/Dashboard/MainContent";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" component={RegisterForm} /> */}

        {/* <Route path="/" exact component={LoginForm} /> */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<MainContent />} />
        </Route>
        <Route path="/user-profile" element={<Dashboard />}>
          <Route index element={<UserProfile />} />
        </Route>
        <Route path="/recommendation-History" element={<Dashboard />}>
          <Route index element={<RecommendationHistory />} />
        </Route>
        <Route path="/recommendation" element={<RecommendationHome />} />
        <Route path="/course-catalog" element={<CourseCatalog />} />
        <Route path="/drag-and-drop" element={<SortableListComponent />} />
        <Route path="/subject-result" element={<SubjectResultSelector />} />
        <Route path="/myrecommendations/:id" element={<CourseCatalog />} />
        <Route path="/ranking" element={<RankingAnimation />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/recommendation/courses/:stream" element={<CourseByStream />} />
      </Routes>
    </Router>
  );
}

export default App;

// function App() {
//   return (
//     <div>
//       <Dashboard />
//       {/* <Login /> */}
//     </div>
//   );
// }

// export default App;

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }
