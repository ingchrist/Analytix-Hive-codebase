
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, ThumbsUp, Reply, Send } from 'lucide-react';

interface Question {
  id: number;
  title: string;
  content: string;
  author: string;
  timestamp: number;
  lectureId: number;
  createdAt: Date;
  answers: Answer[];
  likes: number;
}

interface Answer {
  id: number;
  content: string;
  author: string;
  createdAt: Date;
  likes: number;
}

interface QATabProps {
  lectureId: number;
  lectureTitle: string;
  currentTime: number;
}

export const QATab: React.FC<QATabProps> = ({ lectureId, lectureTitle, currentTime }) => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      title: "How do I center a div?",
      content: "I'm having trouble centering a div element both horizontally and vertically. What's the best modern approach?",
      author: "student123",
      timestamp: 120,
      lectureId: 5,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 3,
      answers: [
        {
          id: 1,
          content: "You can use Flexbox! Set display: flex, justify-content: center, and align-items: center on the parent container.",
          author: "instructor",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          likes: 5
        }
      ]
    },
    {
      id: 2,
      title: "Best practices for responsive design?",
      content: "What are the key principles I should follow when making my website responsive across different devices?",
      author: "webdev_newbie",
      timestamp: 350,
      lectureId: 7,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      likes: 7,
      answers: [
        {
          id: 2,
          content: "Start with mobile-first design, use flexible grid layouts, and always test on real devices!",
          author: "senior_dev",
          createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
          likes: 4
        },
        {
          id: 3,
          content: "Don't forget about accessibility! Use semantic HTML and proper ARIA labels.",
          author: "accessibility_expert",
          createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
          likes: 3
        }
      ]
    }
  ]);
  
  const [isAsking, setIsAsking] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleAskQuestion = () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) return;

    const question: Question = {
      id: Date.now(),
      title: newQuestion.title,
      content: newQuestion.content,
      author: 'You',
      timestamp: currentTime,
      lectureId,
      createdAt: new Date(),
      answers: [],
      likes: 0
    };

    setQuestions(prev => [question, ...prev]);
    setNewQuestion({ title: '', content: '' });
    setIsAsking(false);
  };

  const handleReply = (questionId: number) => {
    if (!replyContent.trim()) return;

    const newAnswer: Answer = {
      id: Date.now(),
      content: replyContent,
      author: 'You',
      createdAt: new Date(),
      likes: 0
    };

    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, answers: [...q.answers, newAnswer] }
        : q
    ));

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleLikeQuestion = (questionId: number) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, likes: q.likes + 1 } : q
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#3e4143]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-white">Q&A</h3>
          {!isAsking && (
            <Button
              onClick={() => setIsAsking(true)}
              size="sm"
              className="bg-[#fdb606] hover:bg-[#e6a406] text-black"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ask Question
            </Button>
          )}
        </div>
        <p className="text-gray-400 text-sm">Ask questions and get help from the community</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isAsking && (
          <div className="mb-4 p-4 bg-[#3e4143] rounded-lg">
            <div className="space-y-3">
              <Input
                placeholder="What's your question about?"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                className="bg-[#2d2f31] border-[#5e6163] text-white"
              />
              <Textarea
                placeholder="Provide more details about your question..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, content: e.target.value }))}
                className="bg-[#2d2f31] border-[#5e6163] text-white min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAskQuestion}
                  size="sm"
                  className="bg-[#fdb606] hover:bg-[#e6a406] text-black"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Ask Question
                </Button>
                <Button
                  onClick={() => {
                    setIsAsking(false);
                    setNewQuestion({ title: '', content: '' });
                  }}
                  size="sm"
                  variant="outline"
                  className="text-white border-[#5e6163] hover:bg-[#3e4143]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="bg-[#3e4143] rounded-lg p-4">
              <div className="mb-3">
                <h4 className="font-medium text-white text-sm mb-1">{question.title}</h4>
                <p className="text-gray-300 text-sm mb-2">{question.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>by {question.author}</span>
                    <span>•</span>
                    <span>At {formatTime(question.timestamp)}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(question.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleLikeQuestion(question.id)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-[#fdb606] h-6 px-2"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {question.likes}
                    </Button>
                    <Button
                      onClick={() => setReplyingTo(replyingTo === question.id ? null : question.id)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white h-6 px-2"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>

              {/* Answers */}
              {question.answers.length > 0 && (
                <div className="ml-4 border-l-2 border-[#5e6163] pl-4 space-y-3">
                  {question.answers.map((answer) => (
                    <div key={answer.id} className="bg-[#2d2f31] rounded p-3">
                      <p className="text-gray-300 text-sm mb-2">{answer.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <span>by {answer.author}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(answer.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{answer.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === question.id && (
                <div className="mt-3 ml-4 border-l-2 border-[#fdb606] pl-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write your answer..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="bg-[#2d2f31] border-[#5e6163] text-white"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReply(question.id)}
                        size="sm"
                        className="bg-[#fdb606] hover:bg-[#e6a406] text-black"
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Post Answer
                      </Button>
                      <Button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        size="sm"
                        variant="outline"
                        className="text-white border-[#5e6163] hover:bg-[#3e4143]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
