import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';

interface ClaudeLog {
  id: string;
  vehicle_id: string;
  request_prompt: string;
  response_text: string;
  model_used: string;
  tokens_used: number | null;
  created_at: string;
}

const AILogs: React.FC = () => {
  const [logs, setLogs] = useState<ClaudeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const logsData = await adminService.getClaudeLogs(100);
        setLogs(logsData);
      } catch (error) {
        setError('Failed to load AI logs');
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const parseResponse = (responseText: string): any => {
    try {
      return JSON.parse(responseText);
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <Link to="/admin" style={{ color: '#2196F3', textDecoration: 'none' }}>
            ← Back to Admin Dashboard
          </Link>
        </div>
        <h1>Prior Anthropic Calls</h1>
        <p>Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <Link to="/admin" style={{ color: '#2196F3', textDecoration: 'none' }}>
            ← Back to Admin Dashboard
          </Link>
        </div>
        <h1>Prior Anthropic Calls</h1>
        <p style={{ color: '#d32f2f' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/admin" style={{ color: '#2196F3', textDecoration: 'none' }}>
          ← Back to Admin Dashboard
        </Link>
      </div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 5px 0' }}>Prior Anthropic Calls</h1>
        <p style={{ margin: '0', color: '#666' }}>
          Historical API requests and responses from Claude AI for maintenance recommendations
        </p>
      </div>

      {logs.length === 0 ? (
        <div style={{ 
          border: '1px solid #ddd', 
          padding: '40px', 
          borderRadius: '8px', 
          textAlign: 'center',
          color: '#666'
        }}>
          No AI logs found. Logs will appear here after recommendations are generated.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
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
                  width: '180px',
                  minWidth: '180px'
                }}>
                  Date/Time
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '2px solid #ddd',
                  width: '40%'
                }}>
                  Request
                </th>
                <th style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  borderBottom: '2px solid #ddd',
                  width: '40%'
                }}>
                  Response
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const parsedResponse = parseResponse(log.response_text);
                const responseContent = parsedResponse?.content?.[0]?.text || 'Unable to parse response';
                const isExpanded = expandedLogId === log.id;
                
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ 
                      padding: '12px', 
                      verticalAlign: 'top',
                      fontSize: '14px'
                    }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      verticalAlign: 'top',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        maxHeight: isExpanded ? 'none' : '200px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <pre style={{ 
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: '#333',
                          backgroundColor: '#f8f9fa',
                          padding: '10px',
                          borderRadius: '4px',
                          border: '1px solid #e0e0e0',
                          textAlign: 'left'
                        }}>
                          {log.request_prompt}
                        </pre>
                        {log.request_prompt.length > 500 && !isExpanded && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '40px',
                            background: 'linear-gradient(transparent, #f8f9fa)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: '5px'
                          }}>
                            <button
                              onClick={() => setExpandedLogId(log.id)}
                              style={{
                                fontSize: '12px',
                                color: '#4CAF50',
                                background: 'white',
                                border: '1px solid #4CAF50',
                                padding: '2px 8px',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              Show More
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      verticalAlign: 'top',
                      fontSize: '14px'
                    }}>
                      <div style={{
                        maxHeight: isExpanded ? 'none' : '200px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <pre style={{ 
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          fontSize: '13px',
                          color: '#333',
                          backgroundColor: '#e8f5e9',
                          padding: '10px',
                          borderRadius: '4px',
                          border: '1px solid #c8e6c9',
                          textAlign: 'left'
                        }}>
                          {responseContent}
                        </pre>
                        {responseContent.length > 500 && !isExpanded && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '40px',
                            background: 'linear-gradient(transparent, #e8f5e9)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: '5px'
                          }}>
                            <button
                              onClick={() => setExpandedLogId(log.id)}
                              style={{
                                fontSize: '12px',
                                color: '#4CAF50',
                                background: 'white',
                                border: '1px solid #4CAF50',
                                padding: '2px 8px',
                                borderRadius: '3px',
                                cursor: 'pointer'
                              }}
                            >
                              Show More
                            </button>
                          </div>
                        )}
                      </div>
                      {isExpanded && (
                        <button
                          onClick={() => setExpandedLogId(null)}
                          style={{
                            marginTop: '10px',
                            fontSize: '12px',
                            color: '#666',
                            background: 'white',
                            border: '1px solid #999',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Show Less
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AILogs;