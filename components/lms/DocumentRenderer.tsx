
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, FileText, Download, ExternalLink } from 'lucide-react';
import type { Lecture } from '@/types/course';

interface DocumentRendererProps {
  lecture: Lecture;
  onNext: () => void;
  onPrevious: () => void;
  onMarkComplete: () => void;
  isCompleted: boolean;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({
  lecture,
  onNext,
  onPrevious,
  onMarkComplete,
  isCompleted
}) => {
  const [selectedAttachment, setSelectedAttachment] = useState(lecture.attachments?.[0]);

  const handleDownload = (attachment: any) => {
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob(['Sample document content'], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${attachment.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Mark as complete after download
    onMarkComplete();
  };

  const handleViewAttachment = (attachment: any) => {
    window.open(`/attachment/${lecture.id}/${attachment.id}`, '_blank');
    onMarkComplete();
  };

  return (
    <div className="flex-1 bg-black flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-400 max-w-4xl w-full">
          <div className="mb-6">
            <FileText className="w-16 h-16 text-[#fdb606] mx-auto mb-4" />
            <h2 className="text-2xl mb-4 text-white">{lecture.title}</h2>
            <p className="mb-8 text-lg">{lecture.description}</p>
          </div>
          
          {isCompleted && (
            <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
              <CheckCircle className="w-5 h-5" />
              <span>Completed</span>
            </div>
          )}

          {lecture.attachments && lecture.attachments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Available Resources:</h3>
              <div className="grid gap-4 max-w-2xl mx-auto">
                {lecture.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="p-4 border border-[#3e4143] rounded-lg hover:border-[#fdb606] transition-colors group bg-[#2d2f31]"
                  >
                    <h4 className="font-medium text-white group-hover:text-[#fdb606] mb-2">
                      {attachment.title}
                    </h4>
                    <p className="text-sm text-gray-400 mb-3">{attachment.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#fdb606] capitalize">{attachment.type}</span>
                        {attachment.fileSize && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">{attachment.fileSize}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewAttachment(attachment)}
                          size="sm"
                          variant="outline"
                          className="text-white border-[#3e4143] hover:bg-[#3e4143]"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDownload(attachment)}
                          size="sm"
                          className="bg-[#fdb606] hover:bg-[#e6a406] text-black"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#2d2f31] p-6 border-t border-[#3e4143] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Lecture {lecture.id}</span>
            <span className="capitalize">{lecture.type}</span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
