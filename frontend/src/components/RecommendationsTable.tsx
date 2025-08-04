import React from 'react';

interface RecommendationSection {
  title: string;
  items: string[];
}

interface RecommendationsTableProps {
  recommendations: string;
}

const RecommendationsTable: React.FC<RecommendationsTableProps> = ({ recommendations }) => {
  // Parse the recommendations text into sections
  const parseRecommendations = (text: string): RecommendationSection[] => {
    const sections: RecommendationSection[] = [];
    
    // Define the section patterns we're looking for
    const sectionPatterns = [
      { pattern: /1\.\s*Immediate\/Soon\s*\([^)]+\):\s*([\s\S]*?)(?=\n\d\.|\n*$)/i, title: 'Immediate/Soon (0-5,000 miles)' },
      { pattern: /2\.\s*Next Service\s*\([^)]+\):\s*([\s\S]*?)(?=\n\d\.|\n*$)/i, title: 'Next Service (5,000-15,000 miles)' },
      { pattern: /3\.\s*Future Services\s*\([^)]+\):\s*([\s\S]*?)(?=\n\d\.|\n*$)/i, title: 'Future Services (15,000+ miles)' },
      { pattern: /4\.\s*Regular Maintenance Schedule:\s*([\s\S]*?)(?=\n\d\.|\n*$)/i, title: 'Regular Maintenance Schedule' },
      { pattern: /5\.\s*Model-Specific Recommendations:\s*([\s\S]*?)(?=\n\d\.|\n*$)/i, title: 'Model-Specific Recommendations' }
    ];
    
    for (const { pattern, title } of sectionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Split the content into individual items
        const content = match[1].trim();
        const items = content
          .split(/\n[-•*]|\n\d+\./)
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        if (items.length > 0) {
          sections.push({ title, items });
        }
      }
    }
    
    // If no sections were parsed, try to create a generic section
    if (sections.length === 0) {
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        sections.push({ title: 'Maintenance Recommendations', items: lines });
      }
    }
    
    return sections;
  };

  const sections = parseRecommendations(recommendations);

  return (
    <div style={{ padding: '20px' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #ddd',
        backgroundColor: '#fff'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{
              padding: '12px',
              textAlign: 'left',
              borderBottom: '2px solid #ddd',
              width: '30%',
              verticalAlign: 'top',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Timeframe
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'left',
              borderBottom: '2px solid #ddd',
              width: '70%',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Recommendations
            </th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{
                padding: '16px',
                verticalAlign: 'top',
                fontWeight: 'bold',
                color: '#4CAF50',
                backgroundColor: '#f8f9fa',
                borderRight: '1px solid #ddd'
              }}>
                {section.title}
              </td>
              <td style={{ padding: '16px', verticalAlign: 'top', textAlign: 'left' }}>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  listStyleType: 'disc',
                  textAlign: 'left'
                }}>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} style={{
                      marginBottom: itemIndex < section.items.length - 1 ? '8px' : '0',
                      lineHeight: '1.6',
                      color: '#333'
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {sections.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>No structured recommendations available.</p>
          <pre style={{
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            maxWidth: '800px',
            margin: '20px auto',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {recommendations}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RecommendationsTable;