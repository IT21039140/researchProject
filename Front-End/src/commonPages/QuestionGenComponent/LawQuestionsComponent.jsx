import React from 'react';
import jsPDF from 'jspdf';

function LawQuestionsComponent({ questionSets }) {
  const handleCreatePDF = () => {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let currentY = margin;

    pdf.setFontSize(16);
    pdf.setTextColor(40);
    pdf.text('Law Questions', pageWidth / 2, currentY, { align: 'center' });
    currentY += lineHeight * 2;

    pdf.setFontSize(12);

    Object.keys(questionSets).forEach((setKey, index) => {
      const set = questionSets[setKey];
      
      // Add question set title
      if (currentY + lineHeight * 2 > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        currentY = margin;
      }
      
      pdf.setFontSize(14);
      pdf.setTextColor(0, 51, 102); // Dark blue for titles
      pdf.text(set.title, margin, currentY);
      currentY += lineHeight * 1.5;
      
      // Add questions with wrapped text
      pdf.setFontSize(12);
      pdf.setTextColor(0);

      set.questions.split('\n').forEach((line, idx) => {
        const wrappedText = pdf.splitTextToSize(line, maxLineWidth);
        
        if (currentY + wrappedText.length * lineHeight > pdf.internal.pageSize.getHeight()) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.text(wrappedText, margin, currentY);
        currentY += wrappedText.length * lineHeight;
      });

      currentY += lineHeight * 1.5; // Extra space between question sets
    });

    pdf.save('Law_Questions.pdf');
  };

  return (
    <div className="law-questions-container">
      <button className="pdf-button" onClick={handleCreatePDF} style={{ marginBottom: '20px' }}>
        Create PDF
      </button>
      {Object.keys(questionSets).map((setKey, index) => {
        const set = questionSets[setKey];
        return (
          <div key={index} className="question-set">
            <h3>{set.title}</h3>
            <div className="questions">
              {set.questions.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LawQuestionsComponent;
