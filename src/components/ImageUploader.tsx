
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
    onFilesSelect: (files: File[]) => void;
    selectedFiles: File[];
    title?: string;
}

const ImagePreview: React.FC<{ file: File, onRemove: () => void }> = ({ file, onRemove }) => {
    const [preview, setPreview] = useState<string | null>(null);

    React.useEffect(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [file, preview]);

    return (
        <div className="relative group w-32 h-32 rounded-lg overflow-hidden shadow-md animate-fade-in">
            {preview ? (
                <img src={preview} alt={file.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-slate-200 animate-pulse"></div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center">
                <button onClick={onRemove} className="text-white bg-red-500 rounded-full p-1.5 hover:bg-red-600 transition-colors" aria-label="Remove image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelect, selectedFiles, title }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, 5); // Limit to 5 files
        onFilesSelect(newFiles);
    }, [onFilesSelect, selectedFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        multiple: true
    });

    const handleRemoveFile = (indexToRemove: number) => {
        const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        onFilesSelect(newFiles);
    };

    return (
        <div className="space-y-4 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-700">{title || 'Hình ảnh Bệnh nhân'}</h3>
            <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-100'
                }`}
            >
                <input {...getInputProps()} />
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-slate-600">
                        <span className="font-semibold text-blue-600">Nhấp để tải lên</span> hoặc kéo và thả
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG, WEBP (Tối đa 5 ảnh)</p>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-sm text-slate-600 mb-2">Ảnh đã chọn:</h4>
                    <div className="flex flex-wrap gap-4">
                        {selectedFiles.map((file, index) => (
                           <ImagePreview key={`${file.name}-${index}`} file={file} onRemove={() => handleRemoveFile(index)} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
