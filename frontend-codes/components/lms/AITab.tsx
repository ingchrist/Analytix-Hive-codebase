
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, FileText, Brain, Download } from 'lucide-react';

interface AITabProps {
  lectureTitle: string;
  lectureId: number;
}

interface ChatMessage {
  id: number;
  type: 'ai' | 'user';
  message: string;
}

export const AITab: React.FC<AITabProps> = ({ lectureTitle, lectureId }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      message: `Hi! I'm your AI assistant for "${lectureTitle}". I can help you with questions about the content, generate summaries, or create practice quizzes.`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const transcript = `
[00:00] Welcome to this lesson on HTML fundamentals. In this video, we'll cover the basic structure of HTML documents.

[00:15] HTML, or HyperText Markup Language, is the standard markup language for creating web pages. It describes the structure of a web page using markup.

[00:30] Every HTML document starts with a document type declaration, written as <!DOCTYPE html>. This tells the browser that this is an HTML5 document.

[00:45] The root element of an HTML page is the <html> element. Inside this, we have two main sections: the <head> and the <body>.

[01:00] The <head> element contains metadata about the document - information that isn't displayed on the page but is important for browsers and search engines.

[01:15] The <body> element contains all the visible content of the webpage - text, images, links, and other elements that users can see and interact with.

[01:30] Let's look at some common HTML elements. Headings are created using <h1> through <h6> tags, with <h1> being the most important.

[01:45] Paragraphs are created using the <p> tag. This is one of the most commonly used elements for text content.

[02:00] Links are created using the <a> tag with an href attribute that specifies the destination URL.

[02:15] Images are embedded using the <img> tag with src and alt attributes for the image source and alternative text.
  `;

  const quizQuestions = [
    {
      question: "What does HTML stand for?",
      options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language"],
      correct: 0
    },
    {
      question: "Which element contains the visible content of a webpage?",
      options: ["<head>", "<body>", "<html>"],
      correct: 1
    },
    {
      question: "What is the most important heading element?",
      options: ["<h6>", "<h3>", "<h1>"],
      correct: 2
    }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: inputMessage
    };

    const aiResponse: ChatMessage = {
      id: chatMessages.length + 2,
      type: 'ai',
      message: generateAIResponse(inputMessage)
    };

    setChatMessages([...chatMessages, userMessage, aiResponse]);
    setInputMessage('');
  };

  const generateAIResponse = (question: string) => {
    const responses = [
      "That's a great question! Based on the lecture content, HTML elements are the building blocks of web pages. Each element has a specific purpose and semantic meaning.",
      "According to the video, the <body> element contains all visible content. This includes text, images, links, and interactive elements that users can see.",
      "Great observation! The document structure is crucial in HTML. The <!DOCTYPE html> declaration ensures the browser interprets the document correctly.",
      "You're right to ask about that! Semantic HTML is important for accessibility and SEO. Elements like <header>, <nav>, and <main> provide meaning to content.",
      "That's an excellent point! The difference between block and inline elements affects how content flows on the page. Block elements take full width, while inline elements only take necessary space."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const downloadTranscript = () => {
    const element = document.createElement('a');
    const file = new Blob([transcript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${lectureTitle}-transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-[#3e4143]">
          <TabsTrigger value="chat" className="data-[state=active]:bg-[#fdb606] data-[state=active]:text-black">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="transcript" className="data-[state=active]:bg-[#fdb606] data-[state=active]:text-black">
            <FileText className="w-4 h-4 mr-2" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="quiz" className="data-[state=active]:bg-[#fdb606] data-[state=active]:text-black">
            <Brain className="w-4 h-4 mr-2" />
            AI Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-4">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-[#fdb606] text-black'
                        : 'bg-[#3e4143] text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-[#3e4143]">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask a question about the lecture..."
                className="flex-1 px-3 py-2 bg-[#3e4143] text-white rounded-lg border border-[#5e6163] focus:outline-none focus:border-[#fdb606]"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-[#fdb606] hover:bg-[#e6a406] text-black"
              >
                Send
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transcript" className="flex-1 flex flex-col mt-4">
          <div className="flex justify-between items-center p-4 border-b border-[#3e4143]">
            <h3 className="font-medium text-white">Auto-Generated Transcript</h3>
            <Button
              onClick={downloadTranscript}
              size="sm"
              variant="outline"
              className="text-white border-[#3e4143] hover:bg-[#3e4143]"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {transcript}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="quiz" className="flex-1 flex flex-col mt-4">
          <div className="p-4 border-b border-[#3e4143]">
            <h3 className="font-medium text-white mb-2">AI-Generated Practice Quiz</h3>
            <p className="text-gray-400 text-sm">Test your understanding of the lecture content</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {quizQuestions.map((q, index) => (
                <div key={index} className="bg-[#3e4143] rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">
                    {index + 1}. {q.question}
                  </h4>
                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => (
                      <button
                        key={optIndex}
                        className="w-full text-left p-2 rounded bg-[#2d2f31] hover:bg-[#4e5153] text-gray-300 text-sm transition-colors"
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
