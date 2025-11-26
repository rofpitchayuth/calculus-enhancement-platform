import { useEffect, useState } from "react";
import { marked } from "marked";
import Navbar from "../features/navbar/components/NavBar";
import "./index.css";

import testData from "../test-data.md?raw";

function App() {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    async function renderMarkdown() {
      marked.setOptions({ breaks: true });
      const html = await marked.parse(testData);
      setHtmlContent(html);
    }

    renderMarkdown();
  }, []);

  useEffect(() => {
    const mj = (window as any).MathJax;
    if (mj && mj.typesetPromise) {
      mj.typesetPromise(); 
    }
  }, [htmlContent]);

  return (
    <>

      
      <div className="p-6 flex justify-center w-full">
        <Navbar/>
        <h1 className="text-2xl font-bold mb-6">
          The performance enhancement platform for learning calculus
        </h1>

        <div
          className="prose prose-lg max-w-none "
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </>
  );
}

export default App;
