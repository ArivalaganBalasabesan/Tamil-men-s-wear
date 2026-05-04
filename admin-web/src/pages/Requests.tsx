import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { MessageCircle, CheckCircle, Reply, User, Image as ImageIcon } from 'lucide-react';

interface SupportRequest {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  subject: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'responded' | 'closed';
  adminResponse?: string;
  createdAt: string;
}

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [activeRequest, setActiveRequest] = useState<SupportRequest | null>(null);

  const getTokenConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/requests/all', getTokenConfig());
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest) return;

    try {
      await axios.put(`/requests/${activeRequest._id}/respond`, { 
        adminResponse: replyText 
      }, getTokenConfig());
      
      setReplyText('');
      setActiveRequest(null);
      fetchRequests();
    } catch (err) {
      console.error('Error responding to request:', err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/requests/${id}/status`, { status }, getTokenConfig());
      fetchRequests();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <MessageCircle size={24} />
          </div>
          <div>
            <h1>Support & Custom Requests</h1>
            <p>Manage and respond to personalized customer inquiries</p>
          </div>
        </div>
      </div>

      <div className="requests-container">
        <div className="requests-list">
          {loading ? (
            <div className="loading">Loading requests...</div>
          ) : requests.map((req) => (
            <div 
              key={req._id} 
              className={`request-item ${activeRequest?._id === req._id ? 'active' : ''}`}
              onClick={() => setActiveRequest(req)}
            >
              <div className="request-item-header">
                <span className={`status-pill ${req.status}`}>
                  {req.status.toUpperCase()}
                </span>
                <span className="request-date">{new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
              <h3 className="request-subject">{req.subject}</h3>
              <div className="request-user">
                <User size={14} />
                <span>{req.userId?.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="request-detail-view">
          {activeRequest ? (
            <div className="detail-card">
              <div className="detail-header">
                <h2>{activeRequest.subject}</h2>
                <div className="detail-actions">
                  <button 
                    className="status-btn success" 
                    onClick={() => updateStatus(activeRequest._id, 'closed')}
                  >
                    <CheckCircle size={18} />
                    <span>Close Ticket</span>
                  </button>
                </div>
              </div>

              <div className="detail-body">
                <div className="user-message">
                  <div className="msg-header">
                    <strong>{activeRequest.userId?.name}</strong> ({activeRequest.userId?.email})
                  </div>
                  <p>{activeRequest.description}</p>
                  {activeRequest.imageUrl && (
                    <div className="msg-attachment">
                      <ImageIcon size={16} />
                      <a href={activeRequest.imageUrl} target="_blank" rel="noreferrer">View Attachment</a>
                    </div>
                  )}
                </div>

                {activeRequest.adminResponse && (
                  <div className="admin-message">
                    <div className="msg-header">Admin Response</div>
                    <p>{activeRequest.adminResponse}</p>
                  </div>
                )}
              </div>

              {activeRequest.status !== 'closed' && (
                <div className="reply-section">
                  <form onSubmit={handleResponse}>
                    <textarea 
                      placeholder="Type your response here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    />
                    <button type="submit" className="send-btn">
                      <Reply size={18} />
                      <span>Send Response</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-detail">
              <MessageCircle size={48} />
              <p>Select a request to view details and respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
