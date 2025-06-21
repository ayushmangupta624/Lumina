'use client';
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSpaceModal } from "@/app/layout";
import SpaceHeader from "@/components/spaces/SpaceHeader";
import VideoGrid from "@/components/spaces/VideoGrid";
import FileList from "@/components/spaces/FileList";
import { X, Upload, File, ImageIcon, Film, FileText, FileAudio, FileArchive, Trash2, Loader2, Plus } from "lucide-react";
import { useUser } from "@civic/auth/react";

const SpacePage = () => {
    const { spaceId } = useParams();
    const router = useRouter();
    const { setIsModalOpen: setIsCreateSpaceModalOpen } = useSpaceModal();
    const [isCreateVideoModalOpen, setIsCreateVideoModalOpen] = useState(false);
    const [videoPrompt, setVideoPrompt] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [vids, setVids] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useUser(); 
    const spId = spaceId as string;

    const sampleVideos = [
        { id: '1', title: 'Introduction to Quantum Physics', thumbnailUrl: 'https://picsum.photos/seed/quantum/300/200' },
        { id: '2', title: 'The History of AI', thumbnailUrl: 'https://picsum.photos/seed/ai/300/200' },
        { id: '3', title: 'Understanding Blockchain Technology', thumbnailUrl: 'https://picsum.photos/seed/blockchain/300/200' },
        { id: '4', title: 'Basics of Machine Learning', thumbnailUrl: 'https://picsum.photos/seed/ml/300/200' },
        { id: '5', title: 'Exploring Renewable Energy', thumbnailUrl: 'https://picsum.photos/seed/energy/300/200' },
    ];

    const sampleFiles = [
        { id: 'f1', name: 'Quantum Physics Syllabus', type: 'pdf', url: '#' },
       
    ];

    const getFileIcon = (fileTypeOrMime: string) => {
        const lowerCaseType = fileTypeOrMime.toLowerCase();
        if (lowerCaseType.includes('pdf')) return <FileText className="w-5 h-5 text-red-400" />;
        if (lowerCaseType.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-400" />;
        if (lowerCaseType.includes('video')) return <Film className="w-5 h-5 text-green-400" />;
        if (lowerCaseType.includes('audio')) return <FileAudio className="w-5 h-5 text-purple-400" />;
        if (lowerCaseType.includes('wordprocessingml') || lowerCaseType.includes('text')) return <FileText className="w-5 h-5 text-white/60" />;
        
        return <File className="w-5 h-5 text-white/60" />;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            console.log("No files detected", files);
            return;
        }
        console.log("event.target files", files);
        const filesArray = Array.from(files);
        console.log("array", filesArray);

        setSelectedFiles(prevFiles => {
            const newFiles = [...prevFiles, ...filesArray];
            return newFiles;
        });
    };

    const handleRemoveFile = (fileName: string) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
    };

    const handleSubmitVideoCreation = async () => {
        if (!videoPrompt.trim()) {
            alert("Please enter a prompt for your video.");
            return;
        }
        setIsProcessing(true);
        const formData = new FormData();
        formData.append("prompt", videoPrompt);
        selectedFiles.forEach((file) => {
            formData.append("files", file);
        });
        try {
            const response = await fetch("http://127.0.0.1:8000/generate-manim/", {
                method: "POST",
                body: formData,
            });
            if (response.ok) {
                const result = await response.json();
                console.log(result)
                const { video_url, main_content_url } = result;
                const dbRes = await fetch(`/api/spaces/${spaceId}/videos/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: videoPrompt.slice(0, 50),
                        prompt: videoPrompt,
                        videoFilePath: video_url,
                        spaceId:spaceId,
                        mainContentUrl:main_content_url
                    }),
                });
                console.log(video_url)
                if (dbRes.ok) {
                    const dbVideo = await dbRes.json();
                    router.push(`/spaces/${spaceId}/videos/${dbVideo.videoId}`);
                } else {
                    alert("Failed to save video to database.");
                }
            } else {
                alert("Failed to create video. Please try again.");
            }
        } catch (error) {
            alert("An error occurred. Please check console.");
        } finally {
            setIsProcessing(false);
            setIsCreateVideoModalOpen(false);
            setVideoPrompt("");
            setSelectedFiles([]);
        }
    };

    useEffect(() => {
        const fetchVids = async () => {
          try {
            const res = await fetch(`/api/spaces/${spaceId}/videos`);
            const data = await res.json();
            setVids(data.videos);

          } catch (error) {
            console.error("Error fetching videos:", error);
            setVids([]);
          } finally {
            setLoading(false);
          }
        };
    
        if (user?.email) {
          fetchVids();
        } else {
          setLoading(false);
        }
      }, [user?.email, spaceId]);

    return (        
        <div className="min-h-screen bg-black text-white">
            <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto p-6 md:p-8">
                <SpaceHeader 
                    spaceName={spaceId as string} 
                    onCreateVideo={() => setIsCreateVideoModalOpen(true)} 
                />
                
                <VideoGrid videos={vids} spaceId={spId}/>

                <FileList files={sampleFiles} />

                {/* Create Video Modal */}
                {isCreateVideoModalOpen && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
                        <div className="bg-white/10 border border-white/20 rounded-xl p-6 w-[90vw] h-[90vh] max-w-4xl flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Create New Video</h2>
                                <button
                                    onClick={() => {
                                        setIsCreateVideoModalOpen(false);
                                        setSelectedFiles([]);
                                        setVideoPrompt("");
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-lg hover:cursor-pointer transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                            
                            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="videoPrompt" className="block text-sm font-medium text-white/80 mb-2">Video Prompt</label>
                                    <textarea
                                        id="videoPrompt"
                                        placeholder="Enter your prompt here... (e.g., Explain quantum entanglement in simple terms)"
                                        value={videoPrompt}
                                        onChange={(e) => setVideoPrompt(e.target.value)}
                                        className="flex-1 w-full p-4 bg-white/5  border border-white/10 rounded-lg focus:outline-none text-white resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-3">Upload Files</h3>
                                        <label htmlFor="newFileUpload" className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-dashed border-white/30 h-24">
                                            <Upload className="w-6 h-6" />
                                            Drag & Drop or Click to Browse
                                            <input 
                                                type="file" 
                                                id="newFileUpload" 
                                                className="hidden" 
                                                multiple 
                                                ref={fileInputRef} 
                                                onChange={handleFileChange} 
                                            />
                                        </label>
                                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedFiles.length === 0 ? (
                                                <p className="text-white/60 text-sm p-2">No files selected yet.</p>
                                            ) : (
                                                selectedFiles.map((file, index) => (
                                                    <div key={file.name + index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            {getFileIcon(file.type || file.name.split('.').pop() || '')}
                                                            <span className="text-white text-sm truncate">{file.name}</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => handleRemoveFile(file.name)}
                                                            className="p-1 text-white/60 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col sm:flex-row justify-end gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2 hover:cursor-pointer px-4 py-2 bg-[#1f7d48] text-gray-100 font-medium rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    <Upload className="w-5 h-5" />
                                    Upload More Files
                                </button>
                                <button
                                    onClick={handleSubmitVideoCreation}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 hover:cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-400 to-green-400 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                    {isProcessing ? 'Generating...' : 'Create Video'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpacePage; 