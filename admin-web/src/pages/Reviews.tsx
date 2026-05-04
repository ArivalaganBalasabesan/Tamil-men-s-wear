import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { MessageSquare, Star, User, Calendar } from 'lucide-react';

interface Review {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const getTokenConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/reviews', getTokenConfig());
      setReviews(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);



  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1>Product Reviews</h1>
            <p>Monitor and moderate customer feedback across all products</p>
          </div>
        </div>
      </div>

      <div className="reviews-grid">
        {loading ? (
          <div className="loading-state">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="empty-state">No reviews found.</div>
        ) : reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-card-header">
              <div className="product-info-mini">
                <img 
                  src={review.productId?.images?.[0] || 'https://via.placeholder.com/50'} 
                  alt="Product" 
                />
                <div>
                  <span className="product-name">{review.productId?.name}</span>
                  <div className="rating-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < review.rating ? "#FFD700" : "none"} 
                        stroke={i < review.rating ? "#FFD700" : "#ccc"} 
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="review-body">
              <p>"{review.comment}"</p>
            </div>

            <div className="review-footer">
              <div className="user-meta">
                <User size={14} />
                <span>{review.userId?.name}</span>
              </div>
              <div className="date-meta">
                <Calendar size={14} />
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
